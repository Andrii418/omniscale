import { GoogleGenAI } from "@google/genai";
import { CloudNode } from "@/types/infrastructure";
import { SREAnalysisResult } from "@/types/ai-agent";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    overallHealthScore: { type: "number" },
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["critical", "warning", "info"] },
          title: { type: "string" },
          description: { type: "string" },
          recommendation: { type: "string" },
          affectedNodeId: { type: "string" },
          estimatedMonthlySavings: { type: "number" },
        },
        required: ["severity", "title", "description", "recommendation"],
      },
    },
  },
  required: ["summary", "overallHealthScore", "insights"],
};

// Wydzielony "zrzut" stanu infrastruktury w formie czytelnej dla modelu -
// używany zarówno przy pierwszej analizie, jak i w każdej wiadomości czatu,
// żeby agent zawsze miał aktualny kontekst, o czym rozmawiamy.
function buildInfraSnapshot(nodes: CloudNode[]): string {
  return nodes
    .map(
      (n) =>
        `- [${n.id}] ${n.label} (${n.type}, ${n.provider}/${n.region}): status=${n.status}, CPU=${n.metrics.cpuUsage}%, RAM=${n.metrics.memoryUsage}%, koszt=$${n.metrics.costPerHour}/h${n.metrics.latencyMs ? `, latencja=${n.metrics.latencyMs}ms` : ""}`
    )
    .join("\n");
}

function buildAnalysisPrompt(nodes: CloudNode[], language: "pl" | "en"): string {
  const languageInstruction =
    language === "pl" ? "Odpowiadaj WYŁĄCZNIE po polsku." : "Respond ONLY in English.";

  return `Jesteś doświadczonym Site Reliability Engineerem (SRE) analizującym żywą infrastrukturę chmurową.

AKTUALNY STAN INFRASTRUKTURY:
${buildInfraSnapshot(nodes)}

ZADANIE:
Przeanalizuj powyższe zasoby i zwróć zwięzłą analizę SRE: ogólną ocenę zdrowia systemu (0-100),
oraz listę konkretnych spostrzeżeń (insights) — problemów wydajnościowych, ryzyk niezawodności
i możliwości optymalizacji kosztów. Dla węzłów ze statusem "critical" lub "warning" ZAWSZE
dodaj osobny insight z konkretną rekomendacją naprawy. Jeśli widzisz okazję do redukcji kosztów,
oszacuj miesięczne oszczędności w USD.

${languageInstruction}

Odpowiadaj konkretnie i technicznie, jak inżynier do inżyniera.`;
}

export async function analyzeInfrastructure(
  nodes: CloudNode[],
  language: "pl" | "en" = "en"
): Promise<SREAnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: buildAnalysisPrompt(nodes, language),
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini nie zwrócił żadnej odpowiedzi.");
  }

  return JSON.parse(text) as SREAnalysisResult;
}

// Format historii rozmowy zgodny z tym, czego oczekuje Gemini API -
// "model" to odpowiednik roli "assistant" w innych API (np. OpenAI)
export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export async function chatWithAgent(
  nodes: CloudNode[],
  history: ChatTurn[],
  language: "pl" | "en"
): Promise<string> {
  const languageInstruction =
    language === "pl" ? "Odpowiadaj WYŁĄCZNIE po polsku." : "Respond ONLY in English.";

  // Pierwsza "wiadomość" w rozmowie to zawsze kontekst systemowy -
  // przypominamy modelowi, kim jest i jaki jest aktualny stan infrastruktury,
  // żeby każda odpowiedź w czacie odnosiła się do tych samych, realnych danych.
  const systemContext: ChatTurn = {
    role: "user",
    text: `Jesteś doświadczonym Site Reliability Engineerem (SRE) prowadzącym rozmowę z inżynierem
na temat poniższej infrastruktury chmurowej. Odpowiadaj zwięźle (2-5 zdań), konkretnie i technicznie.
${languageInstruction}

AKTUALNY STAN INFRASTRUKTURY:
${buildInfraSnapshot(nodes)}`,
  };
  const acknowledgement: ChatTurn = {
    role: "model",
    text: "Rozumiem stan infrastruktury. Jestem gotowy odpowiadać na pytania.",
  };

  const contents = [systemContext, acknowledgement, ...history].map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents,
  });

  return response.text ?? "Nie udało się wygenerować odpowiedzi.";
}
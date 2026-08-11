import { GoogleGenAI } from "@google/genai";
import { CloudNode } from "@/types/infrastructure";
import { SREAnalysisResult } from "@/types/ai-agent";

// Klient inicjalizowany kluczem z .env.local (dostępny TYLKO po stronie serwera)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Definiujemy schemat JSON, w jakim MUSI odpowiedzieć Gemini.
// Dzięki temu zawsze dostajemy przewidywalną, ustrukturyzowaną odpowiedź
// zamiast losowego tekstu, który trudno byłoby wyświetlić w UI.
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

// Buduje prompt na podstawie aktualnego stanu infrastruktury
function buildPrompt(nodes: CloudNode[], language: "pl" | "en", userQuestion?: string): string {
  const infraSnapshot = nodes
    .map(
      (n) =>
        `- [${n.id}] ${n.label} (${n.type}, ${n.provider}/${n.region}): status=${n.status}, CPU=${n.metrics.cpuUsage}%, RAM=${n.metrics.memoryUsage}%, koszt=$${n.metrics.costPerHour}/h${n.metrics.latencyMs ? `, latencja=${n.metrics.latencyMs}ms` : ""}`
    )
    .join("\n");

  const languageInstruction =
    language === "pl"
      ? "Odpowiadaj WYŁĄCZNIE po polsku."
      : "Respond ONLY in English.";

  return `Jesteś doświadczonym Site Reliability Engineerem (SRE) analizującym żywą infrastrukturę chmurową.

AKTUALNY STAN INFRASTRUKTURY:
${infraSnapshot}

ZADANIE:
Przeanalizuj powyższe zasoby i zwróć zwięzłą analizę SRE: ogólną ocenę zdrowia systemu (0-100),
oraz listę konkretnych spostrzeżeń (insights) — problemów wydajnościowych, ryzyk niezawodności
i możliwości optymalizacji kosztów. Dla węzłów ze statusem "critical" lub "warning" ZAWSZE
dodaj osobny insight z konkretną rekomendacją naprawy. Jeśli widzisz okazję do redukcji kosztów,
oszacuj miesięczne oszczędności w USD.

${languageInstruction}

${userQuestion ? `DODATKOWE PYTANIE UŻYTKOWNIKA: ${userQuestion}` : ""}

Odpowiadaj konkretnie i technicznie, jak inżynier do inżyniera.`;
}

export async function analyzeInfrastructure(
  nodes: CloudNode[],
  language: "pl" | "en" = "en",
  userQuestion?: string
): Promise<SREAnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: buildPrompt(nodes, language, userQuestion),
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
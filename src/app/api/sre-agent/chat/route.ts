import { NextRequest, NextResponse } from "next/server";
import { chatWithAgent, ChatTurn } from "@/lib/gemini";
import { mockNodes } from "@/data/mock-infrastructure";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const history: ChatTurn[] = body?.history ?? [];
    const language: "pl" | "en" = body?.language === "pl" ? "pl" : "en";

    if (history.length === 0) {
      return NextResponse.json({ error: "Brak historii rozmowy." }, { status: 400 });
    }

    const reply = await chatWithAgent(mockNodes, history, language);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Błąd czatu AI SRE Agenta:", error);
    return NextResponse.json(
      { error: "Nie udało się uzyskać odpowiedzi. Sprawdź klucz API." },
      { status: 500 }
    );
  }
}
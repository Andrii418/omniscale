import { NextRequest, NextResponse } from "next/server";
import { analyzeInfrastructure } from "@/lib/gemini";
import { mockNodes } from "@/data/mock-infrastructure";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userQuestion: string | undefined = body?.question;

    // W realnym projekcie te dane pochodziłyby z bazy danych / prawdziwego API chmury.
    // Na razie używamy naszych mockowanych węzłów jako "aktualnego stanu infrastruktury".
    const result = await analyzeInfrastructure(mockNodes, userQuestion);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Błąd AI SRE Agenta:", error);
    return NextResponse.json(
      { error: "Nie udało się przeanalizować infrastruktury. Sprawdź klucz API." },
      { status: 500 }
    );
  }
}
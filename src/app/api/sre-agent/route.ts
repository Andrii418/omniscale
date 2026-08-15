import { NextRequest, NextResponse } from "next/server";
import { analyzeInfrastructure } from "@/lib/gemini";
import { mockNodes } from "@/data/mock-infrastructure";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const language: "pl" | "en" = body?.language === "pl" ? "pl" : "en";

    const result = await analyzeInfrastructure(mockNodes, language);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Błąd AI SRE Agenta:", error);
    return NextResponse.json(
      { error: "Nie udało się przeanalizować infrastruktury. Sprawdź klucz API." },
      { status: 500 }
    );
  }
}
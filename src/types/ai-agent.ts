// Poziom istotności problemu wykrytego przez AI SRE Agenta
export type InsightSeverity = "critical" | "warning" | "info";

// Pojedyncza rekomendacja/spostrzeżenie zwrócone przez Gemini
export interface AIInsight {
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation: string;
  affectedNodeId?: string;
  estimatedMonthlySavings?: number; // w USD, jeśli dotyczy optymalizacji kosztów
}

// Pełna odpowiedź AI SRE Agenta po przeanalizowaniu infrastruktury
export interface SREAnalysisResult {
  summary: string;
  overallHealthScore: number; // 0-100
  insights: AIInsight[];
}

// Wiadomość w oknie czatu (do historii rozmowy)
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysis?: SREAnalysisResult;
  timestamp: number;
}
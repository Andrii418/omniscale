// Poziom logu - wpływa na kolor w terminalu
export type LogLevel = "info" | "success" | "warning" | "error" | "command";

// Pojedyncza linia logu strumieniowana z serwera
export interface DeployLogEntry {
  level: LogLevel;
  message: string;
  nodeId?: string; // powiązanie z węzłem w grafie (do aktualizacji jego statusu)
  progress?: number; // 0-100, jeśli ta linia aktualizuje pasek postępu
  timestamp: number;
}

// Status całego procesu wdrożenia
export type DeploymentPhase = "idle" | "running" | "completed" | "failed";
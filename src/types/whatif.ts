// Rozmiar instancji - mnożnik względem bazowej ceny "medium"
export type InstanceSize = "small" | "medium" | "large" | "xlarge";

export const SIZE_MULTIPLIERS: Record<InstanceSize, number> = {
  small: 0.5,
  medium: 1,
  large: 2,
  xlarge: 4,
};

export const SIZE_LABELS: Record<InstanceSize, string> = {
  small: "t3.small",
  medium: "t3.medium",
  large: "t3.large",
  xlarge: "t3.xlarge",
};

// Pełna konfiguracja scenariusza "what-if"
export interface WhatIfScenario {
  appServerCount: number;
  appServerSize: InstanceSize;
  dbSize: InstanceSize;
  reservedInstances: boolean;
}

export interface CostBreakdown {
  label: string;
  monthlyCost: number;
}
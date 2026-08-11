// Pojedynczy punkt na wykresie czasowym (CPU, RAM, koszt w danej chwili)
export interface MetricPoint {
  time: string; // sformatowana godzina, np. "14:32:05"
  cpu: number; // średnie zużycie CPU całej infrastruktury (%)
  ram: number; // średnie zużycie RAM całej infrastruktury (%)
  cumulativeCost: number; // narastający koszt od uruchomienia panelu (USD)
}

export type AlertSeverity = "critical" | "warning" | "info";

// Pojedynczy alert w logu (jak w Datadog / PagerDuty)
export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  nodeLabel: string;
  message: string;
  timestamp: number;
}
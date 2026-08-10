// Definiuje typy zasobów chmurowych, jakie może symulować OmniScale
export type ResourceType =
  | "load-balancer"
  | "compute"
  | "database"
  | "storage"
  | "cache"
  | "cdn"
  | "serverless";

// Status "zdrowia" węzła - pokazywany kolorem i ikoną w grafie
export type NodeStatus = "healthy" | "warning" | "critical" | "provisioning";

// Metryki, które będziemy symulować dla każdego węzła (użyjemy ich w Etapie 5)
export interface NodeMetrics {
  cpuUsage: number; // 0-100 (%)
  memoryUsage: number; // 0-100 (%)
  costPerHour: number; // USD
  requestsPerSecond?: number;
  latencyMs?: number;
}

// Pełna definicja pojedynczego węzła infrastruktury
export interface CloudNode {
  id: string;
  label: string;
  type: ResourceType;
  status: NodeStatus;
  provider: "aws" | "gcp" | "azure";
  region: string;
  metrics: NodeMetrics;
  description: string;
}

// Połączenie między dwoma węzłami (np. Load Balancer -> Compute)
export interface CloudEdge {
  id: string;
  source: string; // id węzła źródłowego
  target: string; // id węzła docelowego
  animated?: boolean;
}
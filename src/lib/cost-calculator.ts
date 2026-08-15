import { mockNodes } from "@/data/mock-infrastructure";
import { WhatIfScenario, SIZE_MULTIPLIERS, CostBreakdown } from "@/types/whatif";

const HOURS_PER_MONTH = 730;
const RESERVED_DISCOUNT = 0.3; // -30% dla Reserved Instances (realistyczna stawka AWS)

// Bazowe ceny/h pojedynczej instancji "medium" - wyciągnięte z naszych mockowanych danych
const BASE_APP_SERVER_COST = mockNodes.find((n) => n.id === "compute-1")?.metrics.costPerHour ?? 0.0416;
const BASE_DB_COST = mockNodes.find((n) => n.id === "db-1")?.metrics.costPerHour ?? 0.126;

// Koszty stałe, niezależne od scenariusza (load balancer, cache, storage)
const FIXED_HOURLY_COST = mockNodes
  .filter((n) => !["compute-1", "compute-2", "db-1"].includes(n.id))
  .reduce((sum, n) => sum + n.metrics.costPerHour, 0);

// Domyślny scenariusz odzwierciedlający AKTUALNĄ, prawdziwą infrastrukturę
// (2 serwery medium, baza medium, bez Reserved Instances) - punkt odniesienia "Obecnie"
export const BASELINE_SCENARIO: WhatIfScenario = {
  appServerCount: 2,
  appServerSize: "medium",
  dbSize: "medium",
  reservedInstances: false,
};

export function calculateMonthlyCost(scenario: WhatIfScenario): number {
  const appServersHourly =
    scenario.appServerCount * BASE_APP_SERVER_COST * SIZE_MULTIPLIERS[scenario.appServerSize];
  const dbHourly = BASE_DB_COST * SIZE_MULTIPLIERS[scenario.dbSize];

  const computeHourly = appServersHourly + dbHourly;
  const discountedComputeHourly = scenario.reservedInstances
    ? computeHourly * (1 - RESERVED_DISCOUNT)
    : computeHourly;

  const totalHourly = FIXED_HOURLY_COST + discountedComputeHourly;
  return Number((totalHourly * HOURS_PER_MONTH).toFixed(2));
}

export function calculateBreakdown(scenario: WhatIfScenario): CostBreakdown[] {
  const appServersHourly =
    scenario.appServerCount * BASE_APP_SERVER_COST * SIZE_MULTIPLIERS[scenario.appServerSize];
  const dbHourly = BASE_DB_COST * SIZE_MULTIPLIERS[scenario.dbSize];
  const discount = scenario.reservedInstances ? 1 - RESERVED_DISCOUNT : 1;

  return [
    { label: "App Servers", monthlyCost: Number((appServersHourly * discount * HOURS_PER_MONTH).toFixed(2)) },
    { label: "Database", monthlyCost: Number((dbHourly * discount * HOURS_PER_MONTH).toFixed(2)) },
    { label: "Load Balancer + Cache + Storage", monthlyCost: Number((FIXED_HOURLY_COST * HOURS_PER_MONTH).toFixed(2)) },
  ];
}
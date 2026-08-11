"use client";

import { useState, useEffect, useRef } from "react";
import { mockNodes } from "@/data/mock-infrastructure";
import { MetricPoint, AlertItem, AlertSeverity } from "@/types/telemetry";

const MAX_POINTS = 20; // ile ostatnich punktów trzymamy na wykresie
const TICK_INTERVAL_MS = 2000; // co ile symulujemy nowy "odczyt" telemetrii

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Lekka losowa fluktuacja wokół wartości bazowej - symuluje "żywy" system,
// zamiast płaskiej, nudnej linii na wykresie
function jitter(base: number, amount: number): number {
  const next = base + (Math.random() - 0.5) * amount;
  return Math.max(0, Math.min(100, Math.round(next)));
}

export function useLiveMetrics() {
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const cumulativeCostRef = useRef(0);

  useEffect(() => {
    // Alerty startowe - generujemy od razu na podstawie węzłów, które już
    // mają status "warning"/"critical" w naszych mockowanych danych
    const initialAlerts: AlertItem[] = mockNodes
      .filter((n) => n.status === "warning" || n.status === "critical")
      .map((n) => ({
        id: `${n.id}-initial`,
        severity: n.status as AlertSeverity,
        nodeLabel: n.label,
        message:
          n.status === "critical"
            ? `Krytyczne zużycie zasobów: CPU ${n.metrics.cpuUsage}%, RAM ${n.metrics.memoryUsage}%`
            : `Podwyższone obciążenie: CPU ${n.metrics.cpuUsage}%`,
        timestamp: Date.now(),
      }));
    setAlerts(initialAlerts);

    const intervalId = setInterval(() => {
      // Średnia ważona CPU/RAM ze wszystkich węzłów obliczeniowych
      const computeNodes = mockNodes.filter((n) => n.metrics.cpuUsage > 0);
      const avgCpu = computeNodes.reduce((sum, n) => sum + n.metrics.cpuUsage, 0) / computeNodes.length;
      const avgRam = computeNodes.reduce((sum, n) => sum + n.metrics.memoryUsage, 0) / computeNodes.length;

      // Sumaryczny koszt/h całej infrastruktury, przeliczony na "koszt na tick"
      const totalCostPerHour = mockNodes.reduce((sum, n) => sum + n.metrics.costPerHour, 0);
      cumulativeCostRef.current += totalCostPerHour * (TICK_INTERVAL_MS / 3_600_000);

      const newPoint: MetricPoint = {
        time: formatTime(new Date()),
        cpu: jitter(avgCpu, 8),
        ram: jitter(avgRam, 6),
        cumulativeCost: Number(cumulativeCostRef.current.toFixed(4)),
      };

      setHistory((prev) => {
        const next = [...prev, newPoint];
        return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
      });

      // Losowo (ok. 15% szans na tick) generujemy nowy, "świeży" alert,
      // żeby log alertów też wyglądał na żywy, a nie statyczny
      if (Math.random() < 0.15) {
        const candidate = mockNodes[Math.floor(Math.random() * mockNodes.length)];
        const alert: AlertItem = {
          id: `${candidate.id}-${Date.now()}`,
          severity: "info",
          nodeLabel: candidate.label,
          message: `Odczyt telemetrii: CPU ${jitter(candidate.metrics.cpuUsage, 5)}%, RAM ${jitter(candidate.metrics.memoryUsage, 5)}%`,
          timestamp: Date.now(),
        };
        setAlerts((prev) => [alert, ...prev].slice(0, 30));
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return { history, alerts };
}
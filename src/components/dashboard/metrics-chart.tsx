"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MetricPoint } from "@/types/telemetry";

interface MetricsChartProps {
  data: MetricPoint[];
}

export function MetricsChart({ data }: MetricsChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: "#0A0A0C",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.5)" }}
          />
          <Line
            type="monotone"
            dataKey="cpu"
            name="CPU"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="ram"
            name="RAM"
            stroke="#A78BFA"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
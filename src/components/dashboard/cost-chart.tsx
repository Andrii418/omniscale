"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MetricPoint } from "@/types/telemetry";

interface CostChartProps {
  data: MetricPoint[];
}

export function CostChart({ data }: CostChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#0A0A0C",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.5)" }}
            formatter={(value) => [`$${Number(value).toFixed(4)}`, "Koszt narastająco"]}
          />
          <Area
            type="monotone"
            dataKey="cumulativeCost"
            name="Koszt"
            stroke="#06B6D4"
            strokeWidth={2}
            fill="url(#costGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
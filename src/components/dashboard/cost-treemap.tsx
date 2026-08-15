"use client";

import { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { mockNodes } from "@/data/mock-infrastructure";
import { useLanguage } from "@/context/language-context";
import { NodeStatus } from "@/types/infrastructure";

const HOURS_PER_MONTH = 730;

// Ten sam język kolorów co status węzłów na grafie - spójność wizualna
// jest ważniejsza niż "ładniejsza" paleta gdzie indziej w aplikacji
const STATUS_COLORS: Record<NodeStatus, string> = {
  healthy: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
  provisioning: "#A78BFA",
};

interface TreemapDatum {
  name: string;
  size: number;
  status: NodeStatus;
  region: string;
  [key: string]: unknown;
}

function buildTreemapData(): TreemapDatum[] {
  return mockNodes.map((n) => ({
    name: n.label,
    size: Number((n.metrics.costPerHour * HOURS_PER_MONTH).toFixed(2)),
    status: n.status,
    region: n.region,
  }));
}

// Recharts przekazuje do "content" znacznie więcej propsów niż potrzebujemy
// (root, depth, index...) - interesują nas tylko te, które faktycznie rysujemy
interface CellRenderProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  status?: NodeStatus;
}

function TreemapCell(props: CellRenderProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, size, status } = props;
  const color = status ? STATUS_COLORS[status] : "#06B6D4";
  const showLabel = width > 64 && height > 42;
  const showValue = width > 64 && height > 60;

  if (width < 2 || height < 2) return null;

  return (
    <g>
      <rect
        x={x + 2}
        y={y + 2}
        width={Math.max(width - 4, 0)}
        height={Math.max(height - 4, 0)}
        rx={10}
        style={{
          fill: color,
          fillOpacity: 0.16,
          stroke: color,
          strokeWidth: 1.5,
          strokeOpacity: 0.65,
          transition: "fill-opacity 0.2s ease",
        }}
      />
      {showLabel && (
        <text
          x={x + 12}
          y={y + 22}
          fontSize={12}
          fontWeight={600}
          fill="rgba(255,255,255,0.85)"
        >
          {name}
        </text>
      )}
      {showValue && (
        <text x={x + 12} y={y + 40} fontSize={13} fontWeight={700} fill={color}>
          ${size}
        </text>
      )}
    </g>
  );
}

// Własny tooltip - pokazuje procentowy udział w całości, którego
// domyślny tooltip Rechart nie liczy sam z siebie
function TreemapTooltip({
  active,
  payload,
  total,
  shareLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: TreemapDatum }>;
  total: number;
  shareLabel: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  const share = ((datum.size / total) * 100).toFixed(1);
  const color = STATUS_COLORS[datum.status];

  return (
    <div className="bg-[#12141A] border border-cyan-500/25 rounded-lg px-3 py-2 shadow-xl shadow-black/60 text-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-white font-medium">{datum.name}</span>
      </div>
      <div className="text-cyan-300 font-semibold">${datum.size}/mo</div>
      <div className="text-white/40">
        {share}% {shareLabel}
      </div>
    </div>
  );
}

export function CostTreemap() {
  const { t } = useLanguage();
  const [data] = useState<TreemapDatum[]>(buildTreemapData);
  const total = data.reduce((sum, d) => sum + d.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="none"
          isAnimationActive
          animationDuration={500}
          content={<TreemapCell />}
        >
          <Tooltip content={<TreemapTooltip total={total} shareLabel={t("breakdown.shareOfTotal")} />} />
        </Treemap>
      </ResponsiveContainer>

      {/* Legenda statusów pod wykresem */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {(Object.entries(STATUS_COLORS) as [NodeStatus, string][]).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/40 text-[10px] uppercase tracking-wide">{status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
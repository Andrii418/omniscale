"use client";

import { Handle, Position } from "reactflow";
import {
  Server,
  Database,
  Network,
  HardDrive,
  Zap,
  Globe,
  Boxes,
} from "lucide-react";
import { CloudNode, NodeStatus, ResourceType } from "@/types/infrastructure";
import { cn } from "@/lib/utils";

// Mapa typu zasobu -> ikona Lucide
const ICONS: Record<ResourceType, React.ElementType> = {
  "load-balancer": Network,
  compute: Server,
  database: Database,
  storage: HardDrive,
  cache: Zap,
  cdn: Globe,
  serverless: Boxes,
};

// Mapa statusu -> kolory (obramowanie, kropka, tekst)
type StatusStyle = { dot: string; ring: string; text: string };

const STATUS_STYLES: Record<NodeStatus, StatusStyle> = {
  healthy: { dot: "bg-emerald-400", ring: "border-emerald-500/30", text: "text-emerald-400" },
  warning: { dot: "bg-amber-400", ring: "border-amber-500/40", text: "text-amber-400" },
  critical: { dot: "bg-red-500", ring: "border-red-500/50", text: "text-red-400" },
  provisioning: { dot: "bg-cyan-400", ring: "border-cyan-500/40", text: "text-cyan-400" },
};

// React Flow przekazuje dane węzła w polu "data"
interface CloudNodeProps {
  data: CloudNode;
}

export function CloudNodeCard({ data }: CloudNodeProps) {
  const Icon = ICONS[data.type];
  const style = STATUS_STYLES[data.status];

  return (
    <div
      className={cn(
        "glass-panel rounded-xl px-4 py-3 min-w-[190px] border transition-all duration-300",
        "hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)]",
        style.ring
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-500 !w-2 !h-2 !border-none"
      />

      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-sm font-medium text-white/90">
          {data.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40 uppercase tracking-wide">
          {data.provider} · {data.region}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.dot)} />
          <span className={cn("font-medium", style.text)}>
            {data.status}
          </span>
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-500 !w-2 !h-2 !border-none"
      />
    </div>
  );
}
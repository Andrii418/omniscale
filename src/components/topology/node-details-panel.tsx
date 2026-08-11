"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Cpu, MemoryStick, DollarSign, Gauge } from "lucide-react";
import { CloudNode } from "@/types/infrastructure";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";

interface NodeDetailsPanelProps {
  node: CloudNode | null;
  onClose: () => void;
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="absolute top-4 right-4 w-80 glass-panel glow-border rounded-xl p-5 z-10"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold text-base">
                {node.label}
              </h3>
              <p className="text-white/40 text-xs mt-0.5">
                {node.provider.toUpperCase()} · {node.region}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Badge
            variant="outline"
            className="mb-3 border-cyan-500/30 text-cyan-400 text-xs"
          >
            {node.type}
          </Badge>

          <p className="text-white/60 text-sm mb-4 leading-relaxed">
            {node.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <MetricTile
              icon={Cpu}
              label={t("node.cpu")}
              value={`${node.metrics.cpuUsage}%`}
            />
            <MetricTile
              icon={MemoryStick}
              label={t("node.ram")}
              value={`${node.metrics.memoryUsage}%`}
            />
            <MetricTile
              icon={DollarSign}
              label={t("node.costPerHour")}
              value={`$${node.metrics.costPerHour.toFixed(3)}`}
            />
            {node.metrics.latencyMs !== undefined && (
              <MetricTile
                icon={Gauge}
                label={t("node.latency")}
                value={`${node.metrics.latencyMs}ms`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-wide mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
  );
}
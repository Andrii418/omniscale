"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { AlertItem, AlertSeverity } from "@/types/telemetry";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: React.ElementType; color: string }> = {
  critical: { icon: AlertCircle, color: "text-red-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400" },
  info: { icon: Info, color: "text-cyan-400" },
};

interface AlertsFeedProps {
  alerts: AlertItem[];
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/30 text-sm">
        Brak alertów — system stabilny
      </div>
    );
  }

  return (
    <div className="h-64 overflow-y-auto space-y-1.5 pr-1">
      <AnimatePresence initial={false}>
        {alerts.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          const Icon = config.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
            >
              <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", config.color)} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/90 text-xs font-medium">{alert.nodeLabel}</span>
                  <span className="text-white/25 text-[10px]">
                    {new Date(alert.timestamp).toLocaleTimeString("pl-PL")}
                  </span>
                </div>
                <p className="text-white/50 text-xs mt-0.5 truncate">{alert.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
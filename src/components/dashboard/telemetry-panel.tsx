"use client";

import { Activity, DollarSign, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveMetrics } from "@/hooks/use-live-metrics";
import { MetricsChart } from "./metrics-chart";
import { CostChart } from "./cost-chart";
import { AlertsFeed } from "./alerts-feed";
import { useLanguage } from "@/context/language-context";

export function TelemetryPanel() {
  const { t } = useLanguage();
  const { history, alerts } = useLiveMetrics();

  const latestCost = history.length > 0 ? history[history.length - 1].cumulativeCost : 0;

  return (
    <div className="glass-panel rounded-2xl p-5 mt-6 border border-cyan-500/10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          {t("telemetry.title")}
        </h2>
        <span className="text-xs text-white/40">
          {t("telemetry.sessionCost")}:{" "}
          <span className="text-cyan-400 font-medium">${latestCost.toFixed(4)}</span>
        </span>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList className="bg-white/[0.03] border border-white/5">
          <TabsTrigger value="metrics" className="text-xs gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            {t("telemetry.tabMetrics")}
          </TabsTrigger>
          <TabsTrigger value="cost" className="text-xs gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            {t("telemetry.tabCost")}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            {t("telemetry.tabAlerts")}
            {alerts.length > 0 && (
              <span className="ml-1 bg-cyan-500/20 text-cyan-400 px-1.5 rounded-full text-[10px]">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          {history.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/30 text-sm">
              {t("telemetry.gatheringMetrics")}
            </div>
          ) : (
            <MetricsChart data={history} />
          )}
        </TabsContent>

        <TabsContent value="cost" className="mt-4">
          {history.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/30 text-sm">
              {t("telemetry.gatheringCost")}
            </div>
          ) : (
            <CostChart data={history} />
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <AlertsFeed alerts={alerts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
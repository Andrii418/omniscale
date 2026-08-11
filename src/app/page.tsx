"use client";

import { useState, useCallback } from "react";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { InfrastructureGraph } from "@/components/topology/infrastructure-graph";
import { SREAgentPanel } from "@/components/ai-agent/sre-agent-panel";
import { DeploymentTerminal } from "@/components/dashboard/deployment-terminal";
import { TelemetryPanel } from "@/components/dashboard/telemetry-panel";
import { useLanguage } from "@/context/language-context";

export default function Home() {
  const [deployProgress, setDeployProgress] = useState<Record<string, number>>({});
  const { t } = useLanguage();

  const handleNodeProgress = useCallback((nodeId: string, progress: number) => {
    setDeployProgress((prev) => ({ ...prev, [nodeId]: progress }));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0C] p-6 md:p-10 pb-32">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white glow-text">OmniScale</h1>
          <p className="text-cyan-400/60 text-sm mt-1 tracking-wide">
            {t("app.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <DeploymentTerminal onNodeProgress={handleNodeProgress} />
        </div>
      </header>

      <InfrastructureGraph deployProgress={deployProgress} />
      <TelemetryPanel />
      <SREAgentPanel />
    </main>
  );
}
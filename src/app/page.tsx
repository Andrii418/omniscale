"use client";

import { WhatIfSimulator } from "@/components/dashboard/what-if-simulator";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { InfrastructureGraph } from "@/components/topology/infrastructure-graph";
import { SREAgentPanel } from "@/components/ai-agent/sre-agent-panel";
import { DeploymentTerminal } from "@/components/dashboard/deployment-terminal";
import { TelemetryPanel } from "@/components/dashboard/telemetry-panel";
import { CommandPalette } from "@/components/shared/command-palette";
import { useLanguage } from "@/context/language-context";
import { useCommandBus } from "@/context/command-context";

export default function Home() {
  const [deployProgress, setDeployProgress] = useState<Record<string, number>>({});
  const { t } = useLanguage();
  const { setOpen } = useCommandBus();

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

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 glass-panel border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white/50 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("cmd.hint")}</span>
            <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>
          <LanguageToggle />
          <DeploymentTerminal onNodeProgress={handleNodeProgress} />
        </div>
      </header>

      <InfrastructureGraph deployProgress={deployProgress} />
      <TelemetryPanel />
      <SREAgentPanel />
      <WhatIfSimulator />
      <CommandPalette />
    </main>
  );
}
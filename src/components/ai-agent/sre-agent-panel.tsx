"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Loader2, AlertTriangle, AlertCircle, Info, TrendingDown } from "lucide-react";
import { SREAnalysisResult, InsightSeverity } from "@/types/ai-agent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useCommandBus } from "@/context/command-context";

const SEVERITY_CONFIG: Record<InsightSeverity, { icon: React.ElementType; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  info: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
};

export function SREAgentPanel() {
  const { t, language } = useLanguage();
  const { registerAction } = useCommandBus();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SREAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sre-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) throw new Error(t("agent.error"));
      const data: SREAnalysisResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("agent.error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    registerAction("openAgent", () => setIsOpen(true));
    registerAction("runAnalysis", () => {
      setIsOpen(true);
      runAnalysis();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerAction]);

  return (
    <>
      {/* Przycisk otwierający panel - dolny prawy róg ekranu */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-20 glass-panel glow-border rounded-full p-4 flex items-center gap-2"
      >
        <Bot className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-medium text-white pr-1">{t("agent.title")}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Tło przyciemniające resztę ekranu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            />

            {/* Panel boczny */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#0A0A0C] border-l border-cyan-500/20 z-40 overflow-y-auto"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0A0C] z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-sm">{t("agent.title")}</h2>
                    <p className="text-white/40 text-xs">{t("agent.poweredBy")}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                {!result && !isLoading && (
                  <div className="text-center py-10">
                    <p className="text-white/50 text-sm mb-4">
                      {t("agent.idlePrompt")}
                    </p>
                    <Button onClick={runAnalysis} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("agent.runAnalysis")}
                    </Button>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    <p className="text-white/50 text-sm">{t("agent.analyzing")}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {result && !isLoading && (
                  <div className="space-y-4">
                    <div className="glass-panel rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/50 text-xs uppercase tracking-wide">
                          {t("agent.healthScore")}
                        </span>
                        <span className="text-2xl font-bold text-cyan-400">
                          {result.overallHealthScore}/100
                        </span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{result.summary}</p>
                    </div>

                    <div className="space-y-2">
                      {result.insights.map((insight, i) => {
                        const config = SEVERITY_CONFIG[insight.severity];
                        const Icon = config.icon;
                        return (
                          <div key={i} className={cn("border rounded-lg p-3", config.bg)}>
                            <div className="flex items-start gap-2">
                              <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                              <div className="flex-1">
                                <h4 className="text-white text-sm font-medium">{insight.title}</h4>
                                <p className="text-white/60 text-xs mt-1">{insight.description}</p>
                                <div className="mt-2 bg-white/5 rounded-md p-2">
                                  <p className="text-cyan-300 text-xs">
                                    💡 {insight.recommendation}
                                  </p>
                                </div>
                                {insight.estimatedMonthlySavings && insight.estimatedMonthlySavings > 0 && (
                                  <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                                    <TrendingDown className="w-3 h-3" />
                                    {t("agent.monthlySavings")}: ${insight.estimatedMonthlySavings}{t("agent.perMonth")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      onClick={runAnalysis}
                      variant="outline"
                      className="w-full border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      {t("agent.runAgain")}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
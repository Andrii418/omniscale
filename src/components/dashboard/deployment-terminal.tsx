"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Rocket, CheckCircle2, X } from "lucide-react";
import { DeployLogEntry, DeploymentPhase } from "@/types/deployment";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<DeployLogEntry["level"], string> = {
  command: "text-cyan-300",
  info: "text-white/60",
  success: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-red-400",
};

interface DeploymentTerminalProps {
  // Wywoływane za każdym razem, gdy log dotyczy konkretnego węzła -
  // pozwala rodzicowi (page.tsx) zaktualizować status na grafie
  onNodeProgress?: (nodeId: string, progress: number) => void;
}

export function DeploymentTerminal({ onNodeProgress }: DeploymentTerminalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<DeploymentPhase>("idle");
  const [logs, setLogs] = useState<DeployLogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll do najnowszej linii logu, tak jak w prawdziwym terminalu
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  const startDeployment = useCallback(() => {
    setIsOpen(true);
    setPhase("running");
    setLogs([]);

    // EventSource to wbudowane w przeglądarkę API do odbierania SSE -
    // automatycznie parsuje strumień "data: ..." wysyłany przez nasz endpoint
    const eventSource = new EventSource("/api/deploy");

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      if (parsed.done) {
        setPhase("completed");
        eventSource.close();
        return;
      }

      const entry: DeployLogEntry = parsed;
      setLogs((prev) => [...prev, entry]);

      if (entry.nodeId && entry.progress !== undefined) {
        onNodeProgress?.(entry.nodeId, entry.progress);
      }
    };

    eventSource.onerror = () => {
      setPhase("failed");
      eventSource.close();
    };
  }, [onNodeProgress]);

  return (
    <>
      <Button
        onClick={startDeployment}
        disabled={phase === "running"}
        className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2"
      >
        <Rocket className="w-4 h-4" />
        {phase === "running" ? "Wdrażanie w toku..." : "Wdróż infrastrukturę"}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 right-6 md:right-auto md:w-[640px] z-30 glass-panel glow-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-white/80">
                  terraform apply — omniscale-production
                </span>
                {phase === "completed" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1" />
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="h-72 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {logs.map((log, i) => (
                <div key={i} className={cn("py-0.5", LEVEL_COLORS[log.level])}>
                  {log.level === "command" ? (
                    <span className="text-white/40">{log.message}</span>
                  ) : (
                    <>
                      <span className="text-white/20 mr-2">
                        [{new Date(log.timestamp).toLocaleTimeString("pl-PL")}]
                      </span>
                      {log.message}
                    </>
                  )}
                </div>
              ))}
              {phase === "running" && (
                <span className="inline-block w-2 h-3.5 bg-cyan-400 animate-pulse ml-1" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
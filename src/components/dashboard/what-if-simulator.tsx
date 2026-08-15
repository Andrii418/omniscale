"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/language-context";
import { useCommandBus } from "@/context/command-context";
import { WhatIfScenario, InstanceSize, SIZE_LABELS } from "@/types/whatif";
import {
  BASELINE_SCENARIO,
  calculateMonthlyCost,
  calculateBreakdown,
} from "@/lib/cost-calculator";
import { cn } from "@/lib/utils";

const SIZE_OPTIONS: InstanceSize[] = ["small", "medium", "large", "xlarge"];

export function WhatIfSimulator() {
  const { t } = useLanguage();
  const { registerAction } = useCommandBus();
  const [isOpen, setIsOpen] = useState(false);
  const [scenario, setScenario] = useState<WhatIfScenario>(BASELINE_SCENARIO);

  useEffect(() => {
    registerAction("openWhatIf", () => setIsOpen(true));
  }, [registerAction]);

  const baselineCost = useMemo(() => calculateMonthlyCost(BASELINE_SCENARIO), []);
  const scenarioCost = useMemo(() => calculateMonthlyCost(scenario), [scenario]);
  const breakdown = useMemo(() => calculateBreakdown(scenario), [scenario]);

  const difference = scenarioCost - baselineCost;
  const percentChange = ((difference / baselineCost) * 100).toFixed(1);
  const isIncrease = difference > 0;

  const comparisonData = [
    { name: t("whatif.current"), cost: baselineCost, fill: "#6B7280" },
    { name: t("whatif.scenario"), cost: scenarioCost, fill: isIncrease ? "#F87171" : "#34D399" },
  ];

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-20 glass-panel glow-border rounded-full p-4 flex items-center gap-2"
      >
        <Calculator className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-medium text-white pr-1 hidden sm:inline">
          {t("whatif.title")}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            />
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
                    <Calculator className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-sm">{t("whatif.title")}</h2>
                    <p className="text-white/40 text-xs">{t("whatif.subtitle")}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Wykres porównawczy */}
                <div className="glass-panel rounded-xl p-4">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip
                          contentStyle={{
                            background: "#0A0A0C",
                            border: "1px solid rgba(6,182,212,0.3)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, t("whatif.monthlyCost")]}
                        />
                        <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                          {comparisonData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                    <span className="text-white/50 text-xs">{t("whatif.difference")}</span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-sm font-semibold",
                        isIncrease ? "text-red-400" : "text-emerald-400"
                      )}
                    >
                      {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isIncrease ? "+" : ""}
                      ${difference.toFixed(2)} ({isIncrease ? "+" : ""}
                      {percentChange}%)
                    </span>
                  </div>
                </div>

                {/* Kontrolki scenariusza */}
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/70 text-xs">{t("whatif.appServerCount")}</label>
                      <span className="text-cyan-400 text-xs font-medium">{scenario.appServerCount}</span>
                    </div>
                    <Slider
                      value={[scenario.appServerCount]}
                      onValueChange={(v) => {
                        const next = Array.isArray(v) ? v[0] : v;
                        setScenario((s) => ({ ...s, appServerCount: next }));
                      }}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-xs block mb-2">{t("whatif.appServerSize")}</label>
                    <Select
                      value={scenario.appServerSize}
                      onValueChange={(v) => {
                        if (v) setScenario((s) => ({ ...s, appServerSize: v as InstanceSize }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>
                            {SIZE_LABELS[size]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white/70 text-xs block mb-2">{t("whatif.dbSize")}</label>
                    <Select
                      value={scenario.dbSize}
                      onValueChange={(v) => {
                        if (v) setScenario((s) => ({ ...s, dbSize: v as InstanceSize }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>
                            {SIZE_LABELS[size]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between glass-panel rounded-lg px-3 py-2.5">
                    <label className="text-white/70 text-xs">{t("whatif.reserved")}</label>
                    <Switch
                      checked={scenario.reservedInstances}
                      onCheckedChange={(v) => setScenario((s) => ({ ...s, reservedInstances: v }))}
                    />
                  </div>
                </div>

                {/* Podział kosztów */}
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wide mb-2">
                    {t("whatif.breakdown")}
                  </p>
                  <div className="space-y-1.5">
                    {breakdown.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
                      >
                        <span className="text-white/60 text-xs">{item.label}</span>
                        <span className="text-white/90 text-xs font-medium">
                          ${item.monthlyCost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
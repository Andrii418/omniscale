"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const isPolish = language === "pl";

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="relative w-[76px] h-9 rounded-full glass-panel border border-cyan-500/20 flex items-center px-1 hover:border-cyan-500/40 transition-colors"
    >
      {/* Ruchoma "kapsułka" w tle - to ona jeździ w bok i podświetla
          aktywny język. layout + spring transition daje płynny,
          sprężysty ruch, charakterystyczny dla dobrych przełączników UI. */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute w-[36px] h-7 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.55)]"
        style={{ left: isPolish ? "38px" : "2px" }}
      />

      {/* Etykiety tekstowe - zawsze w tym samym miejscu, tylko zmieniają kolor,
          gdy kapsułka aktualnie stoi pod nimi */}
      <span
        className={`relative z-10 w-1/2 text-center text-[11px] font-semibold tracking-wide transition-colors duration-200 ${
          !isPolish ? "text-cyan-950" : "text-white/40"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-10 w-1/2 text-center text-[11px] font-semibold tracking-wide transition-colors duration-200 ${
          isPolish ? "text-cyan-950" : "text-white/40"
        }`}
      >
        PL
      </span>
    </button>
  );
}
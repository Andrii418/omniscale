"use client";

import {
  Rocket,
  Sparkles,
  Languages,
  Bot,
  Server,
  Database,
  Network,
  HardDrive,
  Zap,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandBus } from "@/context/command-context";
import { useLanguage } from "@/context/language-context";
import { mockNodes } from "@/data/mock-infrastructure";
import { ResourceType } from "@/types/infrastructure";

// Ta sama mapa ikon co w cloud-node.tsx - węzły powinny wyglądać
// spójnie niezależnie od tego, gdzie w interfejsie się pojawiają
const NODE_ICONS: Record<ResourceType, React.ElementType> = {
  "load-balancer": Network,
  compute: Server,
  database: Database,
  storage: HardDrive,
  cache: Zap,
  cdn: Network,
  serverless: Server,
};

export function CommandPalette() {
  const { isOpen, setOpen, runAction } = useCommandBus();
  const { t } = useLanguage();

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput placeholder={t("cmd.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("cmd.empty")}</CommandEmpty>

        <CommandGroup heading={t("cmd.groupActions")}>
          <CommandItem onSelect={() => runAction("deploy")}>
            <Rocket className="w-4 h-4 text-cyan-400 mr-2" />
            {t("cmd.deploy")}
          </CommandItem>
          <CommandItem onSelect={() => runAction("runAnalysis")}>
            <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
            {t("cmd.runAnalysis")}
          </CommandItem>
          <CommandItem onSelect={() => runAction("openAgent")}>
            <Bot className="w-4 h-4 text-cyan-400 mr-2" />
            {t("cmd.openAgent")}
          </CommandItem>
          <CommandItem onSelect={() => runAction("toggleLanguage")}>
            <Languages className="w-4 h-4 text-cyan-400 mr-2" />
            {t("cmd.toggleLanguage")}
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading={t("cmd.groupNodes")}>
          {mockNodes.map((node) => {
            const Icon = NODE_ICONS[node.type];
            return (
              <CommandItem
                key={node.id}
                value={`${node.label} ${node.type} ${node.id}`}
                onSelect={() => runAction("focusNode", node.id)}
              >
                <Icon className="w-4 h-4 text-white/50 mr-2" />
                <span>{node.label}</span>
                <span className="ml-auto text-[10px] text-white/30 uppercase">
                  {node.status}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
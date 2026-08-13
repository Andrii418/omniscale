"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";

// Typ pojedynczej zarejestrowanej akcji - funkcja przyjmująca opcjonalny argument
// (np. id węzła, do którego mamy skoczyć)
type ActionHandler = (arg?: string) => void;

interface CommandContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  registerAction: (id: string, handler: ActionHandler) => void;
  runAction: (id: string, arg?: string) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // useRef, a nie useState - rejestr akcji nie powinien wywoływać re-renderu
  // całego drzewa komponentów za każdym razem, gdy ktoś się (od)rejestruje
  const actionsRef = useRef<Map<string, ActionHandler>>(new Map());

  const registerAction = useCallback((id: string, handler: ActionHandler) => {
    actionsRef.current.set(id, handler);
  }, []);

  const runAction = useCallback((id: string, arg?: string) => {
    const handler = actionsRef.current.get(id);
    handler?.(arg);
    setIsOpen(false);
  }, []);

  // Globalny skrót klawiszowy: Cmd+K (Mac) lub Ctrl+K (Windows/Linux)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandContext.Provider
      value={{ isOpen, setOpen: setIsOpen, registerAction, runAction }}
    >
      {children}
    </CommandContext.Provider>
  );
}

export function useCommandBus(): CommandContextValue {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommandBus musi być użyty wewnątrz <CommandProvider>");
  }
  return context;
}
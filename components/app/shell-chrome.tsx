"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export const SHELL_HEADER_ACTIONS_ID = "doctor-shell-header-actions";

export type ShellChrome = {
  avatarDot?: boolean;
  backHref?: string;
};

type ShellChromeContextValue = {
  chrome: ShellChrome;
  setChrome: (chrome: ShellChrome) => void;
};

const ShellChromeContext = createContext<ShellChromeContextValue | null>(null);

export function ShellChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChromeState] = useState<ShellChrome>({});
  const setChrome = useCallback((next: ShellChrome) => {
    setChromeState(next);
  }, []);

  return (
    <ShellChromeContext.Provider value={{ chrome, setChrome }}>
      {children}
    </ShellChromeContext.Provider>
  );
}

export function useShellChromeState() {
  const ctx = useContext(ShellChromeContext);
  return ctx?.chrome ?? {};
}

export function useShellChrome(chrome: ShellChrome) {
  const ctx = useContext(ShellChromeContext);
  const setChrome = ctx?.setChrome;
  const avatarDot = chrome.avatarDot;
  const backHref = chrome.backHref;

  useLayoutEffect(() => {
    if (!setChrome) {
      return;
    }
    setChrome({ avatarDot, backHref });
    return () => setChrome({});
  }, [setChrome, avatarDot, backHref]);
}

let headerSlot: HTMLElement | null = null;
const headerSlotListeners = new Set<() => void>();

function subscribeHeaderSlot(onStoreChange: () => void) {
  headerSlotListeners.add(onStoreChange);
  return () => {
    headerSlotListeners.delete(onStoreChange);
  };
}

function getHeaderSlot() {
  return headerSlot;
}

function getServerHeaderSlot() {
  return null;
}

export function ShellHeaderSlot() {
  return (
    <span
      id={SHELL_HEADER_ACTIONS_ID}
      className="inline-flex items-center"
      ref={(node) => {
        headerSlot = node;
        headerSlotListeners.forEach((listener) => listener());
      }}
    />
  );
}

export function ShellHeaderActions({ children }: { children: ReactNode }) {
  const target = useSyncExternalStore(
    subscribeHeaderSlot,
    getHeaderSlot,
    getServerHeaderSlot,
  );
  if (!target) {
    return null;
  }
  return createPortal(children, target);
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";

export type CurrencyCode = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "SAR" | "CAD" | "AUD";

// Base currency: PKR. Rate = 1 PKR in target currency.
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  PKR: 1,
  USD: 0.0036,
  EUR: 0.0033,
  GBP: 0.0028,
  AED: 0.013,
  SAR: 0.013,
  CAD: 0.0049,
  AUD: 0.0055,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PKR: "Rs.",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "﷼",
  CAD: "C$",
  AUD: "A$",
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["PKR", "USD", "EUR", "GBP", "AED", "SAR", "CAD", "AUD"];

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (c: CurrencyCode) => void;
  formatAmount: (amountInPKR: number, opts?: { showSign?: boolean; compact?: boolean }) => string;
  convertAmount: (amountInPKR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);
const STORAGE_KEY = "financeai.currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<CurrencyCode>("PKR");

  // Load from localStorage immediately, then sync with profile if signed in.
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && SUPPORTED_CURRENCIES.includes(stored)) setCurrencyState(stored);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase.from("profiles").select("preferred_currency").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (cancelled || !data?.preferred_currency) return;
      const c = data.preferred_currency as CurrencyCode;
      if (SUPPORTED_CURRENCIES.includes(c)) setCurrencyState(c);
    });
    return () => { cancelled = true; };
  }, [user]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, c);
    if (user) {
      supabase.from("profiles").update({ preferred_currency: c }).eq("id", user.id).then(() => {});
    }
  };

  const convertAmount = (amountInPKR: number) => amountInPKR * EXCHANGE_RATES[currency];

  const formatAmount: CurrencyContextType["formatAmount"] = (amountInPKR, opts) => {
    const converted = convertAmount(amountInPKR);
    const abs = Math.abs(converted);
    const sign = opts?.showSign && converted > 0 ? "+" : converted < 0 ? "-" : "";
    const symbol = CURRENCY_SYMBOLS[currency];
    if (opts?.compact) {
      const formatted = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(abs);
      return `${sign}${symbol}${formatted}`;
    }
    const formatted = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs);
    return `${sign}${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol: CURRENCY_SYMBOLS[currency], setCurrency, formatAmount, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
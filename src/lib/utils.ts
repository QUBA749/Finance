import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { CATEGORY_COLORS, CURRENCY_FORMATTER, DATE_FORMAT } from "./constants";
import type { TransactionCategory } from "@/types/finance";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  if (currency === "USD") return CURRENCY_FORMATTER.format(amount);
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(date: string, fmt: string = DATE_FORMAT): string {
  try {
    return format(parseISO(date), fmt);
  } catch {
    return date;
  }
}

export function formatPercentage(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function getTransactionColor(type: "income" | "expense"): string {
  return type === "income" ? "text-success" : "text-destructive";
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category as TransactionCategory] ?? "#64748B";
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

export function maskCardNumber(card: string): string {
  const last4 = card.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

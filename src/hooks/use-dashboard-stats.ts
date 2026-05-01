import { useMemo } from "react";
import { useTransactions } from "./use-transactions";
import { useAccounts } from "./use-accounts";
import type { CategoryExpense, MonthlyData } from "@/types/finance";
import { CATEGORY_COLORS } from "@/lib/constants";

export function useDashboardStats() {
  const { transactions, loading: txLoading } = useTransactions();
  const { accounts, loading: acLoading } = useAccounts();

  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}`;

    const isMonth = (d: string, k: string) => d.startsWith(k);
    const inThis = transactions.filter((t) => isMonth(t.date, thisMonthKey));
    const inLast = transactions.filter((t) => isMonth(t.date, lastMonthKey));

    const sumIncome = (arr: typeof transactions) => arr.filter((t) => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
    const sumExpense = (arr: typeof transactions) => arr.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);

    const monthlyIncome = sumIncome(inThis);
    const monthlyExpenses = sumExpense(inThis);
    const lastIncome = sumIncome(inLast);
    const lastExpense = sumExpense(inLast);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? +((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;
    const pct = (cur: number, prev: number) => prev === 0 ? 0 : +(((cur - prev) / Math.abs(prev)) * 100).toFixed(1);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      balanceChange: 0,
      incomeChange: pct(monthlyIncome, lastIncome),
      expenseChange: pct(monthlyExpenses, lastExpense),
    };
  }, [transactions, accounts]);

  const monthly: MonthlyData[] = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, { income: 0, expenses: 0 });
    }
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const e = map.get(key);
      if (!e) continue;
      if (t.type === "income") e.income += Math.abs(t.amount); else e.expenses += Math.abs(t.amount);
    }
    return Array.from(map.entries()).map(([k, v]) => {
      const [y, m] = k.split("-").map(Number);
      const month = new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short" });
      return { month, income: v.income, expenses: v.expenses, savings: v.income - v.expenses };
    });
  }, [transactions]);

  const categoryExpenses: CategoryExpense[] = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense" || !t.date.startsWith(key)) continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    const total = Array.from(totals.values()).reduce((s, n) => s + n, 0);
    return Array.from(totals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? +((amount / total) * 100).toFixed(1) : 0,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? "#64748B",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return { stats, monthly, categoryExpenses, accounts, transactions, loading: txLoading || acLoading };
}
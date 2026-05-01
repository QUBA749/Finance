import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useCurrency } from "@/context/currency-context";
import type {
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@/types/finance";

type TypeFilter = "all" | "income" | "expense";
type StatusFilter = "all" | TransactionStatus;
type SortKey = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export interface NewTransactionInput {
  date: string;
  description: string;
  category: TransactionCategory;
  amount: number; // always in PKR base currency, positive
  type: TransactionType;
  status: TransactionStatus;
  account_id?: string | null;
  merchant?: string;
  notes?: string;
}

function rowToTransaction(r: any, accountName: string | null): Transaction {
  const signed = r.type === "expense" ? -Math.abs(Number(r.amount)) : Math.abs(Number(r.amount));
  return {
    id: r.id,
    date: r.date,
    description: r.description,
    category: r.category as TransactionCategory,
    amount: signed,
    type: r.type,
    status: r.status,
    account: accountName ?? "—",
    account_id: r.account_id,
    merchant: r.merchant ?? undefined,
    notes: r.notes ?? undefined,
  };
}

export function useTransactions(initialAccountFilter?: string | null) {
  const { user, loading: authLoading } = useAuth();
  const { formatAmount, currency, symbol } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>(initialAccountFilter ?? "all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const refresh = useCallback(async () => {
    if (!user) { setTransactions([]); setLoading(false); return; }
    setLoading(true);
    const [{ data: txns }, { data: accts }] = await Promise.all([
      supabase.from("transactions").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("accounts").select("id,name"),
    ]);
    const acctMap = new Map<string, string>((accts ?? []).map((a: any) => [a.id, a.name]));
    setTransactions((txns ?? []).map((r: any) => rowToTransaction(r, r.account_id ? acctMap.get(r.account_id) ?? "—" : "—")));
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) refresh(); }, [authLoading, refresh]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, categoryFilter, typeFilter, statusFilter, dateFrom, dateTo, accountFilter]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    const list = transactions.filter((t) => {
      if (q) {
        const hay = `${t.description} ${t.merchant ?? ""} ${t.category} ${t.account}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (accountFilter !== "all" && t.account_id !== accountFilter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = a.description.localeCompare(b.description);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [transactions, debouncedSearch, categoryFilter, typeFilter, statusFilter, accountFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netAmount = totalIncome + totalExpenses;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setAccountFilter("all");
    setCurrentPage(1);
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (accountFilter !== "all" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const addTransaction = async (input: NewTransactionInput) => {
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase.from("transactions").insert({
      user_id: user.id,
      date: input.date,
      description: input.description,
      category: input.category,
      amount: Math.abs(input.amount),
      type: input.type,
      status: input.status,
      account_id: input.account_id ?? null,
      merchant: input.merchant ?? null,
      notes: input.notes ?? null,
    }).select().single();
    if (error) throw error;
    let accountName: string | null = null;
    if (data.account_id) {
      const { data: a } = await supabase.from("accounts").select("name").eq("id", data.account_id).maybeSingle();
      accountName = a?.name ?? null;
    }
    setTransactions((prev) => [rowToTransaction(data, accountName), ...prev]);
    return data;
  };

  const updateTransaction = async (id: string, input: Partial<NewTransactionInput>) => {
    const { data, error } = await supabase.from("transactions").update({
      ...(input.date !== undefined && { date: input.date }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.amount !== undefined && { amount: Math.abs(input.amount) }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.account_id !== undefined && { account_id: input.account_id }),
      ...(input.merchant !== undefined && { merchant: input.merchant }),
      ...(input.notes !== undefined && { notes: input.notes }),
    }).eq("id", id).select().single();
    if (error) throw error;
    let accountName: string | null = null;
    if (data.account_id) {
      const { data: a } = await supabase.from("accounts").select("name").eq("id", data.account_id).maybeSingle();
      accountName = a?.name ?? null;
    }
    setTransactions((prev) => prev.map((t) => t.id === id ? rowToTransaction(data, accountName) : t));
    return data;
  };

  const deleteTransaction = async (id: string) => {
    const prev = transactions;
    setTransactions((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { setTransactions(prev); throw error; }
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const prev = transactions;
    setTransactions((p) => p.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
    const { error } = await supabase.from("transactions").delete().in("id", ids);
    if (error) { setTransactions(prev); throw error; }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const allOnPage = paginated.every((t) => prev.has(t.id));
      const next = new Set(prev);
      if (allOnPage) paginated.forEach((t) => next.delete(t.id));
      else paginated.forEach((t) => next.add(t.id));
      return next;
    });
  };

  const exportToCSV = () => {
    const escape = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = `Date,Description,Category,Type,Status,Account,Amount (${currency}),Amount (${symbol}),Merchant,Notes\n`;
    const rows = filtered
      .map((t) => [
        t.date, t.description, t.category, t.type, t.status, t.account,
        (t.amount).toFixed(2), formatAmount(t.amount, { showSign: true }),
        t.merchant ?? "", t.notes ?? "",
      ].map(escape).join(","))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    transactions, filtered, paginated, loading, refresh,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    accountFilter, setAccountFilter,
    dateFrom, setDateFrom, dateTo, setDateTo,
    sortKey, sortDir, handleSort,
    currentPage, setCurrentPage, totalPages,
    totalIncome, totalExpenses, netAmount,
    clearFilters, activeFilterCount,
    addTransaction, updateTransaction, deleteTransaction, deleteSelected,
    selected, toggleSelect, toggleSelectAll,
    exportToCSV,
  };
}
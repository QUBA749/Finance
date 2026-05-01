import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { BankAccount, AccountType } from "@/types/finance";

export interface NewAccountInput {
  name: string;
  type: AccountType;
  bank: string;
  balance: number;
  currency: string;
  cardNumber: string;
  holder: string;
  color?: string;
  isDefault?: boolean;
}

const ACCOUNT_COLORS: Record<AccountType, string> = {
  checking: "from-blue-500 to-indigo-600",
  savings: "from-emerald-500 to-teal-600",
  investment: "from-violet-500 to-purple-700",
  credit: "from-amber-500 to-orange-600",
};

function rowToAccount(r: any): BankAccount {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    balance: Number(r.balance),
    currency: r.currency,
    cardNumber: r.card_number,
    bank: r.bank,
    color: r.color,
    isDefault: r.is_default,
    holder: r.holder,
  };
}

export function useAccounts() {
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setAccounts([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setAccounts(data.map(rowToAccount));
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) refresh(); }, [authLoading, refresh]);

  const addAccount = async (input: NewAccountInput) => {
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name: input.name,
        type: input.type,
        bank: input.bank,
        balance: input.balance,
        currency: input.currency,
        card_number: input.cardNumber,
        holder: input.holder,
        color: input.color ?? ACCOUNT_COLORS[input.type],
        is_default: input.isDefault ?? false,
      })
      .select()
      .single();
    if (error) throw error;
    const acc = rowToAccount(data);
    setAccounts((prev) => [...prev, acc]);
    return acc;
  };

  const updateAccount = async (id: string, patch: Partial<NewAccountInput>) => {
    const { data, error } = await supabase
      .from("accounts")
      .update({
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.type !== undefined && { type: patch.type }),
        ...(patch.bank !== undefined && { bank: patch.bank }),
        ...(patch.balance !== undefined && { balance: patch.balance }),
        ...(patch.currency !== undefined && { currency: patch.currency }),
        ...(patch.cardNumber !== undefined && { card_number: patch.cardNumber }),
        ...(patch.holder !== undefined && { holder: patch.holder }),
        ...(patch.color !== undefined && { color: patch.color }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const acc = rowToAccount(data);
    setAccounts((prev) => prev.map((a) => (a.id === id ? acc : a)));
    return acc;
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transfer = async (fromId: string, toId: string, amount: number, note?: string) => {
    if (!user) throw new Error("Not signed in");
    const from = accounts.find((a) => a.id === fromId);
    const to = accounts.find((a) => a.id === toId);
    if (!from || !to) throw new Error("Account not found");
    if (amount <= 0) throw new Error("Amount must be positive");
    const { error: e1 } = await supabase.from("accounts").update({ balance: from.balance - amount }).eq("id", fromId);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from("accounts").update({ balance: to.balance + amount }).eq("id", toId);
    if (e2) throw e2;
    // Log a pair of transactions for traceability
    await supabase.from("transactions").insert([
      { user_id: user.id, account_id: fromId, description: `Transfer to ${to.name}`, category: "Other", amount, type: "expense", status: "completed", notes: note ?? null, date: new Date().toISOString().slice(0, 10) },
      { user_id: user.id, account_id: toId, description: `Transfer from ${from.name}`, category: "Other", amount, type: "income", status: "completed", notes: note ?? null, date: new Date().toISOString().slice(0, 10) },
    ]);
    await refresh();
  };

  return { accounts, loading, refresh, addAccount, updateAccount, deleteAccount, transfer };
}
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTransactions, type NewTransactionInput } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import type { TransactionCategory, TransactionStatus, TransactionType } from "@/types/finance";

const CATEGORIES: TransactionCategory[] = [
  "Food & Dining","Transportation","Shopping","Entertainment","Healthcare",
  "Utilities","Salary","Freelance","Investment","Housing","Education","Travel","Other",
];

export function AddTransactionDialog({ trigger }: { trigger: ReactNode }) {
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<NewTransactionInput>({
    date: today, description: "", category: "Other",
    amount: 0, type: "expense", status: "completed",
    account_id: null, merchant: "", notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) { toast.error("Description and positive amount are required"); return; }
    setBusy(true);
    try {
      await addTransaction(form);
      toast.success("Transaction added");
      setOpen(false);
      setForm({ date: today, description: "", category: "Other", amount: 0, type: "expense", status: "completed", account_id: null, merchant: "", notes: "" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TransactionType })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5" /></div>
            <div className="col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Grocery shopping" required className="mt-1.5" /></div>
            <div><Label>Amount (PKR)</Label><Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required className="mt-1.5" /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as TransactionCategory })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Account</Label>
              <Select value={form.account_id ?? "none"} onValueChange={(v) => setForm({ ...form, account_id: v === "none" ? null : v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No account</SelectItem>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TransactionStatus })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Merchant (optional)</Label><Input value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} className="mt-1.5" /></div>
            <div className="col-span-2"><Label>Notes (optional)</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} className="gradient-primary border-0 text-primary-foreground">{busy ? "Saving…" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
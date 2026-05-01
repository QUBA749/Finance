import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAccounts, type NewAccountInput } from "@/hooks/use-accounts";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/context/currency-context";
import type { AccountType } from "@/types/finance";

export function AddAccountDialog({ trigger }: { trigger: ReactNode }) {
  const { addAccount } = useAccounts();
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<NewAccountInput>({
    name: "", type: "checking", bank: "", balance: 0,
    currency: currency, cardNumber: "", holder: "", isDefault: false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.bank) { toast.error("Name and bank are required"); return; }
    setBusy(true);
    try {
      await addAccount(form);
      toast.success("Account added");
      setOpen(false);
      setForm({ name: "", type: "checking", bank: "", balance: 0, currency, cardNumber: "", holder: "", isDefault: false });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add account");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Account</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Account Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Savings" required className="mt-1.5" /></div>
            <div><Label>Bank</Label><Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="HBL" required className="mt-1.5" /></div>
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AccountType })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Holder name</Label><Input value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Card / Account #</Label><Input value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} placeholder="last 4 ok" className="mt-1.5" /></div>
            <div><Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Initial Balance (PKR)</Label><Input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} className="mt-1.5" /></div>
            <div className="col-span-2 flex items-center justify-between rounded-md border border-border p-3">
              <div><p className="text-sm font-medium">Set as default</p><p className="text-xs text-muted-foreground">Used for new transactions</p></div>
              <Switch checked={form.isDefault} onCheckedChange={(v) => setForm({ ...form, isDefault: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} className="gradient-primary border-0 text-primary-foreground">{busy ? "Saving…" : "Add Account"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
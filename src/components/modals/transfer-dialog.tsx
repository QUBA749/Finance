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
import { useAccounts } from "@/hooks/use-accounts";

export function TransferDialog({ trigger, defaultFromId }: { trigger: ReactNode; defaultFromId?: string }) {
  const { accounts, transfer } = useAccounts();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fromId, setFromId] = useState(defaultFromId ?? "");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) { toast.error("Select both accounts"); return; }
    if (fromId === toId) { toast.error("Accounts must be different"); return; }
    if (amount <= 0) { toast.error("Amount must be positive"); return; }
    setBusy(true);
    try {
      await transfer(fromId, toId, amount, note || undefined);
      toast.success("Transfer completed");
      setOpen(false); setAmount(0); setNote("");
    } catch (err: any) {
      toast.error(err.message ?? "Transfer failed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Transfer Money</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>From</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Source account" /></SelectTrigger>
              <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>To</Label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Destination account" /></SelectTrigger>
              <SelectContent>{accounts.filter((a) => a.id !== fromId).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Amount (PKR)</Label><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="mt-1.5" required /></div>
          <div><Label>Note (optional)</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1.5" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} className="gradient-primary border-0 text-primary-foreground">{busy ? "Transferring…" : "Transfer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
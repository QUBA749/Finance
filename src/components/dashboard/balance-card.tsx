import { Eye, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/currency-context";
import { AddAccountDialog } from "@/components/modals/add-account-dialog";
import { TransferDialog } from "@/components/modals/transfer-dialog";
import type { BankAccount } from "@/types/finance";

export function BalanceCard({ accounts }: { accounts: BankAccount[] }) {
  const { formatAmount } = useCurrency();
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-card text-white p-6 shadow-elegant">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70">Total Portfolio Balance</p>
            <p className="text-4xl font-bold tabular mt-2">{formatAmount(total)}</p>
            <p className="text-sm text-white/80 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
              </span>{" "}
              total
            </p>
          </div>
          <Button size="sm" variant="secondary" className="bg-white/15 hover:bg-white/25 text-white border-0">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {accounts.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {accounts.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/60">{a.type}</p>
                <p className="text-sm font-semibold truncate">{a.bank || a.name}</p>
                <p className="text-base tabular font-bold mt-1">{formatAmount(a.balance)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <TransferDialog
            trigger={
              <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90"><Send className="h-3.5 w-3.5 mr-1.5" />Transfer</Button>
            }
          />
          <AddAccountDialog
            trigger={
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/15"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Account</Button>
            }
          />
        </div>
      </div>
    </div>
  );
}

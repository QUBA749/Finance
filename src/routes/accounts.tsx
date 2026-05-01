import { createFileRoute } from "@tanstack/react-router";
import { Plus, Send, Settings as SettingsIcon, Eye, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ACCOUNT_TYPE_COLORS } from "@/lib/constants";
import { maskCardNumber } from "@/lib/utils";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrency } from "@/context/currency-context";
import { AddAccountDialog } from "@/components/modals/add-account-dialog";
import { TransferDialog } from "@/components/modals/transfer-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
  head: () => ({
    meta: [
      { title: "Accounts — FinanceAI" },
      { name: "description", content: "Manage your bank accounts, credit cards, and investment portfolios." },
    ],
  }),
});

function AccountsPage() {
  const { accounts, loading, deleteAccount } = useAccounts();
  const { transactions } = useTransactions();
  const { formatAmount } = useCurrency();

  const totalAssets = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiab = Math.abs(accounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0));
  const netWorth = totalAssets - totalLiab;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this account? Linked transactions will keep their history.")) return;
    try { await deleteAccount(id); toast.success("Account deleted"); }
    catch (e: any) { toast.error(e.message ?? "Failed to delete"); }
  };

  return (
    <AppShell>
      <PageHeader title="My Accounts" subtitle={`${accounts.length} ${accounts.length === 1 ? "account" : "accounts"}`}>
        <TransferDialog
          trigger={<Button variant="outline" size="sm"><Send className="h-4 w-4 mr-1.5" />Transfer</Button>}
        />
        <AddAccountDialog
          trigger={<Button size="sm" className="gradient-primary border-0 text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" />Add Account</Button>}
        />
      </PageHeader>

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-base font-semibold">No accounts yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Add your first account to start tracking your money.</p>
            <AddAccountDialog
              trigger={<Button className="gradient-primary border-0 text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" />Add Account</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {accounts.map((a) => {
              const monthIncome = transactions.filter((t) => t.account_id === a.id && t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
              const monthExpense = transactions.filter((t) => t.account_id === a.id && t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
              return (
                <div key={a.id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${a.color} text-white p-5 shadow-elegant`}>
                  <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/70">{a.type}</p>
                        <p className="text-base font-semibold">{a.bank} · {a.name}</p>
                      </div>
                      {a.isDefault && <Badge className="bg-white/20 border-0 text-white text-[10px]">DEFAULT</Badge>}
                    </div>
                    {a.cardNumber && <p className="text-xl tabular font-mono tracking-wider">{maskCardNumber(a.cardNumber)}</p>}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-white/70">Holder</p>
                        <p className="text-sm font-semibold uppercase">{a.holder || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/70">{a.type === "credit" ? "Owed" : "Balance"}</p>
                        <p className="text-2xl font-bold tabular">{formatAmount(Math.abs(a.balance))}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white/60">In</p>
                        <p className="text-sm font-semibold tabular">{formatAmount(monthIncome)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white/60">Out</p>
                        <p className="text-sm font-semibold tabular">{formatAmount(monthExpense)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="ghost" className="flex-1 bg-white/15 hover:bg-white/25 text-white border-0"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                      <TransferDialog
                        defaultFromId={a.id}
                        trigger={
                          <Button size="sm" variant="ghost" className="flex-1 bg-white/15 hover:bg-white/25 text-white border-0"><Send className="h-3.5 w-3.5 mr-1" />Transfer</Button>
                        }
                      />
                      <Button size="sm" variant="ghost" className="bg-white/15 hover:bg-white/25 text-white border-0" onClick={() => handleDelete(a.id)} aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Assets</p><p className="text-2xl font-bold tabular text-success mt-1">{formatAmount(totalAssets)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Liabilities</p><p className="text-2xl font-bold tabular text-destructive mt-1">{formatAmount(totalLiab)}</p></CardContent></Card>
            <Card className="gradient-primary text-primary-foreground"><CardContent className="p-5"><p className="text-sm text-primary-foreground/80">Net Worth</p><p className="text-2xl font-bold tabular mt-1">{formatAmount(netWorth)}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>All Accounts</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell><Badge className={`${ACCOUNT_TYPE_COLORS[a.type]} border-0 capitalize`}>{a.type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{a.bank}</TableCell>
                      <TableCell><Badge className="bg-success/10 text-success border-0">Active</Badge></TableCell>
                      <TableCell className="text-right tabular font-semibold">{formatAmount(a.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}

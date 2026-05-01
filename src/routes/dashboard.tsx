import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { IncomeChart } from "@/components/dashboard/income-chart";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useAuth } from "@/context/auth-context";
import { useTransactions } from "@/hooks/use-transactions";
import { AddTransactionDialog } from "@/components/modals/add-transaction-dialog";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — FinanceAI" },
      { name: "description", content: "Your financial overview at a glance: balances, income, expenses, and spending trends." },
    ],
  }),
});

function DashboardPage() {
  const { user } = useAuth();
  const { stats, monthly, categoryExpenses, accounts, transactions, loading } = useDashboardStats();
  const { exportToCSV } = useTransactions();
  const displayName = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "there";

  return (
    <AppShell>
      <PageHeader title={`Welcome back, ${displayName} 👋`} subtitle="Here's what's happening with your money today.">
        <Button variant="outline" size="sm" onClick={exportToCSV}><Download className="h-4 w-4 mr-1.5" />Export</Button>
        <AddTransactionDialog
          trigger={
            <Button size="sm" className="gradient-primary border-0 text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" />Add</Button>
          }
        />
      </PageHeader>

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>
      ) : (
        <div className="space-y-6">
          <StatsCards stats={stats} />
          <BalanceCard accounts={accounts} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3"><IncomeChart data={monthly} /></div>
            <div className="lg:col-span-2"><ExpenseChart data={categoryExpenses} /></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3"><RecentTransactions transactions={transactions} /></div>
            <div className="lg:col-span-2"><AccountOverview accounts={accounts} /></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

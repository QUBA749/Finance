import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { useTransactions } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { AddTransactionDialog } from "@/components/modals/add-transaction-dialog";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [
      { title: "Transactions — FinanceAI" },
      { name: "description", content: "Search, filter and manage all your financial transactions in one place." },
    ],
  }),
});

function TransactionsPage() {
  const t = useTransactions();

  return (
    <AppShell>
      <PageHeader title="Transactions" subtitle={`${t.filtered.length} of ${t.transactions.length} transactions`}>
        <Button variant="outline" size="sm" onClick={t.exportToCSV}><Download className="h-4 w-4 mr-1.5" />Export</Button>
        <AddTransactionDialog
          trigger={
            <Button size="sm" className="gradient-primary border-0 text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" />Add Transaction</Button>
          }
        />
      </PageHeader>

      <div className="space-y-4">
        <TransactionFilters
          searchQuery={t.searchQuery} setSearchQuery={t.setSearchQuery}
          categoryFilter={t.categoryFilter} setCategoryFilter={t.setCategoryFilter}
          typeFilter={t.typeFilter} setTypeFilter={t.setTypeFilter}
          statusFilter={t.statusFilter} setStatusFilter={t.setStatusFilter}
          dateFrom={t.dateFrom} setDateFrom={t.setDateFrom}
          dateTo={t.dateTo} setDateTo={t.setDateTo}
          clearFilters={t.clearFilters} activeFilterCount={t.activeFilterCount}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard label="Total Income" value={t.totalIncome} tone="success" />
          <SummaryCard label="Total Expenses" value={t.totalExpenses} tone="destructive" />
          <SummaryCard label="Net Amount" value={t.netAmount} tone={t.netAmount >= 0 ? "success" : "destructive"} />
        </div>

        <TransactionTable
          rows={t.paginated}
          page={t.currentPage} totalPages={t.totalPages} onPage={t.setCurrentPage}
          onSort={t.handleSort}
          onDelete={t.deleteTransaction}
        />
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "success" | "destructive" }) {
  const { formatAmount } = useCurrency();
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-xl font-bold tabular mt-1", tone === "success" ? "text-success" : "text-destructive")}>
          {value >= 0 ? "+" : "-"}{formatAmount(Math.abs(value))}
        </p>
      </CardContent>
    </Card>
  );
}
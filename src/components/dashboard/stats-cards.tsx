import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercentage, cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import type { DashboardStats } from "@/types/finance";

type Item = {
  title: string;
  value: string;
  subtitle: string;
  change?: number;
  changeGoodWhenNegative?: boolean;
  Icon: typeof Wallet;
  iconBg: string;
  iconColor: string;
  progress?: number;
};

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const { formatAmount } = useCurrency();
  const s = stats;
  const items: Item[] = [
    { title: "Total Balance", value: formatAmount(s.totalBalance), subtitle: "Across all accounts", change: s.balanceChange, Icon: Wallet, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { title: "Monthly Income", value: formatAmount(s.monthlyIncome), subtitle: "This month", change: s.incomeChange, Icon: TrendingUp, iconBg: "bg-success/10", iconColor: "text-success" },
    { title: "Monthly Expenses", value: formatAmount(s.monthlyExpenses), subtitle: "This month", change: s.expenseChange, changeGoodWhenNegative: true, Icon: TrendingDown, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
    { title: "Savings Rate", value: `${s.savingsRate}%`, subtitle: `${formatAmount(s.monthlySavings)} saved`, Icon: PiggyBank, iconBg: "bg-[oklch(0.7_0.2_300/0.15)]", iconColor: "text-[oklch(0.65_0.2_300)]", progress: Math.max(0, Math.min(100, s.savingsRate)) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => {
        const positive = it.change !== undefined ? (it.changeGoodWhenNegative ? it.change < 0 : it.change > 0) : null;
        return (
          <Card key={it.title} className="overflow-hidden hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", it.iconBg)}>
                  <it.Icon className={cn("h-5 w-5", it.iconColor)} />
                </div>
                {it.change !== undefined && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-1",
                    positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                  )}>
                    {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {formatPercentage(it.change)}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{it.title}</p>
              <p className="text-2xl font-bold tabular mt-1">{it.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{it.subtitle}</p>
              {it.progress !== undefined && (
                <Progress value={it.progress} className="mt-3 h-1.5" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
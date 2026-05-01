import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_ICONS } from "@/lib/constants";
import { cn, formatDate, getCategoryColor } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import type { Transaction } from "@/types/finance";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { formatAmount } = useCurrency();
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Transactions</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/transactions">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet.</p>
        )}
        {recent.map((t) => {
          const iconName = CATEGORY_ICONS[t.category];
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] ?? Icons.Circle;
          const color = getCategoryColor(t.category);
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1f`, color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="h-5 text-[10px] font-normal">{t.category}</Badge>
                  <span>·</span>
                  <span>{formatDate(t.date, "MMM dd")}</span>
                </div>
              </div>
              <p className={cn("text-sm font-semibold tabular shrink-0", t.type === "income" ? "text-success" : "text-foreground")}>
                {t.type === "income" ? "+" : ""}{formatAmount(Math.abs(t.amount))}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

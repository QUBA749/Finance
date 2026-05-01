import { Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ACCOUNT_TYPE_COLORS } from "@/lib/constants";
import { maskCardNumber } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import type { BankAccount } from "@/types/finance";

export function AccountOverview({ accounts }: { accounts: BankAccount[] }) {
  const { formatAmount } = useCurrency();
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Account Overview</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/accounts">Manage <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">No accounts yet. Add one to get started.</p>
        )}
        <div className="space-y-2">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${a.color} text-white shrink-0`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <Badge className={`${ACCOUNT_TYPE_COLORS[a.type]} border-0 capitalize text-[10px]`}>{a.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground tabular">{a.cardNumber ? maskCardNumber(a.cardNumber) : a.bank}</p>
              </div>
              <p className="text-sm font-semibold tabular shrink-0">{formatAmount(a.balance)}</p>
            </div>
          ))}
        </div>
        {accounts.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-lg font-bold tabular">{formatAmount(total)}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

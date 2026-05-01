import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/context/currency-context";
import type { MonthlyData } from "@/types/finance";

export function IncomeChart({ data }: { data: MonthlyData[] }) {
  const { formatAmount } = useCurrency();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <p className="text-sm text-muted-foreground">Last 12 months overview</p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.19 258)" />
                  <stop offset="100%" stopColor="oklch(0.62 0.19 258 / 0.5)" />
                </linearGradient>
                <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 25)" />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 25 / 0.5)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.5 0.02 257 / 0.2)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => formatAmount(v, { compact: true })} stroke="currentColor" className="text-muted-foreground" />
              <Tooltip
                cursor={{ fill: "oklch(0.5 0.02 257 / 0.08)" }}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, n: string) => [formatAmount(v), n]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="income" fill="url(#incomeBar)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" fill="url(#expenseBar)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

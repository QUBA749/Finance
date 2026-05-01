import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/context/currency-context";
import type { CategoryExpense } from "@/types/finance";

export function ExpenseChart({ data }: { data: CategoryExpense[] }) {
  const { formatAmount } = useCurrency();
  const total = data.reduce((s, c) => s + c.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <p className="text-sm text-muted-foreground">This month breakdown</p>
      </CardHeader>
      <CardContent>
        <div className="relative h-56">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No expenses this month.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((c) => (
                      <Cell key={c.category} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => formatAmount(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold tabular">{formatAmount(total)}</p>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((c) => (
            <div key={c.category} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="flex-1 truncate text-muted-foreground">{c.category}</span>
              <span className="font-semibold tabular">{c.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Download, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrency } from "@/context/currency-context";
import { useMemo } from "react";
import { CATEGORY_COLORS } from "@/lib/constants";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Analytics — FinanceAI" },
      { name: "description", content: "Deep insights into your spending, savings, and income trends." },
    ],
  }),
});

function AnalyticsPage() {
  const { monthly, categoryExpenses, transactions, loading } = useDashboardStats();
  const { exportToCSV } = useTransactions();
  const { formatAmount } = useCurrency();

  const avgSpend = monthly.length ? monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length : 0;
  const topCat = categoryExpenses[0];

  const incomeSources = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "income" || !t.date.startsWith(key)) continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    return Array.from(totals.entries()).map(([name, value]) => ({
      name, value, color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] ?? "#10B981",
    }));
  }, [transactions]);

  return (
    <AppShell>
      <PageHeader title="Financial Analytics" subtitle="Insights into your spending and savings">
        <Select defaultValue="12">
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 30 days</SelectItem>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">1 year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportToCSV}><Download className="h-4 w-4 mr-1.5" />Export Report</Button>
      </PageHeader>

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Avg Monthly Spending" value={formatAmount(avgSpend)} hint="last 12 months" />
            <MetricCard label="Top Category" value={topCat?.category ?? "—"} hint={topCat ? formatAmount(topCat.amount) : ""} />
            <MetricCard label="Income Sources" value={String(incomeSources.length)} hint="this month" />
            <MetricCard label="Transactions" value={String(transactions.length)} hint="all time" tone="success" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle>Savings Trend</CardTitle><p className="text-sm text-muted-foreground">12 months</p></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="savArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.62 0.19 258)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="oklch(0.62 0.19 258)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.5 0.02 257 / 0.2)" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} className="text-muted-foreground" stroke="currentColor" />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => formatAmount(v, { compact: true })} className="text-muted-foreground" stroke="currentColor" />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatAmount(v)} />
                      <Area type="monotone" dataKey="savings" stroke="oklch(0.62 0.19 258)" strokeWidth={2.5} fill="url(#savArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Category Breakdown</CardTitle><p className="text-sm text-muted-foreground">This month</p></CardHeader>
              <CardContent className="space-y-3">
                {categoryExpenses.length === 0 && <p className="text-sm text-muted-foreground">No expenses this month.</p>}
                {categoryExpenses.map((c) => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">{c.category}</span>
                      <span className="text-muted-foreground tabular">{formatAmount(c.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${c.percentage}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle>Income Sources</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  {incomeSources.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No income this month.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={incomeSources} dataKey="value" nameKey="name" outerRadius={90} label>
                          {incomeSources.map((s) => <Cell key={s.name} fill={s.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatAmount(v)} />
                        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Spending Trends</CardTitle><p className="text-sm text-muted-foreground">Monthly</p></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.5 0.02 257 / 0.2)" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} className="text-muted-foreground" stroke="currentColor" />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => formatAmount(v, { compact: true })} className="text-muted-foreground" stroke="currentColor" />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatAmount(v)} />
                      <Bar dataKey="expenses" fill="oklch(0.65 0.2 300)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              icon={<TrendingUp className="h-5 w-5" />}
              tone="warning"
              title="Top spending category"
              desc={topCat ? `${topCat.category} accounts for ${topCat.percentage}% of this month's expenses.` : "Add transactions to see insights."}
              cta="Set a budget"
            />
            <InsightCard
              icon={<Sparkles className="h-5 w-5" />}
              tone="success"
              title="Track your savings"
              desc="Monitor income vs expenses to grow your wealth steadily."
              cta="View milestones"
            />
            <InsightCard
              icon={<TrendingDown className="h-5 w-5" />}
              tone="info"
              title="Reduce recurring costs"
              desc="Review entertainment & utilities to cut monthly bills."
              cta="See how"
            />
          </div>
        </>
      )}
    </AppShell>
  );
}

function MetricCard({ label, value, hint, progress, tone }: { label: string; value: string; hint: string; progress?: number; tone?: "success" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold mt-1 tabular ${tone === "success" ? "text-success" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        {progress !== undefined && <Progress value={progress} className="mt-2 h-1.5" />}
      </CardContent>
    </Card>
  );
}

function InsightCard({ icon, title, desc, cta, tone }: { icon: React.ReactNode; title: string; desc: string; cta: string; tone: "success" | "warning" | "info" }) {
  const toneClass =
    tone === "success" ? "bg-success/10 text-success" :
    tone === "warning" ? "bg-warning/15 text-warning" :
    "bg-primary/10 text-primary";
  return (
    <Card className="hover:shadow-elegant transition-shadow">
      <CardContent className="p-5">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${toneClass}`}>{icon}</div>
        <p className="font-semibold mt-3">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        <Button variant="link" className="px-0 mt-2 h-auto">{cta} →</Button>
      </CardContent>
    </Card>
  );
}

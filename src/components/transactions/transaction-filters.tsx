import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { TransactionCategory, TransactionStatus } from "@/types/finance";

const CATEGORIES: TransactionCategory[] = [
  "Food & Dining","Transportation","Shopping","Entertainment","Healthcare",
  "Utilities","Salary","Freelance","Investment","Housing","Education","Travel","Other",
];

type Props = {
  searchQuery: string; setSearchQuery: (s: string) => void;
  categoryFilter: TransactionCategory | "all";
  setCategoryFilter: (v: TransactionCategory | "all") => void;
  typeFilter: "all" | "income" | "expense";
  setTypeFilter: (v: "all" | "income" | "expense") => void;
  statusFilter: "all" | TransactionStatus;
  setStatusFilter: (v: "all" | TransactionStatus) => void;
  dateFrom: string; setDateFrom: (s: string) => void;
  dateTo: string; setDateTo: (s: string) => void;
  clearFilters: () => void; activeFilterCount: number;
};

export function TransactionFilters(p: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={p.searchQuery}
            onChange={(e) => p.setSearchQuery(e.target.value)}
            placeholder="Search description or merchant…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 lg:flex gap-2">
          <Input type="date" value={p.dateFrom} onChange={(e) => p.setDateFrom(e.target.value)} className="lg:w-40" />
          <Input type="date" value={p.dateTo} onChange={(e) => p.setDateTo(e.target.value)} className="lg:w-40" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={p.categoryFilter} onValueChange={(v) => p.setCategoryFilter(v as TransactionCategory | "all")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={p.typeFilter} onValueChange={(v) => p.setTypeFilter(v as "all" | "income" | "expense")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={p.statusFilter} onValueChange={(v) => p.setStatusFilter(v as "all" | TransactionStatus)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {p.activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={p.clearFilters} className="ml-auto">
            <X className="h-3.5 w-3.5 mr-1" />Clear
            <Badge variant="secondary" className="ml-1.5">{p.activeFilterCount}</Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
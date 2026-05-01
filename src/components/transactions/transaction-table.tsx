import { ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import type { Transaction } from "@/types/finance";

const STATUS_STYLES: Record<Transaction["status"], string> = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/15 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

type Props = {
  rows: Transaction[];
  page: number; totalPages: number; onPage: (n: number) => void;
  onSort: (k: "date" | "amount" | "description") => void;
  onDelete: (id: string) => void;
};

export function TransactionTable({ rows, page, totalPages, onPage, onSort, onDelete }: Props) {
  const { formatAmount } = useCurrency();
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-base font-semibold">No transactions found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>
                <button onClick={() => onSort("date")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Date <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => onSort("description")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Description <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <button onClick={() => onSort("amount")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/40">
                <TableCell><Checkbox /></TableCell>
                <TableCell className="text-sm whitespace-nowrap">{formatDate(t.date, "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{t.description}</div>
                  {t.merchant && <div className="text-xs text-muted-foreground">{t.merchant}</div>}
                </TableCell>
                <TableCell><Badge variant="secondary" className="font-normal">{t.category}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{t.account}</TableCell>
                <TableCell><Badge className={cn(STATUS_STYLES[t.status], "border-0 capitalize")}>{t.status}</Badge></TableCell>
                <TableCell className={cn("text-right tabular font-semibold whitespace-nowrap", t.type === "income" ? "text-success" : "text-foreground")}>
                  {t.type === "income" ? "+" : "-"}{formatAmount(Math.abs(t.amount))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(t.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
            <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => onPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => onPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
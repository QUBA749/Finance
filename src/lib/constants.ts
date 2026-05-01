import type { TransactionCategory, AccountType } from "@/types/finance";

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  "Food & Dining": "#F59E0B",
  Transportation: "#3B82F6",
  Shopping: "#EC4899",
  Entertainment: "#8B5CF6",
  Healthcare: "#EF4444",
  Utilities: "#06B6D4",
  Salary: "#10B981",
  Freelance: "#14B8A6",
  Investment: "#6366F1",
  Housing: "#F97316",
  Education: "#0EA5E9",
  Travel: "#A855F7",
  Other: "#64748B",
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  "Food & Dining": "Utensils",
  Transportation: "Car",
  Shopping: "ShoppingBag",
  Entertainment: "Film",
  Healthcare: "Heart",
  Utilities: "Zap",
  Salary: "Briefcase",
  Freelance: "Laptop",
  Investment: "TrendingUp",
  Housing: "Home",
  Education: "GraduationCap",
  Travel: "Plane",
  Other: "MoreHorizontal",
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  checking: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  savings: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  investment: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  credit: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Transactions", href: "/transactions", icon: "ArrowLeftRight" },
  { label: "Accounts", href: "/accounts", icon: "Wallet" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const DATE_FORMAT = "MMM dd, yyyy";
export const SHORT_DATE_FORMAT = "MMM dd";

export const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
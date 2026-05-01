export type TransactionCategory =
  | "Food & Dining"
  | "Transportation"
  | "Shopping"
  | "Entertainment"
  | "Healthcare"
  | "Utilities"
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Housing"
  | "Education"
  | "Travel"
  | "Other";

export type TransactionType = "income" | "expense";
export type TransactionStatus = "completed" | "pending" | "failed";
export type AccountType = "checking" | "savings" | "investment" | "credit";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  account: string;
  account_id?: string | null;
  merchant?: string;
  notes?: string;
  icon?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  cardNumber: string;
  bank: string;
  color: string;
  isDefault: boolean;
  holder: string;
  expires?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
}
import {
  ACCOUNTS,
  CATEGORY_EXPENSES,
  DASHBOARD_STATS,
  MONTHLY_DATA,
  TRANSACTIONS,
} from "@/lib/data";
import type {
  BankAccount,
  CategoryExpense,
  DashboardStats,
  MonthlyData,
  Transaction,
} from "@/types/finance";

/**
 * Service layer — currently returns mock data.
 * Swap implementations with real API calls when backend is ready.
 */
class FinanceService {
  async getTransactions(): Promise<Transaction[]> {
    return TRANSACTIONS;
  }
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return TRANSACTIONS.find((t) => t.id === id);
  }
  async createTransaction(data: Omit<Transaction, "id">): Promise<Transaction> {
    return { ...data, id: `txn_${Date.now()}` };
  }
  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const existing = TRANSACTIONS.find((t) => t.id === id);
    if (!existing) throw new Error("Transaction not found");
    return { ...existing, ...data };
  }
  async deleteTransaction(_id: string): Promise<void> {
    return;
  }
  async getAccounts(): Promise<BankAccount[]> {
    return ACCOUNTS;
  }
  async getDashboardStats(): Promise<DashboardStats> {
    return DASHBOARD_STATS;
  }
  async getMonthlyData(): Promise<MonthlyData[]> {
    return MONTHLY_DATA;
  }
  async getCategoryExpenses(): Promise<CategoryExpense[]> {
    return CATEGORY_EXPENSES;
  }
  async exportTransactions(_format: "csv" | "pdf"): Promise<Blob> {
    const csv = TRANSACTIONS.map((t) =>
      [t.id, t.date, t.description, t.category, t.amount, t.type, t.status, t.account].join(","),
    ).join("\n");
    return new Blob([csv], { type: "text/csv" });
  }
}

export const financeService = new FinanceService();
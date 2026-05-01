import type {
  BankAccount,
  CategoryExpense,
  DashboardStats,
  MonthlyData,
  Transaction,
} from "@/types/finance";

export const TRANSACTIONS: Transaction[] = [
  { id: "txn_001", date: "2026-04-15", description: "Netflix Subscription", category: "Entertainment", amount: -15.99, type: "expense", status: "completed", account: "Chase Checking", merchant: "Netflix" },
  { id: "txn_002", date: "2026-04-14", description: "Monthly Salary", category: "Salary", amount: 5500.0, type: "income", status: "completed", account: "Chase Checking", merchant: "Employer Corp" },
  { id: "txn_003", date: "2026-04-13", description: "Whole Foods Market", category: "Food & Dining", amount: -127.43, type: "expense", status: "completed", account: "Chase Checking", merchant: "Whole Foods" },
  { id: "txn_004", date: "2026-04-12", description: "Uber Ride", category: "Transportation", amount: -22.5, type: "expense", status: "completed", account: "Credit Card", merchant: "Uber" },
  { id: "txn_005", date: "2026-04-11", description: "Amazon Purchase", category: "Shopping", amount: -89.99, type: "expense", status: "completed", account: "Credit Card", merchant: "Amazon" },
  { id: "txn_006", date: "2026-04-10", description: "Freelance Project", category: "Freelance", amount: 1200.0, type: "income", status: "completed", account: "Chase Checking", merchant: "Acme Studios" },
  { id: "txn_007", date: "2026-04-09", description: "Electric Bill", category: "Utilities", amount: -142.3, type: "expense", status: "completed", account: "Chase Checking", merchant: "ConEd" },
  { id: "txn_008", date: "2026-04-08", description: "Spotify Premium", category: "Entertainment", amount: -9.99, type: "expense", status: "completed", account: "Chase Checking", merchant: "Spotify" },
  { id: "txn_009", date: "2026-04-07", description: "Rent Payment", category: "Housing", amount: -1800.0, type: "expense", status: "completed", account: "Chase Checking", merchant: "Greystar" },
  { id: "txn_010", date: "2026-04-06", description: "Starbucks", category: "Food & Dining", amount: -6.75, type: "expense", status: "completed", account: "Credit Card", merchant: "Starbucks" },
  { id: "txn_011", date: "2026-04-05", description: "Pharmacy", category: "Healthcare", amount: -34.2, type: "expense", status: "completed", account: "Credit Card", merchant: "CVS" },
  { id: "txn_012", date: "2026-04-04", description: "Investment Dividend", category: "Investment", amount: 320.5, type: "income", status: "completed", account: "Investment Portfolio", merchant: "Vanguard" },
  { id: "txn_013", date: "2026-04-03", description: "Apple Store", category: "Shopping", amount: -249.0, type: "expense", status: "pending", account: "Credit Card", merchant: "Apple" },
  { id: "txn_014", date: "2026-04-02", description: "Lyft Ride", category: "Transportation", amount: -18.4, type: "expense", status: "completed", account: "Credit Card", merchant: "Lyft" },
  { id: "txn_015", date: "2026-04-01", description: "Gym Membership", category: "Healthcare", amount: -45.0, type: "expense", status: "completed", account: "Chase Checking", merchant: "Equinox" },
  { id: "txn_016", date: "2026-03-28", description: "Monthly Salary", category: "Salary", amount: 5500.0, type: "income", status: "completed", account: "Chase Checking", merchant: "Employer Corp" },
  { id: "txn_017", date: "2026-03-26", description: "Trader Joes", category: "Food & Dining", amount: -98.2, type: "expense", status: "completed", account: "Chase Checking", merchant: "Trader Joes" },
  { id: "txn_018", date: "2026-03-22", description: "Airbnb Booking", category: "Travel", amount: -420.0, type: "expense", status: "completed", account: "Credit Card", merchant: "Airbnb" },
  { id: "txn_019", date: "2026-03-19", description: "Online Course", category: "Education", amount: -79.0, type: "expense", status: "completed", account: "Credit Card", merchant: "Coursera" },
  { id: "txn_020", date: "2026-03-15", description: "Refund - Returned Item", category: "Shopping", amount: 45.0, type: "income", status: "completed", account: "Credit Card", merchant: "Amazon" },
  { id: "txn_021", date: "2026-03-12", description: "Dinner with Friends", category: "Food & Dining", amount: -68.5, type: "expense", status: "completed", account: "Credit Card", merchant: "Olive Garden" },
  { id: "txn_022", date: "2026-03-10", description: "Internet Bill", category: "Utilities", amount: -79.99, type: "expense", status: "failed", account: "Chase Checking", merchant: "Verizon" },
  { id: "txn_023", date: "2026-03-05", description: "Side Gig Payment", category: "Freelance", amount: 650.0, type: "income", status: "completed", account: "Chase Checking", merchant: "Upwork" },
  { id: "txn_024", date: "2026-02-27", description: "Concert Tickets", category: "Entertainment", amount: -180.0, type: "expense", status: "completed", account: "Credit Card", merchant: "Ticketmaster" },
  { id: "txn_025", date: "2026-02-22", description: "Gas Station", category: "Transportation", amount: -52.3, type: "expense", status: "completed", account: "Credit Card", merchant: "Shell" },
  { id: "txn_026", date: "2026-02-15", description: "Monthly Salary", category: "Salary", amount: 5500.0, type: "income", status: "completed", account: "Chase Checking", merchant: "Employer Corp" },
  { id: "txn_027", date: "2026-02-10", description: "Doctor Visit", category: "Healthcare", amount: -120.0, type: "expense", status: "completed", account: "Chase Checking", merchant: "City Clinic" },
];

export const ACCOUNTS: BankAccount[] = [
  { id: "acc_001", name: "Chase Checking", type: "checking", balance: 12450.32, currency: "USD", cardNumber: "4532123456784532", bank: "Chase", color: "from-blue-500 to-indigo-600", isDefault: true, holder: "Alex Morgan", expires: "08/28" },
  { id: "acc_002", name: "High-Yield Savings", type: "savings", balance: 28750.0, currency: "USD", cardNumber: "5412987654321001", bank: "Ally Bank", color: "from-emerald-500 to-teal-600", isDefault: false, holder: "Alex Morgan", expires: "11/27" },
  { id: "acc_003", name: "Investment Portfolio", type: "investment", balance: 45230.18, currency: "USD", cardNumber: "3782822463100052", bank: "Vanguard", color: "from-violet-500 to-purple-700", isDefault: false, holder: "Alex Morgan", expires: "04/29" },
  { id: "acc_004", name: "Sapphire Credit", type: "credit", balance: -1840.45, currency: "USD", cardNumber: "4147202518930011", bank: "Chase", color: "from-amber-500 to-orange-600", isDefault: false, holder: "Alex Morgan", expires: "06/28" },
];

const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const incomeSeed = [5800, 6100, 5950, 6400, 6200, 5700, 6800, 6500, 6100, 6300, 6450, 6250];
const expenseSeed = [3600, 4100, 3300, 4500, 3800, 3200, 4700, 4200, 3500, 3900, 4050, 3840];

export const MONTHLY_DATA: MonthlyData[] = months.map((month, i) => ({
  month,
  income: incomeSeed[i],
  expenses: expenseSeed[i],
  savings: incomeSeed[i] - expenseSeed[i],
}));

const catRaw = [
  { category: "Housing", amount: 1800, color: "#F97316" },
  { category: "Food & Dining", amount: 650, color: "#F59E0B" },
  { category: "Shopping", amount: 420, color: "#EC4899" },
  { category: "Utilities", amount: 320, color: "#06B6D4" },
  { category: "Transportation", amount: 280, color: "#3B82F6" },
  { category: "Other", amount: 200, color: "#64748B" },
  { category: "Entertainment", amount: 180, color: "#8B5CF6" },
  { category: "Healthcare", amount: 150, color: "#EF4444" },
];
const catTotal = catRaw.reduce((s, c) => s + c.amount, 0);
export const CATEGORY_EXPENSES: CategoryExpense[] = catRaw.map((c) => ({
  ...c,
  percentage: +((c.amount / catTotal) * 100).toFixed(1),
}));

export const DASHBOARD_STATS: DashboardStats = {
  totalBalance: 84590,
  monthlyIncome: 6250,
  monthlyExpenses: 3840,
  monthlySavings: 2410,
  savingsRate: 38.5,
  balanceChange: 2.4,
  incomeChange: 8.2,
  expenseChange: -3.1,
};

export const INCOME_SOURCES = [
  { name: "Salary", value: 5500, color: "#10B981" },
  { name: "Freelance", value: 1200, color: "#14B8A6" },
  { name: "Investment", value: 320, color: "#6366F1" },
];
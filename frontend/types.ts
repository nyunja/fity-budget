
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  name: string;
  method: string;
  category: string;
  icon?: string;
  status?: 'Completed' | 'Pending' | 'Failed';
  wallet?: string;
  notes?: string;
  receipt?: string; // URL or placeholder
}

export type GoalPriority = 'High' | 'Medium' | 'Low';
export type GoalStatus = 'Active' | 'Paused' | 'Completed';

export interface SavingGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
  icon?: string;
  deadline?: string; // ISO Date string or simple string
  priority?: GoalPriority;
  category?: string;
  status?: GoalStatus;
  createdAt?: string;
}

export interface MoneyFlowData {
  month: string;
  income: number;
  expense: number;
}

export interface BudgetCategory {
  name: string;
  value: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  color: string;
  icon?: string;
  isRollover?: boolean;
  type?: 'Fixed' | 'Variable';
  alertThreshold?: number; // Percentage (e.g., 80)
}

export interface StatMetric {
  label: string;
  value: number;
  trend: number; // percentage
  trendDirection: 'up' | 'down';
  prefix?: string;
}

export interface User {
  name: string;
  email: string;
}

export type WalletType = 'Mobile Money' | 'Bank' | 'Cash' | 'Credit' | 'Savings';

export interface WalletAccount {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  accountNumber?: string;
  isDefault?: boolean;
  lastSynced?: string;
}

export interface AnalyticsData {
    spendingTrend: { date: string; amount: number }[];
    categoryBreakdown: { name: string; value: number; color: string }[];
}

export type ViewState = 'login' | 'register' | 'onboarding' | 'dashboard' | 'transactions' | 'goals' | 'budget' | 'settings' | 'analytics' | 'wallet' | 'help';

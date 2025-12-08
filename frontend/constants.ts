
import { BudgetCategory, MoneyFlowData, SavingGoal, StatMetric, Transaction, Budget, WalletAccount } from "./types";

export const STATS: StatMetric[] = [
  { label: 'Total balance', value: 15700.00, trend: 12.1, trendDirection: 'up', prefix: '$' },
  { label: 'Income', value: 8500.00, trend: 6.3, trendDirection: 'up', prefix: '$' },
  { label: 'Expense', value: 6222.00, trend: 2.4, trendDirection: 'down', prefix: '$' },
  { label: 'Total savings', value: 32913.00, trend: 12.1, trendDirection: 'up', prefix: '$' },
];

export const MONEY_FLOW_DATA: MoneyFlowData[] = [
  { month: 'Jan', income: 9500, expense: 8000 },
  { month: 'Feb', income: 10500, expense: 12000 },
  { month: 'Mar', income: 10500, expense: 9500 },
  { month: 'Apr', income: 14000, expense: 12500 },
  { month: 'May', income: 12500, expense: 12000 },
  { month: 'Jun', income: 7500, expense: 6000 },
  { month: 'Jul', income: 9000, expense: 6500 },
];

export const BUDGET_DATA: BudgetCategory[] = [
  { name: 'Cafe & Restaurants', value: 400, color: '#818CF8' },
  { name: 'Entertainment', value: 1200, color: '#A5B4FC' },
  { name: 'Investments', value: 2500, color: '#C7D2FE' },
  { name: 'Food & Groceries', value: 800, color: '#4F46E5' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: '1', category: 'Food & Groceries', limit: 1200, color: '#4F46E5', isRollover: false, type: 'Variable', alertThreshold: 80 },
  { id: '2', category: 'Cafe & Restaurants', limit: 500, color: '#818CF8', isRollover: true, type: 'Variable', alertThreshold: 90 },
  { id: '3', category: 'Entertainment', limit: 300, color: '#A5B4FC', isRollover: false, type: 'Variable' },
  { id: '4', category: 'Shopping', limit: 800, color: '#C7D2FE', isRollover: true, type: 'Variable' },
  { id: '5', category: 'Transportation', limit: 400, color: '#6366F1', isRollover: false, type: 'Fixed' },
  { id: '6', category: 'Utilities', limit: 350, color: '#4338ca', isRollover: false, type: 'Fixed' },
  { id: '7', category: 'Subscription', limit: 100, color: '#818CF8', isRollover: false, type: 'Fixed' },
  { id: '8', category: 'Health & Beauty', limit: 200, color: '#A5B4FC', isRollover: true, type: 'Variable' },
];

export const INITIAL_WALLETS: WalletAccount[] = [
  { id: '1', name: 'M-PESA', type: 'Mobile Money', balance: 12450, currency: 'KES', color: 'bg-green-600', accountNumber: '07•• ••• 453', isDefault: true, lastSynced: 'Just now' },
  { id: '2', name: 'Equity Bank', type: 'Bank', balance: 45000, currency: 'KES', color: 'bg-red-800', accountNumber: '**** 4521', lastSynced: '2 hours ago' },
  { id: '3', name: 'Cash', type: 'Cash', balance: 3200, currency: 'KES', color: 'bg-gray-600' },
  { id: '4', name: 'Savings', type: 'Savings', balance: 120000, currency: 'KES', color: 'bg-indigo-600', accountNumber: 'Lock Savings' },
];

export const TRANSACTIONS: Transaction[] = [
  { id: '1', date: '25 Jul 12:30', amount: -10, name: 'YouTube', method: 'VISA **3254', category: 'Subscription', status: 'Completed', wallet: 'Equity Bank' },
  { id: '2', date: '26 Jul 15:00', amount: -150, name: 'Reserved', method: 'Mastercard **2154', category: 'Shopping', status: 'Pending', wallet: 'M-PESA' },
  { id: '3', date: '27 Jul 9:00', amount: -80, name: 'Yaposhka', method: 'Mastercard **2154', category: 'Cafe & Restaurants', status: 'Completed', wallet: 'Cash' },
  { id: '4', date: '28 Jul 10:15', amount: 2400, name: 'Salary', method: 'Bank Transfer', category: 'Income', status: 'Completed', wallet: 'Equity Bank' },
];

export const ALL_TRANSACTIONS: Transaction[] = [
  ...TRANSACTIONS,
  { id: '5', date: '24 Jul 18:20', amount: -45.50, name: 'Uber Eats', method: 'VISA **3254', category: 'Food & Groceries', status: 'Completed', wallet: 'M-PESA' },
  { id: '6', date: '24 Jul 14:00', amount: -120, name: 'Nike Store', method: 'Mastercard **2154', category: 'Shopping', status: 'Completed', wallet: 'Equity Bank' },
  { id: '7', date: '23 Jul 09:30', amount: -15, name: 'Starbucks', method: 'VISA **3254', category: 'Cafe & Restaurants', status: 'Completed', wallet: 'Cash' },
  { id: '8', date: '22 Jul 20:15', amount: -200, name: 'Electric Bill', method: 'Bank Transfer', category: 'Utilities', status: 'Completed', wallet: 'M-PESA' },
  { id: '9', date: '21 Jul 11:00', amount: 500, name: 'Freelance', method: 'Bank Transfer', category: 'Income', status: 'Completed', wallet: 'M-PESA' },
  { id: '10', date: '20 Jul 16:45', amount: -60, name: 'Gas Station', method: 'Mastercard **2154', category: 'Transportation', status: 'Pending', wallet: 'Cash' },
  { id: '11', date: '19 Jul 13:20', amount: -12.99, name: 'Netflix', method: 'VISA **3254', category: 'Subscription', status: 'Completed', wallet: 'Equity Bank' },
  { id: '12', date: '18 Jul 10:00', amount: -85, name: 'Grocery Store', method: 'Mastercard **2154', category: 'Food & Groceries', status: 'Completed', wallet: 'Cash' },
  { id: '13', date: '17 Jul 09:00', amount: -25, name: 'Gym Membership', method: 'VISA **3254', category: 'Health & Beauty', status: 'Completed', wallet: 'M-PESA' },
  { id: '14', date: '16 Jul 15:30', amount: 150, name: 'Refund', method: 'VISA **3254', category: 'Income', status: 'Completed', wallet: 'Equity Bank' },
];

export const SAVING_GOALS: SavingGoal[] = [
  { 
    id: '1', 
    name: 'MacBook Pro', 
    target: 2500, 
    current: 850, 
    color: 'bg-indigo-500', 
    deadline: '2024-12-15', 
    priority: 'High', 
    category: 'Electronics',
    status: 'Active',
    createdAt: '2024-01-10'
  },
  { 
    id: '2', 
    name: 'New Car', 
    target: 60000, 
    current: 25200, 
    color: 'bg-blue-500', 
    deadline: '2025-06-30', 
    priority: 'Medium', 
    category: 'Vehicle',
    status: 'Active',
    createdAt: '2023-11-05'
  },
  { 
    id: '3', 
    name: 'Dream House', 
    target: 150000, 
    current: 4500, 
    color: 'bg-purple-500', 
    deadline: '2030-01-01', 
    priority: 'Low', 
    category: 'Real Estate',
    status: 'Active',
    createdAt: '2023-01-01'
  },
  { 
    id: '4', 
    name: 'Bali Trip', 
    target: 5000, 
    current: 5000, 
    color: 'bg-green-500', 
    deadline: '2024-08-01', 
    priority: 'Medium', 
    category: 'Travel',
    status: 'Completed',
    createdAt: '2023-09-15'
  },
];

export const USER_NAME = "Adaline";
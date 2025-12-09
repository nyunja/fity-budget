// Transaction types for filtering
export const TRANSACTION_TYPES = ['All', 'Income', 'Expense'] as const;

// Wallet filter options
export const WALLET_FILTERS = ['All', 'M-PESA', 'Bank', 'Cash'] as const;

// Transaction categories
export const TRANSACTION_CATEGORIES = [
  'Shopping',
  'Food & Groceries',
  'Cafe & Restaurants',
  'Transport',
  'Utilities',
  'Income',
] as const;

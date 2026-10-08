// Transaction types for filtering
export const TRANSACTION_TYPES = ['All', 'Income', 'Expense'] as const;

// Wallet filter options
export const WALLET_FILTERS = ['All', 'M-PESA', 'Bank', 'Cash'] as const;

// Transaction categories. These must match the budget categories in
// CreateBudgetModal.tsx so that spending is attributed to the right budget.
export const TRANSACTION_CATEGORIES = [
  'Shopping',
  'Food & Groceries',
  'Cafe & Restaurants',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Health & Beauty',
  'Subscription',
  'Other',
  'Income',
] as const;

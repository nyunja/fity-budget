import { Transaction } from '../../../types';

export const getTransactionsForBudget = (category: string, transactions: Transaction[]) =>
  transactions.filter(t => t.category === category && t.amount < 0);
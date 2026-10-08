import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useAPI, useMutation } from '../../../hooks/useAPI';
import { budgetsAPI, transactionsAPI } from '../../../services/api';
import { Budget, Transaction } from '../../../types';
import MonthlySummary from './MonthlySummary';
import CategoryGrid from './CategoryGrid';
import CreateBudgetModal from './CreateBudgetModal';
import useBudgetAnalysis from '../hooks/useBudgetAnalysis';
import { usePeriod } from '../../../contexts/PeriodContext';

const BudgetPage: React.FC = () => {
  const { startDate, endDate } = usePeriod();

  const { data: budgetsData, loading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } =
    useAPI<{ budgets: Budget[] }>(() => budgetsAPI.list(), { auto: true });

  const { data: transactionsData, loading: txLoading, refetch: refetchTx } =
    useAPI<{ data: Transaction[] }>(
      () => transactionsAPI.list({ start_date: startDate, end_date: endDate }),
      { auto: true, deps: [startDate, endDate] }
    );

  const budgets = budgetsData?.budgets ?? [];
  // Backend returns { data: [...] }; sign amounts from the type field
  const transactions: Transaction[] = (transactionsData?.data ?? []).map((tx: any) => {
    const amount = Math.abs(tx.amount || 0);
    return {
      ...tx,
      amount: tx.type === 'income' ? amount : -amount,
      type: tx.type === 'income' ? 'income' : 'expense',
    } as Transaction;
  });

  const { mutate: createBudget, loading: creating } = useMutation(budgetsAPI.create);
  const { mutate: deleteBudget, loading: deleting } = useMutation(budgetsAPI.delete);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const budgetAnalysis = useBudgetAnalysis(budgets, transactions);

  const handleCreated = () => {
    refetchBudgets();
    setIsFormOpen(false);
  };

  const handleDeleted = async (id: string) => {
    const result = await deleteBudget(id);
    if (result.success) {
      refetchBudgets();
    } else {
      alert(result.error || 'Failed to delete budget');
    }
  };

  if (budgetsLoading || txLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (budgetsError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl">
        <p>Error loading budgets: {budgetsError}</p>
        <button onClick={refetchBudgets} className="mt-2 text-indigo-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <MonthlySummary budgets={budgets} transactions={transactions} analysis={budgetAnalysis} />
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Categories</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your expenses by category</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
            <RefreshCw size={16} />
            <span>Rollover Rules</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <Plus size={18} /> Add Budget
          </button>
        </div>
      </div>

      <CategoryGrid analysis={budgetAnalysis} onDelete={handleDeleted} deleting={deleting} />

      {isFormOpen && (
        <CreateBudgetModal
          onClose={() => setIsFormOpen(false)}
          onSubmit={createBudget}
          loading={creating}
          onSuccess={handleCreated}
        />
      )}
    </div>
  );
};

export default BudgetPage;
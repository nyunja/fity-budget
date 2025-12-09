import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Transaction, WalletAccount } from '../../types';
import { useAPI } from '../../hooks/useAPI';
import { walletsAPI } from '../../services/api';
import { useTransactions } from '../../hooks/transactions/useTransactions';
import { useTransactionMutations } from '../../hooks/transactions/useTransactionMutations';
import { useTransactionFilters } from '../../hooks/transactions/useTransactionFilters';
import { useTransactionForm } from '../../hooks/transactions/useTransactionForm';
import { TransactionHeaderAndFilters } from './TransactionFilters';
import { TransactionList } from './TransactionList';
import { TransactionDetailModal } from './TransactionDetailModal';
import { AddTransactionModal } from './AddTransactionModal';

const TransactionsPage: React.FC = () => {
  // Data fetching
  const { transactions, loading, error, refetch } = useTransactions();

  // Fetch wallets for dropdown
  const { data: walletsData } = useAPI<{ wallets: WalletAccount[] }>(
    () => walletsAPI.list(),
    { auto: true }
  );
  const wallets = walletsData?.wallets || [];

  // Mutations
  const { create: createTransaction, delete: deleteTransaction, creating, deleting } = useTransactionMutations({
    onSuccess: refetch,
  });

  // Filter state
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWallet, setFilterWallet] = useState<string>('All');

  // Filtered data
  const { filteredData, summary, groupedTransactions } = useTransactionFilters(
    transactions,
    filterType,
    searchQuery,
    filterWallet
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Form management
  const { formData, setters, submitError, handleSubmit, resetForm } = useTransactionForm(
    wallets,
    createTransaction,
    refetch
  );

  // Handle delete
  const handleDelete = async (txId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    const result = await deleteTransaction(txId);
    if (result.success) {
      refetch(); // Refresh the list
      setSelectedTx(null); // Close the modal
    } else {
      alert(result.error || 'Failed to delete transaction');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-2">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-600 dark:text-red-400 font-medium">Error loading transactions</p>
            <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {/* Header & Filters */}
      <TransactionHeaderAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterWallet={filterWallet}
        onWalletChange={setFilterWallet}
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* Transaction List */}
      <TransactionList
        groupedTransactions={groupedTransactions}
        onTransactionClick={setSelectedTx}
      />

      {/* Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        wallets={wallets}
        formData={formData}
        setters={setters}
        submitError={submitError}
        onSubmit={handleSubmit}
        creating={creating}
      />
    </div>
  );
};

export default TransactionsPage;

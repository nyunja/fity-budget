
import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Youtube,
  ShoppingBag,
  Coffee,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  X,
  CreditCard,
  Wallet,
  Tag,
  FileText,
  Trash2,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { Transaction, WalletAccount } from '../types';
import { useAPI, useMutation } from '../hooks/useAPI';
import { transactionsAPI, walletsAPI } from '../services/api';

const TransactionsPage: React.FC = () => {
  // Fetch transactions from API
  const { data: transactionsData, loading, error, refetch } = useAPI<{ transactions: any[] }>(
    () => transactionsAPI.list(),
    { auto: true }
  );

  // Fetch wallets for dropdown
  const { data: walletsData } = useAPI<{ wallets: WalletAccount[] }>(
    () => walletsAPI.list(),
    { auto: true }
  );

  // Create transaction mutation
  const { mutate: createTransaction, loading: creating } = useMutation(
    transactionsAPI.create
  );

  // Delete transaction mutation
  const { mutate: deleteTransaction, loading: deleting } = useMutation(
    transactionsAPI.delete
  );

  // Map backend data to frontend format
  const transactions: Transaction[] = useMemo(() => {
    if (!transactionsData?.transactions) return [];

    return transactionsData.transactions.map((tx: any) => ({
      id: tx.id,
      date: new Date(tx.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ''),
      amount: tx.type === 'income' ? tx.amount : -tx.amount,
      name: tx.description,
      method: tx.wallet_id, // Will be replaced with wallet name below
      category: tx.category,
      status: 'Completed',
      wallet: tx.wallet_id,
      notes: tx.notes,
    }));
  }, [transactionsData]);

  const wallets = walletsData?.wallets || [];
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWallet, setFilterWallet] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Add Transaction Form State
  const [newTxType, setNewTxType] = useState<'Expense' | 'Income'>('Expense');
  const [newTxName, setNewTxName] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('Shopping');
  const [newTxMethod, setNewTxMethod] = useState('Credit Card');
  const [newTxWallet, setNewTxWallet] = useState(wallets[0]?.id || '');
  const [newTxNotes, setNewTxNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Helper to get icon
  const getIcon = (name: string) => {
    switch (name) {
      case 'YouTube':
      case 'Netflix': return <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center"><Youtube size={20} fill="currentColor" /></div>;
      case 'Yaposhka':
      case 'Starbucks': return <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Coffee size={20} /></div>;
      case 'Salary':
      case 'Freelance':
      case 'Refund':
        return <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"><DollarSign size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><ShoppingBag size={20} /></div>;
    }
  };

  // 1. Filter Logic
  const filteredData = useMemo(() => {
    return transactions.filter(item => {
      // Type Filter
      if (filterType === 'Income' && item.amount < 0) return false;
      if (filterType === 'Expense' && item.amount > 0) return false;

      // Wallet Filter
      if (filterWallet !== 'All') {
        const methodMatch = item.method.toLowerCase().includes(filterWallet.toLowerCase());
        const walletMatch = item.wallet?.toLowerCase().includes(filterWallet.toLowerCase());
        if (!methodMatch && !walletMatch) return false;
      }

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.method.toLowerCase().includes(query) ||
          (item.notes && item.notes.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filterType, searchQuery, filterWallet, transactions]);

  // 2. Summary Statistics for current view
  const summary = useMemo(() => {
    const income = filteredData.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredData.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return { income, expense, net: income - expense };
  }, [filteredData]);

  // 3. Group by Date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: { date: string, total: number, items: Transaction[] } } = {};

    filteredData.forEach(tx => {
      // Normalize date string. Assuming format "25 Jul 12:30" or similar
      // For grouping, we just want "25 Jul"
      const dateParts = tx.date.split(' ');
      const dayKey = dateParts.slice(0, 2).join(' '); // "25 Jul"

      if (!groups[dayKey]) {
        groups[dayKey] = { date: dayKey, total: 0, items: [] };
      }
      groups[dayKey].items.push(tx);
      groups[dayKey].total += tx.amount;
    });

    // Sort groups by date (approximated by order in array for this demo, or reverse key order)
    // In a real app, parse Date objects.
    return Object.values(groups);
  }, [filteredData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const amount = parseFloat(newTxAmount);
    if (isNaN(amount) || amount <= 0) {
      setSubmitError('Please enter a valid amount');
      return;
    }

    if (!newTxWallet) {
      setSubmitError('Please select a wallet');
      return;
    }

    const result = await createTransaction({
      type: newTxType.toLowerCase() as 'income' | 'expense',
      amount,
      category: newTxCategory,
      description: newTxName,
      wallet_id: newTxWallet,
      date: new Date().toISOString(),
      notes: newTxNotes || undefined,
    });

    if (result.success) {
      refetch(); // Refresh the transaction list
      resetForm();
    } else {
      setSubmitError(result.error || 'Failed to create transaction');
    }
  };

  const resetForm = () => {
    setNewTxName('');
    setNewTxAmount('');
    setNewTxNotes('');
    setSubmitError(null);
    setIsModalOpen(false);
  };

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
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {['All', 'Income', 'Expense'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === type
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
          >
            {type}
          </button>
        ))}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2"></div>
        {['All', 'M-PESA', 'Bank', 'Cash'].map((wallet) => (
          <button
            key={wallet}
            onClick={() => setFilterWallet(wallet)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterWallet === wallet
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
          >
            {wallet === 'All' ? 'All Wallets' : wallet}
          </button>
        ))}
      </div>

      {/* Grouped Transaction List */}
      <div className="space-y-6">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((group, index) => (
            <div key={index} className="animate-fade-in">
              <div className="flex justify-between items-end mb-3 px-2">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wide">{group.date}</h3>
                <span className="text-sm font-medium text-gray-400">
                  Daily Total: <span className={group.total >= 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}>${group.total.toLocaleString()}</span>
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {group.items.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        {getIcon(tx.name)}
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{tx.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{tx.category}</span>
                            <span>•</span>
                            <span>{tx.wallet || tx.method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold text-sm md:text-base ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                            {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{tx.date.split(' ')[2]}</p>
                        </div>
                        <MoreHorizontal size={18} className="text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={24} />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-1">No transactions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTx(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSelectedTx(null)} className="p-2 bg-white dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                  <X size={18} />
                </button>
              </div>
              <div className="mb-4 transform scale-125">
                {getIcon(selectedTx.name)}
              </div>
              <h2 className={`text-3xl font-bold mb-1 ${selectedTx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                {selectedTx.amount > 0 ? '+' : ''}${Math.abs(selectedTx.amount).toLocaleString()}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{selectedTx.name}</p>
              <span className="mt-2 text-xs font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-wide">
                {selectedTx.status || 'Completed'}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Calendar size={16} /> Date & Time</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Tag size={16} /> Category</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Wallet size={16} /> Wallet</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTx.wallet || selectedTx.method}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><CreditCard size={16} /> Method</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTx.method}</span>
              </div>
              {selectedTx.notes && (
                <div className="py-2">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1"><FileText size={16} /> Notes</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                    {selectedTx.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedTx.id)}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Transaction</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Error Message */}
              {submitError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                </div>
              )}

              {/* Type Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewTxType('Expense')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTxType === 'Expense' ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType('Income')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTxType === 'Income' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Income
                </button>
              </div>

              {/* Amount - Big Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                <input
                  type="number"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-3xl font-bold focus:border-indigo-500 outline-none text-center transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  placeholder="e.g. Lunch at KFC"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                  >
                    <option value="Shopping">Shopping</option>
                    <option value="Food & Groceries">Food & Groceries</option>
                    <option value="Cafe & Restaurants">Cafe & Restaurants</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Wallet</label>
                  <select
                    value={newTxWallet}
                    onChange={(e) => setNewTxWallet(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                  >
                    {wallets.length === 0 && <option value="">No wallets available</option>}
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                <textarea
                  value={newTxNotes}
                  onChange={(e) => setNewTxNotes(e.target.value)}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating || wallets.length === 0}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

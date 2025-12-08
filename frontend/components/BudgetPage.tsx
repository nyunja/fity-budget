import React, { useState, useMemo } from 'react';
import {
   Plus,
   Trash2,
   AlertTriangle,
   TrendingUp,
   RefreshCw,
   Lock,
   Unlock,
   ChevronDown,
   X,
   PieChart as PieChartIcon,
   Calendar,
   Wallet,
   Layers,
   ArrowUpRight,
   ArrowDownRight,
   Loader2
} from 'lucide-react';
import { Budget, Transaction } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAPI, useMutation } from '../hooks/useAPI';
import { budgetsAPI, transactionsAPI } from '../services/api';

const BudgetPage: React.FC = () => {
   // Fetch data
   const { data: budgetsData, loading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } = useAPI<{ budgets: Budget[] }>(
      () => budgetsAPI.list(),
      { auto: true }
   );

   const { data: transactionsData, loading: txLoading, refetch: refetchTx } = useAPI<{ transactions: Transaction[] }>(
      () => transactionsAPI.list(),
      { auto: true }
   );

   const budgets = budgetsData?.budgets || [];
   const transactions = transactionsData?.transactions || [];

   // Mutations
   const { mutate: createBudget, loading: creating } = useMutation(budgetsAPI.create);
   const { mutate: deleteBudget, loading: deleting } = useMutation(budgetsAPI.delete);
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
   const [viewTransactionId, setViewTransactionId] = useState<string | null>(null);

   // Form State
   const [formCategory, setFormCategory] = useState('');
   const [formLimit, setFormLimit] = useState('');
   const [formType, setFormType] = useState<'Fixed' | 'Variable'>('Variable');
   const [formRollover, setFormRollover] = useState(false);

   // Calculate Spendings per Budget
   const budgetAnalysis = useMemo(() => {
      return budgets.map(budget => {
         const spent = transactions
            .filter(t => t.category === budget.category && t.amount < 0 && (t.status === 'Completed' || t.status === 'Pending'))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

         const remaining = budget.limit - spent;
         const progress = Math.min(100, (spent / budget.limit) * 100);
         const isOverspent = spent > budget.limit;
         const isWarning = !isOverspent && progress >= (budget.alertThreshold || 80);

         return {
            ...budget,
            spent,
            remaining,
            progress,
            isOverspent,
            isWarning
         };
      });
   }, [budgets, transactions]);

   // Overall Summary Metrics
   const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
   const totalSpent = budgetAnalysis.reduce((acc, b) => acc + b.spent, 0);
   const totalRemaining = totalBudget - totalSpent;
   // Mock Income for context (In a real app, this comes from user settings or income transactions)
   const monthlyIncome = 8500;

   // Data for Summary Chart
   const chartData = [
      { name: 'Budget', value: totalBudget },
      { name: 'Spent', value: totalSpent },
   ];

   const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const result = await createBudget({
         category: formCategory,
         limit: Number(formLimit),
         period: 'Monthly', // Default
         alert_threshold: 85,
         color: '#6366F1'
      });

      if (result.success) {
         refetchBudgets();
         resetForm();
      } else {
         alert(result.error || 'Failed to create budget');
      }
   };

   const handleDeleteBudget = async (id: string) => {
      if (!confirm('Are you sure you want to delete this budget?')) return;

      const result = await deleteBudget(id);
      if (result.success) {
         refetchBudgets();
      } else {
         alert(result.error || 'Failed to delete budget');
      }
   };

   const resetForm = () => {
      setFormCategory('');
      setFormLimit('');
      setFormType('Variable');
      setFormRollover(false);
      setIsFormOpen(false);
   };

   const getTransactionsForBudget = (category: string) => {
      return transactions.filter(t => t.category === category && t.amount < 0);
   };

   if (budgetsLoading || txLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

         {/* 1. Monthly Budget Summary */}
         <div>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
               <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-full shadow-sm">
                  <Calendar size={14} />
                  <span>This Month</span>
               </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

               {/* Monthly Income */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Monthly Income</h3>
                     <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
                        <Wallet size={16} />
                     </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">${monthlyIncome.toLocaleString()}</h2>
               </div>

               {/* Total Budgeted */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Budgeted</h3>
                     <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
                        <Layers size={16} />
                     </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">${totalBudget.toLocaleString()}</h2>
               </div>

               {/* Total Spent */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Spent</h3>
                     <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">${totalSpent.toLocaleString()}</h2>
               </div>

               {/* Remaining */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Remaining</h3>
                     <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
                        <ArrowDownRight size={16} />
                     </div>
                  </div>
                  <h2 className={`text-3xl font-bold ${totalRemaining < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                     ${Math.max(0, totalRemaining).toLocaleString()}
                  </h2>
               </div>
            </div>

            {/* Insight & Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Spending Insight */}
               <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                  <div className="flex items-start gap-4">
                     <div className={`p-3 rounded-xl ${totalSpent > totalBudget ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                        <TrendingUp size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Spending Insight</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                           You have spent <span className="font-bold text-gray-900 dark:text-white">{((totalSpent / monthlyIncome) * 100).toFixed(0)}%</span> of your monthly income.
                           {totalSpent > totalBudget
                              ? <span className="text-red-600 dark:text-red-400 font-medium"> You are currently over your planned budget by ${(totalSpent - totalBudget).toLocaleString()}.</span>
                              : <span className="text-green-600 dark:text-green-400 font-medium"> You are on track to stay within your budget. Great job!</span>}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Simple Visual Chart */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-48 lg:h-auto flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">Budget vs Spent</h3>
                  <div className="flex-1 min-h-[100px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" barSize={30} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                           <Tooltip
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                           />
                           <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {chartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={index === 0 ? '#C7D2FE' : '#6366F1'} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Controls */}
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

         {/* 3. Category Breakdown Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {budgetAnalysis.map((item) => (
               <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-3xl p-6 border transition-all duration-300 hover:shadow-lg cursor-pointer group ${item.isOverspent
                        ? 'border-red-100 dark:border-red-900/30'
                        : item.isWarning
                           ? 'border-yellow-100 dark:border-yellow-900/30'
                           : 'border-gray-100 dark:border-gray-700'
                     }`}
                  onClick={() => setViewTransactionId(item.category === viewTransactionId ? null : item.category)}
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isOverspent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                           }`}>
                           <PieChartIcon size={20} />
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-900 dark:text-white">{item.category}</h3>
                           <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              {item.type === 'Fixed' ? <Lock size={10} /> : <Unlock size={10} />}
                              <span>{item.type}</span>
                              {item.isRollover && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px]">Rollover</span>}
                           </div>
                        </div>
                     </div>
                     <button onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBudget(item.id);
                     }} className="text-gray-300 hover:text-red-500 transition-colors p-1" disabled={deleting}>
                        {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                           <span className={`${item.isOverspent ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                              ${item.spent.toLocaleString()}
                           </span>
                           <span className="text-gray-500 dark:text-gray-400">
                              / ${item.limit.toLocaleString()}
                           </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div
                              className={`h-full rounded-full transition-all duration-1000 ${item.isOverspent
                                    ? 'bg-red-500'
                                    : item.isWarning
                                       ? 'bg-yellow-500'
                                       : 'bg-indigo-600'
                                 }`}
                              style={{ width: `${item.progress}%` }}
                           ></div>
                        </div>
                     </div>

                     <div className="flex justify-between items-center text-xs">
                        {item.isOverspent ? (
                           <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                              <AlertTriangle size={14} />
                              <span>Overspent by ${Math.abs(item.remaining).toLocaleString()}</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <span>{item.remaining.toLocaleString()} remaining</span>
                           </div>
                        )}
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                           Details <ChevronDown size={12} className={`transition-transform ${viewTransactionId === item.category ? 'rotate-180' : ''}`} />
                        </div>
                     </div>
                  </div>

                  {/* Expanded Details: Transaction Mini-List */}
                  {viewTransactionId === item.category && (
                     <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Recent Transactions</h4>
                        <div className="space-y-2">
                           {getTransactionsForBudget(item.category).length > 0 ? (
                              getTransactionsForBudget(item.category).slice(0, 3).map(t => (
                                 <div key={t.id} className="flex justify-between items-center text-sm">
                                    <div>
                                       <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                                       <p className="text-xs text-gray-500">{t.date}</p>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">${Math.abs(t.amount)}</span>
                                 </div>
                              ))
                           ) : (
                              <p className="text-xs text-gray-400 italic">No transactions this month.</p>
                           )}
                           {getTransactionsForBudget(item.category).length > 3 && (
                              <p className="text-center text-xs text-indigo-500 mt-2 font-medium">View all</p>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>

         {/* Create Budget Modal */}
         {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetForm}></div>
               <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in p-8">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Budget Category</h2>
                     <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <X size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleCreateSubmit} className="space-y-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                        <select
                           value={formCategory}
                           onChange={(e) => setFormCategory(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                        >
                           <option value="" disabled>Select a category</option>
                           <option value="Food & Groceries">Food & Groceries</option>
                           <option value="Cafe & Restaurants">Cafe & Restaurants</option>
                           <option value="Transportation">Transportation</option>
                           <option value="Shopping">Shopping</option>
                           <option value="Entertainment">Entertainment</option>
                           <option value="Health & Beauty">Health & Beauty</option>
                           <option value="Utilities">Utilities</option>
                           <option value="Subscription">Subscription</option>
                           <option value="Other">Other</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Monthly Limit</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                           <input
                              type="number"
                              required
                              min="1"
                              value={formLimit}
                              onChange={(e) => setFormLimit(e.target.value)}
                              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                              placeholder="500"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Budget Type</label>
                           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                              <button
                                 type="button"
                                 onClick={() => setFormType('Variable')}
                                 className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formType === 'Variable' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
                              >
                                 Variable
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setFormType('Fixed')}
                                 className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formType === 'Fixed' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
                              >
                                 Fixed
                              </button>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Options</label>
                           <div className="flex items-center gap-3 h-full">
                              <input
                                 type="checkbox"
                                 id="rollover"
                                 checked={formRollover}
                                 onChange={(e) => setFormRollover(e.target.checked)}
                                 className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <label htmlFor="rollover" className="text-sm text-gray-600 dark:text-gray-400">Enable Rollover</label>
                           </div>
                        </div>
                     </div>

                     <button
                        type="submit"
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-colors mt-4"
                     >
                        {creating ? 'Creating...' : 'Set Budget'}
                     </button>
                  </form>
               </div>
            </div>
         )}

      </div>
   );
};

export default BudgetPage;
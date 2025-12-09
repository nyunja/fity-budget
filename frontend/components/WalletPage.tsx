
import React, { useState } from 'react';
import {
   WalletAccount,
   Transaction,
   WalletType
} from '../types';
import {
   Plus,
   ArrowRightLeft,
   ArrowDownLeft,
   ArrowUpRight,
   Eye,
   EyeOff,
   MoreHorizontal,
   Trash2,
   Edit2,
   Smartphone,
   Landmark,
   Banknote,
   CreditCard,
   Lock,
   X,
   CheckCircle2,
   RefreshCw,
   Loader2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { useAPI, useMutation } from '../hooks/useAPI';
import { walletsAPI, transactionsAPI } from '../services/api';

const WalletPage: React.FC = () => {
   // Fetch data
   const { data: walletsData, loading: walletsLoading, error: walletsError, refetch: refetchWallets } = useAPI<{ wallets: WalletAccount[] }>(
      () => walletsAPI.list(),
      { auto: true }
   );

   const { data: transactionsData, loading: txLoading } = useAPI<{ transactions: Transaction[] }>(
      () => transactionsAPI.list(),
      { auto: true }
   );

   const wallets = walletsData?.wallets || [];
   const transactions = transactionsData?.transactions || [];

   // Mutations
   const { mutate: createWallet, loading: creating } = useMutation(walletsAPI.create);
   const { mutate: updateWallet, loading: updating } = useMutation<{ id: string; data: { name?: string; balance?: number; is_default?: boolean } }, { id: string; data: { name?: string; balance?: number; is_default?: boolean } }>(
      ({ id, data }) => walletsAPI.update(id, data)
   );
   const { mutate: deleteWallet, loading: deleting } = useMutation(walletsAPI.delete);
   // Note: Transfer API is not explicitly defined in the provided api.ts, so we'll simulate it with updates for now, 
   // or assume a transfer endpoint exists if we were to add it. 
   // Given the instructions, I will stick to what's available or implement the logic using updates as the original code did, 
   // but using API calls.

   const [showBalance, setShowBalance] = useState(true);
   const [selectedWallet, setSelectedWallet] = useState<WalletAccount | null>(null);
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [isTransferOpen, setIsTransferOpen] = useState(false);

   // Transfer Form State
   const [transferFrom, setTransferFrom] = useState('');
   const [transferTo, setTransferTo] = useState('');
   const [transferAmount, setTransferAmount] = useState('');

   // Wallet Form State
   const [formName, setFormName] = useState('');
   const [formType, setFormType] = useState<WalletType>('Cash');
   const [formBalance, setFormBalance] = useState('');
   const [formColor, setFormColor] = useState('bg-indigo-600');

   // Metrics
   const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
   const totalAvailable = wallets.filter(w => w.type !== 'Savings').reduce((acc, w) => acc + w.balance, 0);

   // Get Icon based on type
   const getWalletIcon = (type: WalletType) => {
      switch (type) {
         case 'Mobile Money': return <Smartphone size={20} />;
         case 'Bank': return <Landmark size={20} />;
         case 'Cash': return <Banknote size={20} />;
         case 'Credit': return <CreditCard size={20} />;
         case 'Savings': return <Lock size={20} />;
         default: return <Landmark size={20} />;
      }
   };

   const handleCreateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const result = await createWallet({
         name: formName,
         type: formType,
         balance: Number(formBalance),
         currency: 'KES',
         color: formColor,
         account_number: '****'
      });

      if (result.success) {
         refetchWallets();
         resetForm();
      } else {
         alert(result.error || 'Failed to create wallet');
      }
   };

   const handleTransferSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const amount = Number(transferAmount);
      const sourceWallet = wallets.find(w => w.id === transferFrom);
      const destWallet = wallets.find(w => w.id === transferTo);

      if (sourceWallet && destWallet && amount > 0 && sourceWallet.balance >= amount) {
         // Perform two updates to simulate transfer
         // In a real app, this should be a single atomic transaction endpoint
         await updateWallet({ id: sourceWallet.id, data: { balance: sourceWallet.balance - amount } });
         await updateWallet({ id: destWallet.id, data: { balance: destWallet.balance + amount } });

         refetchWallets();
         setIsTransferOpen(false);
         setTransferAmount('');
         setTransferFrom('');
         setTransferTo('');
      }
   };

   const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this wallet?')) return;

      const result = await deleteWallet(id);
      if (result.success) {
         refetchWallets();
         setSelectedWallet(null);
      } else {
         alert(result.error || 'Failed to delete wallet');
      }
   };

   const resetForm = () => {
      setFormName('');
      setFormType('Cash');
      setFormBalance('');
      setIsFormOpen(false);
   };

   // Filter transactions for details view
   const walletTransactions = selectedWallet
      ? transactions.filter(t => t.wallet === selectedWallet.name || t.method.includes(selectedWallet.name))
      : [];

   if (walletsLoading || txLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
         </div>
      );
   }

   if (walletsError) {
      return (
         <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl">
            <p>Error loading wallets: {walletsError}</p>
            <button onClick={refetchWallets} className="mt-2 text-indigo-600 hover:underline">Retry</button>
         </div>
      );
   }

   return (
      <div className="space-y-8 animate-fade-in pb-10">

         {/* 1. Top Section - Total Balance */}
         <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-black border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="text-black text-sm font-medium uppercase tracking-wider">Total Balance</span>
                     <button onClick={() => setShowBalance(!showBalance)} className="text-black hover:text-white transition-colors">
                        {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                     </button>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                     {showBalance ? `$${totalBalance.toLocaleString()}` : '••••••••'}
                  </h1>
                  <div className="flex gap-4 text-sm text-black">
                     <span>Available: <span className="font-bold">{showBalance ? `$${totalAvailable.toLocaleString()}` : '••••'}</span></span>
                     <span>•</span>
                     <span>{wallets.length} Active Wallets</span>
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="flex gap-3 w-full md:w-auto">
                  <button
                     onClick={() => setIsFormOpen(true)}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-200 rounded-xl font-bold transition-colors shadow-sm"
                  >
                     <Plus size={18} />
                     <span>Add Money</span>
                  </button>
                  <button
                     onClick={() => setIsTransferOpen(true)}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-200 rounded-xl font-bold transition-colors shadow-sm"
                  >
                     <ArrowRightLeft size={18} />
                     <span>Transfer</span>
                  </button>
               </div>
            </div>
         </div>

         {/* 2. Wallet List */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
               <div
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet)}
                  className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-[${wallet.color}]`}>
                           {getWalletIcon(wallet.type)}
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{wallet.name}</h3>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{wallet.type} • {wallet.accountNumber}</p>
                        </div>
                     </div>
                     <button className="text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                     </button>
                  </div>

                  <div className="space-y-1 mb-4">
                     <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Current Balance</p>
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {showBalance ? `${wallet.currency} ${wallet.balance.toLocaleString()}` : '••••••••'}
                     </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-50 dark:border-gray-700">
                     <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                        <RefreshCw size={12} />
                        <span>Synced {wallet.lastSynced}</span>
                     </div>
                     {wallet.isDefault && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">Default</span>
                     )}
                  </div>
               </div>
            ))}

            {/* Add Wallet Card */}
            <button
               onClick={() => setIsFormOpen(true)}
               className="flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-300"
            >
               <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <Plus size={24} />
               </div>
               <span className="font-bold">Add New Wallet</span>
            </button>
         </div>

         {/* Wallet Detail Modal */}
         {selectedWallet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedWallet(null)}></div>
               <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] animate-fade-in">

                  {/* Left Panel: Wallet Info */}
                  <div className={`w-full md:w-1/3 bg-[${selectedWallet.color}] p-8 text-white flex flex-col justify-between relative overflow-hidden`}>
                     <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                     <div>
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                              {getWalletIcon(selectedWallet.type)}
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold">{selectedWallet.name}</h2>
                              <p className="text-white/80 text-sm">{selectedWallet.type}</p>
                           </div>
                        </div>

                        <div className="mb-8">
                           <p className="text-white/70 text-sm mb-1">Total Balance</p>
                           <h1 className="text-4xl font-bold">${selectedWallet.balance.toLocaleString()}</h1>
                        </div>

                        <div className="space-y-4">
                           <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm font-medium">Income (Mo.)</span>
                                 <ArrowDownLeft size={16} className="text-green-300" />
                              </div>
                              <p className="text-xl font-bold">$2,450</p>
                           </div>
                           <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm font-medium">Expenses (Mo.)</span>
                                 <ArrowUpRight size={16} className="text-red-300" />
                              </div>
                              <p className="text-xl font-bold">$1,200</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2 mt-8">
                        <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                           <Edit2 size={16} /> Edit Wallet
                        </button>
                        <button
                           onClick={() => handleDelete(selectedWallet.id)}
                           disabled={deleting}
                           className="w-full py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                        </button>
                     </div>
                  </div>

                  {/* Right Panel: Transactions */}
                  <div className="flex-1 bg-white dark:bg-gray-800 p-8 flex flex-col">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                        <button onClick={() => setSelectedWallet(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                           <X size={20} />
                        </button>
                     </div>

                     {/* Filter Tabs Mock */}
                     <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold">All</button>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Income</button>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Expenses</button>
                     </div>

                     <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {walletTransactions.length > 0 ? (
                           walletTransactions.map(tx => (
                              <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                       {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                       <p className="font-bold text-gray-900 dark:text-white">{tx.name}</p>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category} • {tx.date}</p>
                                    </div>
                                 </div>
                                 <span className={`font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                                 </span>
                              </div>
                           ))
                        ) : (
                           <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                 <MoreHorizontal size={24} />
                              </div>
                              <p>No recent transactions</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Add Wallet Modal */}
         {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetForm}></div>
               <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Wallet</h2>
                     <button onClick={resetForm}><X size={24} className="text-gray-400" /></button>
                  </div>

                  <form onSubmit={handleCreateSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Wallet Name</label>
                        <input
                           type="text"
                           value={formName}
                           onChange={(e) => setFormName(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                           placeholder="e.g. PayPal"
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                        <select
                           value={formType}
                           onChange={(e) => setFormType(e.target.value as WalletType)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                        >
                           <option value="Mobile Money">Mobile Money</option>
                           <option value="Bank">Bank Account</option>
                           <option value="Cash">Cash</option>
                           <option value="Savings">Savings</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Starting Balance</label>
                        <input
                           type="number"
                           value={formBalance}
                           onChange={(e) => setFormBalance(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                           placeholder="0.00"
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                        <div className="flex gap-2">
                           {['bg-indigo-600', 'bg-green-600', 'bg-red-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500'].map(color => (
                              <button
                                 type="button"
                                 key={color}
                                 onClick={() => setFormColor(color)}
                                 className={`w-8 h-8 rounded-full ${color} ${formColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                              />
                           ))}
                        </div>
                     </div>
                     <button type="submit" disabled={creating} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors disabled:opacity-50">
                        {creating ? 'Adding...' : 'Add Wallet'}
                     </button>
                  </form>
               </div>
            </div>
         )}

         {/* Transfer Modal */}
         {isTransferOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsTransferOpen(false)}></div>
               <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Funds</h2>
                     <button onClick={() => setIsTransferOpen(false)}><X size={24} className="text-gray-400" /></button>
                  </div>

                  <form onSubmit={handleTransferSubmit} className="space-y-4">
                     <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl relative">
                        {/* Connector Line */}
                        <div className="absolute left-8 top-12 bottom-12 w-0.5 border-l-2 border-dashed border-gray-300 dark:border-gray-600"></div>

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">From</label>
                           <select
                              value={transferFrom}
                              onChange={(e) => setTransferFrom(e.target.value)}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                              required
                           >
                              <option value="" disabled>Select Wallet</option>
                              {wallets.map(w => (
                                 <option key={w.id} value={w.id} disabled={w.id === transferTo}>{w.name} (${w.balance})</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">To</label>
                           <select
                              value={transferTo}
                              onChange={(e) => setTransferTo(e.target.value)}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                              required
                           >
                              <option value="" disabled>Select Wallet</option>
                              {wallets.map(w => (
                                 <option key={w.id} value={w.id} disabled={w.id === transferFrom}>{w.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                           <input
                              type="number"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none text-2xl font-bold"
                              placeholder="0.00"
                              required
                           />
                        </div>
                     </div>

                     <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors">
                        Confirm Transfer
                     </button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default WalletPage;
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { WalletAccount, Transaction, WalletType } from '../types';
import { useAPI, useMutation } from '../hooks/useAPI';
import { walletsAPI, transactionsAPI } from '../services/api';
import WalletHeader from './wallet/WalletHeader';
import WalletCard from './wallet/WalletCard';
import WalletDetailModal from './wallet/WalletDetailModal';
import AddWalletModal from './wallet/AddWalletModal';
import TransferModal from './wallet/TransferModal';
import { getWalletIcon } from './wallet/walletUtils';

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
         <WalletHeader
            totalBalance={totalBalance}
            totalAvailable={totalAvailable}
            walletsCount={wallets.length}
            showBalance={showBalance}
            onToggleBalance={() => setShowBalance(!showBalance)}
            onAddMoney={() => setIsFormOpen(true)}
            onTransfer={() => setIsTransferOpen(true)}
         />

         {/* Wallet List */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
               <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  showBalance={showBalance}
                  icon={getWalletIcon(wallet.type)}
                  onClick={() => setSelectedWallet(wallet)}
               />
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

         {/* Modals */}
         {selectedWallet && (
            <WalletDetailModal
               wallet={selectedWallet}
               transactions={walletTransactions}
               icon={getWalletIcon(selectedWallet.type)}
               onClose={() => setSelectedWallet(null)}
               onDelete={handleDelete}
               deleting={deleting}
            />
         )}

         {isFormOpen && (
            <AddWalletModal
               formName={formName}
               formType={formType}
               formBalance={formBalance}
               formColor={formColor}
               creating={creating}
               onNameChange={setFormName}
               onTypeChange={setFormType}
               onBalanceChange={setFormBalance}
               onColorChange={setFormColor}
               onSubmit={handleCreateSubmit}
               onClose={resetForm}
            />
         )}

         {isTransferOpen && (
            <TransferModal
               wallets={wallets}
               transferFrom={transferFrom}
               transferTo={transferTo}
               transferAmount={transferAmount}
               onFromChange={setTransferFrom}
               onToChange={setTransferTo}
               onAmountChange={setTransferAmount}
               onSubmit={handleTransferSubmit}
               onClose={() => setIsTransferOpen(false)}
            />
         )}
      </div>
   );
};

export default WalletPage;

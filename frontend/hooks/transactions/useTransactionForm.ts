import React, { useState, useEffect } from 'react';
import { WalletAccount } from '../../types';

// Hook for managing transaction form state
export const useTransactionForm = (
  wallets: WalletAccount[],
  createTransaction: Function,
  refetch: Function
) => {
  // Add Transaction Form State
  const [newTxType, setNewTxType] = useState<'Expense' | 'Income'>('Expense');
  const [newTxName, setNewTxName] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('Shopping');
  const [newTxMethod, setNewTxMethod] = useState('Credit Card');
  const [newTxWallet, setNewTxWallet] = useState(wallets[0]?.id || '');
  const [newTxNotes, setNewTxNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update wallet when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !newTxWallet) {
      setNewTxWallet(wallets[0].id);
    }
  }, [wallets, newTxWallet]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
      method: newTxMethod,
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
  };

  return {
    formData: {
      type: newTxType,
      name: newTxName,
      amount: newTxAmount,
      category: newTxCategory,
      method: newTxMethod,
      wallet: newTxWallet,
      notes: newTxNotes,
    },
    setters: {
      setType: setNewTxType,
      setName: setNewTxName,
      setAmount: setNewTxAmount,
      setCategory: setNewTxCategory,
      setMethod: setNewTxMethod,
      setWallet: setNewTxWallet,
      setNotes: setNewTxNotes,
    },
    submitError,
    handleSubmit,
    resetForm,
  };
};

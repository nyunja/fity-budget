import React from 'react';
import { Youtube, ShoppingBag, Coffee, DollarSign } from 'lucide-react';
import { Transaction } from '../types';

// Icon mapping function based on category or name
export const getTransactionIcon = (nameOrCategory: string) => {
  const key = nameOrCategory.toLowerCase();

  // Entertainment
  if (key.includes('entertainment') || key.includes('youtube') || key.includes('netflix')) {
    return <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center"><Youtube size={20} fill="currentColor" /></div>;
  }

  // Food & Dining
  if (key.includes('food') || key.includes('dining') || key.includes('restaurant') || key.includes('coffee') || key.includes('starbucks')) {
    return <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Coffee size={20} /></div>;
  }

  // Income
  if (key.includes('income') || key.includes('salary') || key.includes('freelance') || key.includes('refund')) {
    return <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"><DollarSign size={20} /></div>;
  }

  // Default: Shopping
  return <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><ShoppingBag size={20} /></div>;
};

export const formatTransactionDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
};

export const groupTransactionsByDate = (filteredData: Transaction[]) => {
  const groups: { [key: string]: { date: string, dateObj: Date, total: number, items: Transaction[] } } = {};

  filteredData.forEach(tx => {
    // Parse the date string to a Date object
    const dateObj = new Date(tx.date);

    // Create a day key (e.g., "9 Dec") for grouping
    const dayKey = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });

    if (!groups[dayKey]) {
      groups[dayKey] = {
        date: dayKey,
        dateObj: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
        total: 0,
        items: []
      };
    }
    groups[dayKey].items.push(tx);
    groups[dayKey].total += tx.amount;
  });

  // Sort groups by date in descending order (most recent first)
  return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
};

import React from 'react';
import { Search, Bell, Grid, Plus, Sparkles, Loader2 } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onGenerateInsights: () => void;
  isGenerating: boolean;
  insight: string | null;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ onGenerateInsights, isGenerating, insight, user }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Welcome & Profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">It is the best time to manage your finances</p>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Search size={20} />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
          </button>
          <div className="flex items-center gap-3 pl-2">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt="User" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-700"
            />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Box (Dynamic) */}
      {insight && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-3 animate-fade-in">
          <div className="p-2 bg-white dark:bg-indigo-900/50 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-300">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">AI Financial Insight</h4>
            <p className="text-indigo-800 dark:text-indigo-200 text-sm mt-1">{insight}</p>
          </div>
        </div>
      )}

      {/* Second Row: Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-auto transition-colors">
           {/* Simple Date Select Simulation */}
          <button className="px-4 py-2 rounded-full bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">Day</button>
          <button className="px-4 py-2 rounded-full bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">Week</button>
          <button className="px-4 py-2 rounded-full bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium shadow-md">Month</button>
          <button className="px-4 py-2 rounded-full bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">Year</button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
            onClick={onGenerateInsights}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span>Ask AI</span>
          </button>
          {/* <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Grid size={18} />
            <span>Manage widgets</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
            <Plus size={18} />
            <span>Add new widget</span>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
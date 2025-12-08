
import React from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  Target, 
  PieChart, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isDarkMode, toggleTheme, currentView, onNavigate }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' as const },
    { icon: ArrowRightLeft, label: 'Transactions', id: 'transactions' as const },
    { icon: Wallet, label: 'Wallet', id: 'wallet' as const }, 
    { icon: Target, label: 'Goals', id: 'goals' as const }, 
    { icon: PieChart, label: 'Budget', id: 'budget' as const },
    { icon: BarChart2, label: 'Analytics', id: 'analytics' as const },
    { icon: Settings, label: 'Settings', id: 'settings' as const }, 
  ];

  return (
    <div className="hidden lg:flex w-64 h-screen bg-white dark:bg-gray-800 flex-col border-r border-gray-100 dark:border-gray-700 fixed left-0 top-0 z-20 overflow-y-auto transition-colors duration-200">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-black dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">F</div>
        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">FityBudget</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.label}
              onClick={() => {
                // Navigate if view is supported
                if (['dashboard', 'transactions', 'goals', 'budget', 'settings', 'analytics', 'wallet'].includes(item.id)) {
                  onNavigate(item.id as ViewState);
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 mt-auto">
        <button 
          onClick={() => onNavigate('help')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors duration-200 ${
            currentView === 'help' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <HelpCircle size={20} strokeWidth={currentView === 'help' ? 2.5 : 2} />
          <span className={`font-medium ${currentView === 'help' ? 'font-semibold' : ''}`}>Help</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
        >
          <LogOut size={20} />
          <span className="font-medium">Log out</span>
        </button>

        {/* Theme Toggle */}
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full flex items-center justify-between w-20 mx-4 mb-4 transition-colors">
          <button 
            onClick={() => !isDarkMode && toggleTheme()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${!isDarkMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
          >
            <Sun size={14} />
          </button>
          <button 
            onClick={() => isDarkMode && toggleTheme()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400'}`}
          >
            <Moon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

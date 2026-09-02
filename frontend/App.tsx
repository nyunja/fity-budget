
import React, { useState, useEffect } from 'react';
import { Wallet, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/dashboard/Dashboard';
import { Login, Register, Onboarding } from './features/auth';
import TransactionsPage from './components/transactions/TransactionsPage';
import { GoalsPage } from './features/goals';
import { BudgetPage } from './features/budget';
import { AnalyticsPage } from './features/analytics';
import { SettingsPage } from './features/settings';
import WalletPage from './components/WalletPage';
import { HelpPage } from './features/help';

import { setCurrency } from './utils/currency';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PeriodProvider } from './contexts/PeriodContext';
import { User, ViewState } from './types';
import { analyticsAPI, goalsAPI, authAPI } from './services/api';

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, isAuthenticated, login, logout, register } = useAuth();

  // App State
  const [view, setView] = useState<ViewState>('login');
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Effect to redirect based on auth status
  useEffect(() => {
    if (isAuthenticated && (view === 'login' || view === 'register')) {
      setView('dashboard');
    } else if (!isAuthenticated && view !== 'register' && view !== 'onboarding') {
      setView('login');
    }
  }, [isAuthenticated, view]);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Currency display follows the user's profile setting
  useEffect(() => {
    setCurrency(user?.currency);
  }, [user?.currency]);

  // -- Handlers --

  const handleLogin = () => {
    // Login is already handled by AuthContext, just update view
    setView('dashboard');
  };

  const handleRegister = () => {
    // Registration successful, move to onboarding
    setView('onboarding');
  };

  const handleOnboardingComplete = async (data: { income: number; goalName: string; goalAmount: number }) => {
    try {
      // 1. Create the saving goal
      if (data.goalName && data.goalAmount > 0) {
        try {
          await goalsAPI.create({
            name: data.goalName,
            target: data.goalAmount,
            deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Default 1 year deadline
            category: 'General',
            color: '#4F46E5', // Default color
            icon: 'target' // Default icon
          });
        } catch (goalError) {
          console.error('Failed to create goal:', goalError);
          // Import toast dynamically to avoid circular dependencies
          const { toast } = await import('./utils/toast');
          toast.error('Failed to create your savings goal. You can add it later from the Goals page.');
          // Continue with onboarding even if goal creation fails
        }
      }

      // 2. Complete onboarding on backend
      try {
        await authAPI.completeOnboarding({
          monthly_income: data.income,
          currency: 'USD',
          financial_goals: [data.goalName]
        });
      } catch (onboardingError) {
        console.error('Failed to complete onboarding:', onboardingError);
        const { toast } = await import('./utils/toast');
        toast.error('Failed to complete onboarding. Please try again.');
        // Don't redirect if onboarding fails
        return;
      }

      // 3. Show success message and redirect to dashboard
      const { toast } = await import('./utils/toast');
      toast.success('Welcome! Your account is all set up.');
      setView('dashboard');
    } catch (error) {
      console.error('Unexpected error during onboarding:', error);
      const { toast } = await import('./utils/toast');
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    setView('login');
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setInsight(null);
    try {
      const result = await analyticsAPI.getInsights();
      if (result.success && result.data?.insight) {
        setInsight(result.data.insight);
      } else {
        setInsight(result.error?.message || "Unable to retrieve insights.");
      }
    } catch (error) {
      setInsight("Unable to retrieve insights.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Placeholder handlers for dashboard interactions (if any)
  const handleAddTransaction = () => { };
  const handleAddGoal = () => { };
  const handleUpdateGoal = () => { };
  const handleDeleteGoal = () => { };
  const handleAddBudget = () => { };
  const handleUpdateBudget = () => { };
  const handleDeleteBudget = () => { };
  const handleAddWallet = () => { };
  const handleUpdateWallet = () => { };
  const handleDeleteWallet = () => { };

  // Auth Views
  if (view === 'login') return <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
  if (view === 'register') return <Register onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />;
  if (view === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} userName={user?.name || 'User'} />;

  // Main App Layout
  return (
    <div className="flex bg-[#F8F9FD] dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar
        onLogout={handleLogout}
        isDarkMode={darkMode}
        toggleTheme={() => setDarkMode(!darkMode)}
        currentView={view}
        onNavigate={setView}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 lg:ml-64 relative">
        {/* Sticky Header Container with Blur */}
        <div className="sticky top-0 z-10 relative bg-[#F8F9FD]/90 dark:bg-gray-900/90 backdrop-blur-md p-4 pl-16 md:p-8 md:pl-16 lg:pl-8 pb-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden absolute left-4 top-4 w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 shadow-sm"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          {user && (
            <Header
              user={user}
              onGenerateInsights={handleGenerateInsights}
              isGenerating={isGenerating}
              insight={insight}
              showPeriodFilter={view !== 'settings'}
            />
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="px-4 md:px-8 pb-8 min-h-[calc(100vh-140px)]">

          {/* Dashboard View */}
          {view === 'dashboard' && (
            <Dashboard />
          )}

          {/* Transactions View */}
          {view === 'transactions' && (
            <TransactionsPage />
          )}

          {/* Goals View */}
          {view === 'goals' && (
            <GoalsPage />
          )}

          {/* Budget View */}
          {view === 'budget' && (
            <BudgetPage />
          )}

          {/* Analytics View */}
          {view === 'analytics' && (
            <AnalyticsPage />
          )}

          {/* Settings View */}
          {view === 'settings' && user && (
            <SettingsPage
              user={user}
              isDarkMode={darkMode}
              toggleTheme={() => setDarkMode(!darkMode)}
              onLogout={handleLogout}
            />
          )}

          {/* Wallet View */}
          {view === 'wallet' && (
            <WalletPage />
          )}

          {/* Help View */}
          {view === 'help' && (
            <HelpPage />
          )}

        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PeriodProvider>
        <AppContent />
      </PeriodProvider>
    </AuthProvider>
  );
};

export default App;

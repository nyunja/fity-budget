
import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Onboarding from './components/Onboarding';
import TransactionsPage from './components/TransactionsPage';
import GoalsPage from './components/GoalsPage';
import BudgetPage from './components/BudgetPage';
import SettingsPage from './components/SettingsPage';
import AnalyticsPage from './components/AnalyticsPage';
import WalletPage from './components/WalletPage';
import HelpPage from './components/HelpPage';
import { STATS, SAVING_GOALS, MONEY_FLOW_DATA, BUDGET_DATA, USER_NAME, ALL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_WALLETS } from './constants';
import { getFinancialInsights } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { User, StatMetric, Transaction, SavingGoal, MoneyFlowData, BudgetCategory, ViewState, Budget, WalletAccount } from './types';
import { useAPI } from './hooks/useAPI';
import { analyticsAPI, transactionsAPI, goalsAPI, budgetsAPI, walletsAPI, authAPI } from './services/api';

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, isAuthenticated, login, logout, register } = useAuth();

  // App State
  const [view, setView] = useState<ViewState>('login');
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch data for insights generation (Header component)
  const { data: dashboardData } = useAPI<{ stats: StatMetric[] }>(
    () => analyticsAPI.getDashboard(),
    { auto: isAuthenticated }
  );

  const { data: recentTransactions } = useAPI<{ transactions: Transaction[] }>(
    () => transactionsAPI.list({ limit: 5 }),
    { auto: isAuthenticated }
  );

  const { data: goalsData } = useAPI<{ goals: SavingGoal[] }>(
    () => goalsAPI.list(),
    { auto: isAuthenticated }
  );

  const stats = dashboardData?.stats || [];
  const transactions = recentTransactions?.transactions || [];
  const goals = goalsData?.goals || [];

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
            target_amount: data.goalAmount,
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
      const result = await getFinancialInsights(stats, transactions, goals);
      setInsight(result);
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
      />

      <div className="flex-1 lg:ml-64 relative">
        {/* Sticky Header Container with Blur */}
        <div className="sticky top-0 z-10 bg-[#F8F9FD]/90 dark:bg-gray-900/90 backdrop-blur-md p-4 md:p-8 pb-4">
          {user && (
            <Header
              user={user}
              onGenerateInsights={handleGenerateInsights}
              isGenerating={isGenerating}
              insight={insight}
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
      <AppContent />
    </AuthProvider>
  );
};

export default App;

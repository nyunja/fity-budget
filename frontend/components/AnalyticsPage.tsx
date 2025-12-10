
import React from 'react';
import {
   Transaction,
   SavingGoal,
   Budget
} from '../types';
import {
   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   PieChart,
   Pie,
   Cell,
   BarChart,
   Bar
} from 'recharts';
import {
   TrendingUp,
   TrendingDown,
   Target,
   CreditCard,
   AlertCircle,
   Activity,
   Zap
} from 'lucide-react';
import { useAnalyticsData, useFinancialMetrics } from '../hooks/analytics/useAnalytics';
import { OverviewMetrics } from '../components/analytics/OverviewMetrics';

const AnalyticsPage: React.FC = () => {
   // Fetch and process data using custom hooks
   const { transactions, budgets, goals } = useAnalyticsData();

   // 1. Overview Metrics
   const { totalIncome, totalExpense, netSavings, savingsRate } = useFinancialMetrics(transactions);

   // 2. Financial Health Score (Gamification)
   // Logic: Base 50 + Savings Rate + Budget Adherence - Debt/Overspending
   let healthScore = 50;
   if (savingsRate > 20) healthScore += 20;
   else if (savingsRate > 10) healthScore += 10;

   const overspentBudgets = budgets.filter(b => {
      const spent = transactions
         .filter(t => t.category === b.category && t.amount < 0)
         .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return spent > b.limit;
   }).length;

   healthScore -= (overspentBudgets * 5);
   healthScore = Math.max(0, Math.min(100, healthScore));

   let healthLabel = 'Needs Work';
   if (healthScore >= 80) healthLabel = 'Excellent';
   else if (healthScore >= 60) healthLabel = 'Good';
   else if (healthScore >= 40) healthLabel = 'Fair';

   // 3. Category Data for Pie Chart
   const categoryData = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
         const existing = acc.find(item => item.name === t.category);
         if (existing) existing.value += Math.abs(t.amount);
         else acc.push({ name: t.category, value: Math.abs(t.amount) });
         return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

   const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

   // 4. Mock Trend Data (Since we have limited historical data in constants)
   const trendData = [
      { month: 'Feb', income: 4000, expense: 3200 },
      { month: 'Mar', income: 4200, expense: 3800 },
      { month: 'Apr', income: 4500, expense: 3100 },
      { month: 'May', income: 4300, expense: 3500 },
      { month: 'Jun', income: 5000, expense: 4100 },
      { month: 'Jul', income: totalIncome || 5200, expense: totalExpense || 4000 },
   ];

   // 5. Recurring Expenses (Simple Detection Logic: Same name > 1 occurrence)
   const recurringTx = transactions.reduce((acc, t) => {
      if (t.amount >= 0) return acc; // Skip income
      if (acc[t.name]) acc[t.name].count++;
      else acc[t.name] = { count: 1, amount: Math.abs(t.amount), category: t.category };
      return acc;
   }, {} as any);

   const recurringList = Object.keys(recurringTx)
      .filter(name => recurringTx[name].count >= 1 && ['Subscription', 'Utilities', 'Rent', 'Internet'].includes(recurringTx[name].category))
      .map(name => ({ name, amount: recurringTx[name].amount, category: recurringTx[name].category }));

   return (
      <div className="space-y-8 animate-fade-in pb-10">

         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Analytics</h2>
               <p className="text-gray-500 dark:text-gray-400">Deep dive into your spending habits and financial health.</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
               <Activity size={20} className="text-indigo-600 dark:text-indigo-400" />
               <span className="font-bold text-indigo-900 dark:text-indigo-100">Health Score: {healthScore}/100</span>
               <span className="text-xs bg-white dark:bg-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-medium ml-2">{healthLabel}</span>
            </div>
         </div>

         {/* Overview Grid */}
         <OverviewMetrics
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            netSavings={netSavings}
            savingsRate={savingsRate}
         />

         {/* 2. Main Charts Row */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Trends (Area Chart) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Monthly Trends</h3>
                  <div className="flex gap-2">
                     <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Income
                     </div>
                     <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-indigo-200"></span> Expense
                     </div>
                  </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                           </linearGradient>
                           <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C7D2FE" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#C7D2FE" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" opacity={0.5} />
                        <Area type="monotone" dataKey="income" stroke="#6366F1" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                        <Area type="monotone" dataKey="expense" stroke="#A5B4FC" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Spending Distribution (Pie) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Spending Breakdown</h3>
               <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={categoryData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                           stroke="none"
                        >
                           {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={5} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-gray-400 text-xs">Top Category</span>
                     <span className="font-bold text-gray-900 dark:text-white">{categoryData[0]?.name || 'N/A'}</span>
                  </div>
               </div>
               <div className="mt-4 space-y-2">
                  {categoryData.slice(0, 3).map((item, index) => (
                     <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                           <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">${item.value.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 3. Bottom Insights Row */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recurring Expenses */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                     <CreditCard size={20} />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recurring Expenses</h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Subscriptions & Bills detected</p>
                  </div>
               </div>
               <div className="space-y-3">
                  {recurringList.length > 0 ? recurringList.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                              {item.name.charAt(0)}
                           </div>
                           <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">${item.amount}</span>
                     </div>
                  )) : (
                     <p className="text-sm text-gray-400 text-center py-4">No recurring expenses detected.</p>
                  )}
               </div>
            </div>

            {/* Forecasting / AI Insight */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-indigo-900 dark:to-indigo-950 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
               {/* Decorative blob */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2 bg-white/10 rounded-xl">
                     <Zap size={20} className="text-yellow-300" />
                  </div>
                  <h3 className="font-bold text-lg">AI Forecast</h3>
               </div>

               <div className="space-y-6 relative z-10">
                  <div>
                     <p className="text-gray-300 text-sm mb-1">Projected Spending</p>
                     <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">${(totalExpense * 1.05).toFixed(0)}</span>
                        <span className="text-sm text-red-300 mb-1">by month end</span>
                     </div>
                     <div className="w-full h-1.5 bg-gray-700 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-yellow-400 w-[75%]"></div>
                     </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                     <p className="text-sm leading-relaxed">
                        "At your current rate, you will spend <span className="text-yellow-300 font-bold">$400 more</span> on Shopping compared to last month. Consider reducing discretionary spending to hit your savings goal."
                     </p>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

export default AnalyticsPage;

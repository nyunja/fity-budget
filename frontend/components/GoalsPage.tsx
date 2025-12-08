import React, { useState, useMemo } from 'react';
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  MoreHorizontal,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { SavingGoal, GoalPriority } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAPI, useMutation } from '../hooks/useAPI';
import { goalsAPI } from '../services/api';

const GoalsPage: React.FC = () => {
  // Fetch goals from API
  const { data: goalsData, loading, error, refetch } = useAPI(
    () => goalsAPI.list(),
    { auto: true }
  );

  // Create goal mutation
  const { mutate: createGoal, loading: creating } = useMutation(
    goalsAPI.create
  );

  // Update goal progress mutation
  const { mutate: updateProgress, loading: updating } = useMutation(
    goalsAPI.updateProgress
  );

  // Delete goal mutation
  const { mutate: deleteGoal, loading: deleting } = useMutation(
    goalsAPI.delete
  );

  // Map backend data to frontend format
  const goals: SavingGoal[] = useMemo(() => {
    if (!goalsData?.goals) return [];

    return goalsData.goals.map((g: any) => ({
      id: g.id,
      name: g.name,
      target: g.target_amount,
      current: g.current_amount,
      deadline: g.deadline,
      priority: g.priority as GoalPriority,
      category: g.category,
      status: g.status,
      color: 'bg-indigo-500',
      createdAt: g.created_at
    }));
  }, [goalsData]);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed' | 'Paused'>('All');

  // Form State
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPriority, setFormPriority] = useState<GoalPriority>('Medium');
  const [formCategory, setFormCategory] = useState('General');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derived Metrics
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
  const averageProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const activeGoalsCount = goals.filter(g => g.status === 'Active').length;

  const filteredGoals = goals.filter(g => filterStatus === 'All' || g.status === filterStatus);

  // Indigo shades to match BudgetChart
  const CHART_COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#6366F1'];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'Medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateMonthlySavings = (goal: SavingGoal) => {
    if (!goal.deadline) return 0;
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const months = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());
    if (months <= 0) return goal.target - goal.current;
    return (goal.target - goal.current) / months;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const target = parseFloat(formTarget);
    const current = parseFloat(formCurrent) || 0;

    if (isNaN(target) || target <= 0) {
      setSubmitError('Please enter a valid target amount');
      return;
    }

    if (current < 0 || current > target) {
      setSubmitError('Initial saved amount must be between 0 and target');
      return;
    }

    const result = await createGoal({
      name: formName,
      target_amount: target,
      current_amount: current,
      deadline: formDeadline,
      priority: formPriority.toLowerCase() as 'low' | 'medium' | 'high',
      category: formCategory,
    });

    if (result.success) {
      refetch(); // Refresh the goals list
      resetForm();
    } else {
      setSubmitError(result.error || 'Failed to create goal');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormTarget('');
    setFormCurrent('');
    setFormDeadline('');
    setFormCategory('General');
    setSubmitError(null);
    setIsFormOpen(false);
  };

  const handleAddAmount = async (goalId: string, amount: number) => {
    const result = await updateProgress({ id: goalId, amount });
    if (result.success) {
      refetch(); // Refresh the goals list
      // Update selected goal if it's currently open
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal({
          ...selectedGoal,
          current: Math.min(selectedGoal.target, selectedGoal.current + amount)
        });
      }
    } else {
      alert(result.error || 'Failed to update goal progress');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const result = await deleteGoal(goalId);
    if (result.success) {
      refetch(); // Refresh the list
      setSelectedGoal(null); // Close the modal
    } else {
      alert(result.error || 'Failed to delete goal');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-2">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-600 dark:text-red-400 font-medium">Error loading goals</p>
            <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      
      {/* Top Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
           <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                 <Target className="text-white" size={24} />
              </div>
              <span className="text-indigo-100 text-sm font-medium bg-white/10 px-2 py-1 rounded-lg">Overview</span>
           </div>
           <p className="text-indigo-100 text-sm mb-1">Total Saved</p>
           <h2 className="text-3xl font-bold mb-4">${totalSaved.toLocaleString()}</h2>
           <div className="w-full bg-black/20 rounded-full h-2 mb-2">
              <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{ width: `${averageProgress}%` }}></div>
           </div>
           <p className="text-xs text-indigo-100 opacity-80">{averageProgress.toFixed(1)}% of total ${totalTarget.toLocaleString()} goal</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Goals</p>
               <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeGoalsCount}</h3>
             </div>
             <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
               <TrendingUp size={20} />
             </div>
           </div>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
             You are saving across {goals.length} different categories.
           </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
             {/* Simple Pie Chart for Category Distribution */}
             <div className="w-1/2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={goals} 
                      dataKey="target" 
                      nameKey="category" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={50} 
                      fill="#8884d8" 
                      paddingAngle={5}
                      stroke="none"
                    >
                      {goals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-1/2 pl-2">
               <p className="text-sm font-bold text-gray-900 dark:text-white">Distribution</p>
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your financial focus is balanced across categories.</p>
             </div>
        </div>
      </div>

      {/* Controls & Heading */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Goals</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your savings targets</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
             {['All', 'Active', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {status}
                </button>
             ))}
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <Plus size={18} /> Create Goal
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          return (
            <div 
              key={goal.id} 
              onClick={() => setSelectedGoal(goal)}
              className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
               {/* Progress Background Overlay (subtle) */}
               <div className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-transparent to-indigo-500/10 w-full"></div>

               <div className="flex justify-between items-start mb-4">
                 <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getPriorityColor(goal.priority)}`}>
                        {goal.priority} Priority
                      </span>
                      {goal.status === 'Completed' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Done
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{goal.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{goal.category}</p>
                 </div>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
                    <Target size={20} />
                 </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-500 dark:text-gray-400">Saved</span>
                       <span className="font-bold text-gray-900 dark:text-white">${goal.current.toLocaleString()} <span className="text-gray-400 font-normal">/ ${goal.target.toLocaleString()}</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                     <Calendar size={14} />
                     {goal.deadline ? (
                       <span>Target: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                     ) : (
                       <span>No deadline set</span>
                     )}
                     <div className="ml-auto font-medium text-gray-900 dark:text-white">
                        {progress.toFixed(0)}%
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedGoal(null)}></div>
           <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Left Color Sidebar */}
              <div className={`hidden md:block w-24 bg-indigo-600 dark:bg-indigo-800 relative`}>
                 <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Target size={24} />
                 </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGoal.name}</h2>
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPriorityColor(selectedGoal.priority)}`}>{selectedGoal.priority}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Created on {new Date(selectedGoal.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                       <button
                        disabled={updating}
                        onClick={() => setSelectedGoal({ ...selectedGoal, status: selectedGoal.status === 'Paused' ? 'Active' : 'Paused' as any })}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors disabled:opacity-50"
                        title={selectedGoal.status === 'Paused' ? "Resume" : "Pause"}
                       >
                          {selectedGoal.status === 'Paused' ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
                       </button>
                       <button
                        onClick={() => handleDeleteGoal(selectedGoal.id)}
                        disabled={deleting}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50"
                        title="Delete"
                       >
                          {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                       </button>
                       <button onClick={() => setSelectedGoal(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                          <X size={20} />
                       </button>
                    </div>
                 </div>

                 {/* Status Bar */}
                 <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                       <span className="text-gray-900 dark:text-white">${selectedGoal.current.toLocaleString()} Saved</span>
                       <span className="text-gray-500 dark:text-gray-400">Target: ${selectedGoal.target.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-1000 relative`} 
                         style={{ width: `${(selectedGoal.current / selectedGoal.target) * 100}%` }}
                       >
                          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                       </div>
                    </div>
                 </div>

                 {/* Insights Section */}
                 {selectedGoal.status !== 'Completed' && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl mb-8 border border-indigo-100 dark:border-indigo-800 flex gap-4">
                      <div className="text-indigo-600 dark:text-indigo-400 mt-1">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1">Smart Insight</h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                           To reach your goal by <span className="font-semibold">{selectedGoal.deadline ? new Date(selectedGoal.deadline).toLocaleDateString() : 'your deadline'}</span>, you should aim to save approximately <span className="font-bold text-lg">${Math.max(0, calculateMonthlySavings(selectedGoal)).toFixed(0)}</span> per month.
                        </p>
                      </div>
                  </div>
                 )}

                 {/* Actions */}
                 <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Quick Actions</h4>
                    <div className="flex gap-3">
                       <button
                        onClick={() => handleAddAmount(selectedGoal.id, 100)}
                        disabled={selectedGoal.status === 'Completed' || updating}
                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                         {updating ? 'Updating...' : '+ Add $100'}
                       </button>
                       <button
                        onClick={() => handleAddAmount(selectedGoal.id, 500)}
                        disabled={selectedGoal.status === 'Completed' || updating}
                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                         {updating ? 'Updating...' : '+ Add $500'}
                       </button>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetForm}></div>
           <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in p-8">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Goal</h2>
                 <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                 {/* Error Message */}
                 {submitError && (
                   <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                     <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                     <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                   </div>
                 )}

                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none"
                      placeholder="e.g. Emergency Fund"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Amount</label>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                         <input 
                           type="number" 
                           required
                           min="1"
                           value={formTarget}
                           onChange={(e) => setFormTarget(e.target.value)}
                           className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                           placeholder="5000"
                         />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Initial Saved</label>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                         <input 
                           type="number" 
                           min="0"
                           value={formCurrent}
                           onChange={(e) => setFormCurrent(e.target.value)}
                           className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                           placeholder="0"
                         />
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deadline</label>
                       <input 
                         type="date" 
                         required
                         value={formDeadline}
                         onChange={(e) => setFormDeadline(e.target.value)}
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                       <select 
                         value={formPriority} 
                         onChange={(e) => setFormPriority(e.target.value as GoalPriority)}
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                       >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
                    >
                       <option value="General">General</option>
                       <option value="Vehicle">Vehicle</option>
                       <option value="Real Estate">Real Estate</option>
                       <option value="Travel">Travel</option>
                       <option value="Electronics">Electronics</option>
                       <option value="Education">Education</option>
                    </select>
                 </div>

                 <button
                   type="submit"
                   disabled={creating}
                   className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {creating ? 'Creating...' : 'Create Goal'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default GoalsPage;
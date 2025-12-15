import React from 'react';
import { X } from 'lucide-react';
import useBudgetForm from '../hooks/useBudgetForm';

const CreateBudgetModal: React.FC<{
  onClose: () => void;
  onSubmit: (payload: any) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  onSuccess: () => void;
}> = ({ onClose, onSubmit, loading, onSuccess }) => {
  const { form, setters, reset } = useBudgetForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onSubmit({
      category: form.category,
      limit: Number(form.limit),
      period: 'Monthly',
      alert_threshold: 85,
      color: '#6366F1',
    });
    if (res.success) {
      reset();
      onSuccess();
    } else {
      alert(res.error || 'Failed to create budget');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Budget Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
            <select
              value={form.category}
              onChange={e => setters.setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
            >
              <option value="" disabled>Select a category</option>
              <option>Food & Groceries</option>
              <option>Cafe & Restaurants</option>
              <option>Transportation</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Health & Beauty</option>
              <option>Utilities</option>
              <option>Subscription</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                required
                min="1"
                value={form.limit}
                onChange={e => setters.setLimit(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Budget Type</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setters.setType('Variable')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'Variable' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
                >
                  Variable
                </button>
                <button
                  type="button"
                  onClick={() => setters.setType('Fixed')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.type === 'Fixed' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
                >
                  Fixed
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Options</label>
              <div className="flex items-center gap-3 h-full">
                <input
                  type="checkbox"
                  checked={form.rollover}
                  onChange={e => setters.setRollover(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label className="text-sm text-gray-600 dark:text-gray-400">Enable Rollover</label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-colors mt-4 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Set Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBudgetModal;
import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { budgetsAPI } from '../../../services/api';
import { toast } from '../../../utils/toast';
import { BudgetAnalysis } from '../hooks/useBudgetAnalysis';

interface RolloverRulesModalProps {
  budgets: BudgetAnalysis[];
  onClose: () => void;
  onSaved: () => void;
}

const RolloverRulesModal: React.FC<RolloverRulesModalProps> = ({ budgets, onClose, onSaved }) => {
  const [rollover, setRollover] = useState<Record<string, boolean>>(
    Object.fromEntries(budgets.map((b) => [b.id, !!b.isRollover]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const toggle = async (id: string) => {
    const next = !rollover[id];
    setRollover((prev) => ({ ...prev, [id]: next }));
    setSavingId(id);

    const result = await budgetsAPI.update(id, { is_rollover: next });
    setSavingId(null);

    if (result.success) {
      setChanged(true);
    } else {
      // Revert on failure
      setRollover((prev) => ({ ...prev, [id]: !next }));
      toast.error(result.error?.message || 'Failed to update rollover rule');
    }
  };

  const handleClose = () => {
    if (changed) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RotateCcw size={22} /> Rollover Rules
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          When enabled, any unspent amount carries over to the next period for that category.
        </p>

        {budgets.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-8">No budgets to configure yet.</p>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{budget.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {budget.isRollover ? 'Rollover enabled' : 'Rollover disabled'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!rollover[budget.id]}
                    disabled={savingId === budget.id}
                    onChange={() => toggle(budget.id)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-6 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default RolloverRulesModal;

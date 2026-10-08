import React, { useState } from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from '../../../utils/toast';

interface DeleteAccountModalProps {
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDeleting(true);

    const result = await authAPI.deleteAccount(password);
    setDeleting(false);

    if (result.success) {
      toast.success('Your account has been deleted');
      logout();
    } else {
      setError(result.error?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 size={22} /> Delete Account
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 mb-6">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">
            This permanently deletes your account, transactions, budgets, goals and wallets. This cannot be undone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Confirm your password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-red-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;

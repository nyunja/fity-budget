import { useMutation } from '../useAPI';
import { transactionsAPI } from '../../services/api';

// Hook for transaction mutations (create, delete)
export const useTransactionMutations = ({ onSuccess }: { onSuccess?: () => void }) => {
  // Create transaction mutation
  const { mutate: createTransaction, loading: creating } = useMutation(
    transactionsAPI.create
  );

  // Delete transaction mutation
  const { mutate: deleteTransaction, loading: deleting } = useMutation(
    transactionsAPI.delete
  );

  return {
    create: createTransaction,
    delete: deleteTransaction,
    creating,
    deleting,
  };
};

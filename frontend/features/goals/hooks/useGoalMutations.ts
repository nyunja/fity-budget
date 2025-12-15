import { useMutation } from '../../../hooks/useAPI';
import { goalsAPI } from '../../../services/api';

interface UseGoalMutationsProps {
  onSuccess?: () => void;
}

export const useGoalMutations = ({ onSuccess }: UseGoalMutationsProps = {}) => {
  // Create goal mutation
  const { mutate: createGoal, loading: creating, error: createError } = useMutation(
    goalsAPI.create
  );

  // Update goal progress mutation
  const { mutate: updateProgress, loading: updating, error: updateError } = useMutation(
    ({ id, amount }: { id: string; amount: number }) => goalsAPI.updateProgress(id, amount)
  );

  // Delete goal mutation
  const { mutate: deleteGoal, loading: deleting, error: deleteError } = useMutation(
    goalsAPI.delete
  );

  const handleCreate = async (data: any) => {
    const result = await createGoal(data);
    if (result.success && onSuccess) {
      onSuccess();
    }
    return result;
  };

  const handleUpdateProgress = async (id: string, amount: number) => {
    const result = await updateProgress({ id, amount });
    if (result.success && onSuccess) {
      onSuccess();
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    const result = await deleteGoal(id);
    if (result.success && onSuccess) {
      onSuccess();
    }
    return result;
  };

  return {
    create: handleCreate,
    updateProgress: handleUpdateProgress,
    delete: handleDelete,
    creating,
    updating,
    deleting,
    createError,
    updateError,
    deleteError
  };
};


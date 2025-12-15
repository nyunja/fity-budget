import { useMemo } from 'react';
import { useAPI } from '../../../hooks/useAPI';
import { goalsAPI } from '../../../services/api';
import { SavingGoal, GoalPriority } from '../../../types';

interface GoalsListResponse {
  goals: any[];
}

export const useGoals = () => {
  const { data: goalsData, loading, error, refetch } = useAPI<GoalsListResponse>(
    () => goalsAPI.list(),
    { auto: true }
  );

  // Map backend data to frontend format
  const goals: SavingGoal[] = useMemo(() => {
    if (!goalsData?.goals) return [];

    return goalsData.goals.map((g: any) => ({
      id: g.id,
      name: g.name,
      target: g.target,
      current: g.current_amount,
      deadline: g.deadline,
      priority: g.priority as GoalPriority,
      category: g.category,
      status: g.status,
      color: g.color || 'bg-indigo-500',
      createdAt: g.created_at
    }));
  }, [goalsData]);

  return {
    goals,
    loading,
    error,
    refetch
  };
};


import { useAPI } from '../useAPI';
import { analyticsAPI, budgetsAPI } from '../../services/api';
import { MoneyFlowData, BudgetCategory } from '../../types';

export const useDashboardCharts = () => {
  const { data: moneyFlowData, loading: moneyFlowLoading, error: moneyFlowError } = useAPI<{ flow: MoneyFlowData[] }>(
    () => analyticsAPI.getMoneyFlow(),
    { auto: true }
  );

  const { data: budgetSummary, loading: budgetLoading, error: budgetError } = useAPI<{ categories: BudgetCategory[] }>(
    () => budgetsAPI.getSummary(),
    { auto: true }
  );

  const moneyFlow = moneyFlowData?.flow || [];
  const budget = budgetSummary?.categories || [];
  const loading = moneyFlowLoading || budgetLoading;
  const error = moneyFlowError || budgetError;

  return { moneyFlow, budget, loading, error };
};

import { useState, useEffect } from 'react';

interface UseAPIOptions {
  auto?: boolean; // Auto-fetch on mount
}

interface UseAPIReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for API calls with loading and error states
 */
export function useAPI<T>(
  apiFunction: () => Promise<any>,
  options: UseAPIOptions = { auto: true }
): UseAPIReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.auto) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables>(
  apiFunction: (variables: TVariables) => Promise<any>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: TVariables): Promise<{ success: boolean; data?: TData; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(variables);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error?.message || 'An error occurred';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Network error. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}

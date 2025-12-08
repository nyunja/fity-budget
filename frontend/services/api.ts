// API Client for FityBudget Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Response types from backend
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Helper function to handle API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  completeOnboarding: async (data: {
    monthly_income: number;
    currency: string;
    financial_goals: string[];
  }) => {
    return apiRequest('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Transactions API
export const transactionsAPI = {
  list: async (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    category?: string;
    wallet_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest(`/transactions${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  get: async (id: string) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    wallet_id: string;
    date: string;
    notes?: string;
  }) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      amount?: number;
      category?: string;
      description?: string;
      notes?: string;
      date?: string;
    }
  ) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest(`/transactions/stats${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },
};

// Goals API
export const goalsAPI = {
  list: async () => {
    return apiRequest('/goals', {
      method: 'GET',
    });
  },

  get: async (id: string) => {
    return apiRequest(`/goals/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: {
    name: string;
    target_amount: number;
    deadline: string;
    category?: string;
    color?: string;
    icon?: string;
  }) => {
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      target_amount?: number;
      deadline?: string;
      category?: string;
      status?: string;
    }
  ) => {
    return apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateProgress: async (id: string, amount: number) => {
    return apiRequest(`/goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
  },
};

// Budgets API
export const budgetsAPI = {
  list: async () => {
    return apiRequest('/budgets', {
      method: 'GET',
    });
  },

  get: async (id: string) => {
    return apiRequest(`/budgets/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: {
    category: string;
    limit: number;
    period?: string;
    alert_threshold?: number;
    color?: string;
  }) => {
    return apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      limit?: number;
      alert_threshold?: number;
      period?: string;
    }
  ) => {
    return apiRequest(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },

  getSummary: async () => {
    return apiRequest('/budgets/summary', {
      method: 'GET',
    });
  },
};

// Wallets API
export const walletsAPI = {
  list: async () => {
    return apiRequest('/wallets', {
      method: 'GET',
    });
  },

  get: async (id: string) => {
    return apiRequest(`/wallets/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: {
    name: string;
    type: string;
    balance: number;
    currency: string;
    color: string;
    account_number?: string;
  }) => {
    return apiRequest('/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      balance?: number;
      is_default?: boolean;
    }
  ) => {
    return apiRequest(`/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/wallets/${id}`, {
      method: 'DELETE',
    });
  },

  setDefault: async (id: string) => {
    return apiRequest(`/wallets/${id}/set-default`, {
      method: 'PATCH',
    });
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: async () => {
    return apiRequest('/analytics/dashboard', {
      method: 'GET',
    });
  },

  getMoneyFlow: async (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest(`/analytics/money-flow${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getSpending: async (params?: { period?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.period) {
      queryParams.append('period', params.period);
    }
    const query = queryParams.toString();
    return apiRequest(`/analytics/spending${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getInsights: async () => {
    return apiRequest('/analytics/insights', {
      method: 'GET',
    });
  },
};

// Helper to save auth token
export const saveAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Helper to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

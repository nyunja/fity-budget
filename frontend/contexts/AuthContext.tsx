import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, saveAuthToken, clearAuthToken, getAuthToken } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data) {
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
        });
      } else {
        // Token invalid, clear it
        clearAuthToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        saveAuthToken(response.data.token);
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);

      if (response.success && response.data) {
        saveAuthToken(response.data.token);
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Registration failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

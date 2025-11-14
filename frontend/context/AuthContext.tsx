'use client';

/**
 * AuthContext
 * Global state management for authentication
 * Handles user login, registration, logout, and session management
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../lib/api/authService';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (email: string, password: string, name?: string | null) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<any>;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State management
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state from localStorage
   * Verifies token validity on app load
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser && authService.isAuthenticated()) {
          // Verify token is still valid by fetching current user
          // Use suppressErrors to avoid console errors for expected 401s
          try {
            const response = await authService.getCurrentUser(true);
            setUser(response.data.user);
          } catch (error: any) {
            // Token invalid or expired, clear storage silently
            // Only log if it's not a 401 (expected when token is invalid)
            if (error.status !== 401) {
              console.error('Auth initialization error:', error);
            }
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        // Silently handle initialization errors
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, name: string | null = null) => {
      // Validate inputs
      if (!email || !email.trim()) {
        const error = 'Email is required';
        setError(error);
        throw new Error(error);
      }
      if (!password || password.length < 8) {
        const error = 'Password must be at least 8 characters';
        setError(error);
        throw new Error(error);
      }

      setLoading(true);
      setError(null);
      try {
        await authService.register(email.trim(), password, name?.trim() || null);
        // After registration, automatically login
        const loginResponse = await authService.login(email.trim(), password);
        setUser(loginResponse.user);
        return loginResponse;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message ||
          err.message ||
          'Registration failed. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string) => {
    // Validate inputs
    if (!email || !email.trim()) {
      const error = 'Email is required';
      setError(error);
      throw new Error(error);
    }
    if (!password) {
      const error = 'Password is required';
      setError(error);
      throw new Error(error);
    }

    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email.trim(), password);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get current user information
   */
  const getCurrentUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      const user = response.data.user;
      setUser(user);
      return user;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Failed to get user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    getCurrentUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


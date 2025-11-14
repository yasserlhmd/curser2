/**
 * AuthContext
 * Global state management for authentication
 * Handles user login, registration, logout, and session management
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          try {
            const response = await authService.getCurrentUser();
            // Backend returns: { success: true, data: { user: {...} } }
            // API wrapper returns: { data: { success: true, data: { user: {...} } } }
            setUser(response.data.user);
          } catch (error) {
            // Token invalid or expired, clear storage
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Register new user
   * Automatically logs in the user after successful registration
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string|null} name - User name (optional)
   * @returns {Promise<Object>} Login response with user and tokens
   */
  const register = useCallback(async (email, password, name = null) => {
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
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response with user and tokens
   */
  const login = useCallback(async (email, password) => {
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
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   * Clears user state and revokes tokens
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
   * @returns {Promise<Object>} Current user object
   */
  const getCurrentUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      // Backend returns: { success: true, data: { user: {...} } }
      // API wrapper returns: { data: { success: true, data: { user: {...} } } }
      const user = response.data.user;
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to get user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const value = {
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


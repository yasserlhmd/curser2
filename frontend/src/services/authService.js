/**
 * Authentication Service
 * Handles authentication API calls
 */
import api from './api';

const AUTH_ENDPOINT = '/auth';

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name (optional)
 * @returns {Promise} Promise with user data
 */
export const register = async (email, password, name = null) => {
  try {
    const response = await api.post(`${AUTH_ENDPOINT}/register`, {
      email,
      password,
      name,
    });
    // Extract data from nested response structure
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Promise with user and tokens
 */
export const login = async (email, password) => {
  try {
    const response = await api.post(`${AUTH_ENDPOINT}/login`, {
      email,
      password,
    });
    
    // Extract data from nested response structure
    // Backend returns: { success: true, data: { user, accessToken, refreshToken } }
    // API wrapper returns: { data: { success: true, data: { user, accessToken, refreshToken } } }
    const loginData = response.data.data;
    
    // Store tokens and user in localStorage
    if (loginData.accessToken) {
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginData.user));
    }
    
    // Return clean structure
    return {
      user: loginData.user,
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} Promise
 */
export const logout = async () => {
  try {
    // Call logout endpoint to blacklist token
    await api.post(`${AUTH_ENDPOINT}/logout`);
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    // Clear tokens and user from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user info
 * @returns {Promise} Promise with user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get(`${AUTH_ENDPOINT}/me`);
    // Backend returns: { success: true, data: { user: {...} } }
    // API wrapper returns: { data: { success: true, data: { user: {...} } } }
    // Return the full response.data so AuthContext can access response.data.data.user
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get stored user from localStorage
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get stored access token
 * @returns {string|null} Token or null
 */
export const getStoredToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getStoredToken();
};

/**
 * Get all users (for filtering)
 * @returns {Promise} Promise with users array
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get(`${AUTH_ENDPOINT}/users`);
    // Backend returns: { success: true, data: { users: [...] } }
    // API wrapper returns: { data: { success: true, data: { users: [...] } } }
    return response.data.data.users || [];
  } catch (error) {
    throw error;
  }
};


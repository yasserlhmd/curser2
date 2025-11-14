/**
 * Authentication Service
 * Handles authentication API calls
 */
import api from './client';

const AUTH_ENDPOINT = '/auth';

/**
 * Register new user
 */
export const register = async (
  email: string,
  password: string,
  name: string | null = null
): Promise<any> => {
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
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
  try {
    const response = await api.post(`${AUTH_ENDPOINT}/login`, {
      email,
      password,
    });

    // Extract data from nested response structure
    const loginData = response.data.data;

    // Store tokens and user in localStorage
    if (loginData.accessToken && typeof window !== 'undefined') {
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
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to blacklist token
    await api.post(`${AUTH_ENDPOINT}/logout`);
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    // Clear tokens and user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
};

/**
 * Get current user info
 * @param suppressErrors - If true, suppress 401 errors (useful for auth initialization)
 */
export const getCurrentUser = async (suppressErrors: boolean = false): Promise<any> => {
  try {
    const response = await api.get(`${AUTH_ENDPOINT}/me`, { suppressErrors });
    // Backend returns: { success: true, data: { user: {...} } }
    // API wrapper returns: { data: { success: true, data: { user: {...} } } }
    
    // Check if response contains an error (when suppressErrors is true)
    if (response.data?.error && response.data.error.status === 401) {
      throw { status: 401, response: { data: response.data } };
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get stored access token
 */
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

/**
 * Get all users (for filtering)
 * @param suppressErrors - If true, suppress 401 errors (useful when user is not authenticated)
 */
export const getAllUsers = async (suppressErrors: boolean = false): Promise<any[]> => {
  try {
    const response = await api.get(`${AUTH_ENDPOINT}/users`, { suppressErrors });
    // Backend returns: { success: true, data: { users: [...] } }
    // API wrapper returns: { data: { success: true, data: { users: [...] } } }
    
    // Check if response contains an error (when suppressErrors is true)
    if (response.data?.error && response.data.error.status === 401) {
      throw { status: 401, response: { data: response.data } };
    }
    
    return response.data.data.users || [];
  } catch (error) {
    throw error;
  }
};


/**
 * API Client
 * Native Fetch API wrapper for HTTP requests
 * Replaces axios with native fetch for better performance and fewer dependencies
 * Handles authentication, error handling, and response parsing
 */

// ==================== Configuration ====================
// Get base URL from environment
let baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Ensure baseURL includes /api
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Create a fetch request with default configuration
 * @param {string} url - The endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise with parsed JSON response
 */
const request = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  // Note: For public routes, we still send the token if available (optional auth)
  // but the backend will allow access even without it
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Store the method for later use in error handling
  const method = options.method || 'GET';

  const config = {
    headers,
    ...options,
  };

  // Convert body to JSON if it's an object
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${baseURL}${url}`, config);
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Parse response
    let data;
    if (isJson) {
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create error response
        data = { error: { message: 'Invalid JSON response from server' } };
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : { error: { message: `HTTP ${response.status}` } };
    }
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if:
        // 1. We're not on login/register page
        // 2. We're not on the home page (which is public)
        // 3. The request was not a GET to /tasks (public read access)
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath === '/' || 
                             currentPath.includes('/login') || 
                             currentPath.includes('/register');
        const isPublicGetRequest = method === 'GET' && url.includes('/tasks');
        
        if (!isPublicRoute && !isPublicGetRequest) {
          // Dispatch a custom event that components can listen to, or redirect after a brief delay
          setTimeout(() => {
            // Only redirect if still on a protected page
            const stillOnProtectedPage = !window.location.pathname.includes('/login') && 
                                        !window.location.pathname.includes('/register') &&
                                        window.location.pathname !== '/';
            if (stillOnProtectedPage) {
              window.location.href = '/login';
            }
          }, 100);
        }
      }
      
      // Create user-friendly error messages
      let errorMessage = data.error?.message || data.message;
      if (!errorMessage) {
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 409:
            errorMessage = 'A conflict occurred. Please try again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `An error occurred (${response.status}). Please try again.`;
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = { data };
      throw error;
    }
    
    return { data };
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      const networkError = new Error('Network error: Unable to connect to server');
      networkError.isNetworkError = true;
      networkError.status = 0;
      throw networkError;
    }
    // Re-throw if already processed
    if (error.status) {
      throw error;
    }
    // Handle other errors
    const genericError = new Error(error.message || 'An unexpected error occurred');
    genericError.status = error.status || 500;
    throw genericError;
  }
};

/**
 * GET request
 */
const get = async (url, options = {}) => {
  return request(url, {
    method: 'GET',
    ...options,
  });
};

/**
 * POST request
 */
const post = async (url, data, options = {}) => {
  return request(url, {
    method: 'POST',
    body: data,
    ...options,
  });
};

/**
 * PUT request
 */
const put = async (url, data, options = {}) => {
  return request(url, {
    method: 'PUT',
    body: data,
    ...options,
  });
};

/**
 * DELETE request
 */
const del = async (url, options = {}) => {
  return request(url, {
    method: 'DELETE',
    ...options,
  });
};

// Export API methods
const api = {
  get,
  post,
  put,
  delete: del,
};

export default api;

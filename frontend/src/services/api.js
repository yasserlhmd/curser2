/**
 * Native Fetch API wrapper
 * Replaces axios with native fetch for better performance and fewer dependencies
 */

// Get base URL from environment
let baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Ensure baseURL includes /api
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
}

/**
 * Create a fetch request with default configuration
 * @param {string} url - The endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise with parsed JSON response
 */
const request = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
      const error = new Error(data.error?.message || data.message || `HTTP error! status: ${response.status}`);
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

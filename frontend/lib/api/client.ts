/**
 * API Client
 * Native Fetch API wrapper for HTTP requests
 * Updated for Next.js - uses NEXT_PUBLIC_API_URL
 * Handles authentication, error handling, and response parsing
 */

// ==================== Configuration ====================
// Use Next.js API routes as proxy (client-side)
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use Next.js API routes (relative path)
    return '/api';
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
};

let baseURL = getBaseURL();

/**
 * Get auth token from cookies (client-side)
 * Note: HTTP-only cookies are automatically sent by the browser
 * This is kept for backward compatibility during migration
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Try localStorage first (for backward compatibility)
  const token = localStorage.getItem('accessToken');
  if (token) return token;
  // Cookies are automatically sent, so we don't need to read them here
  return null;
};

/**
 * Create a fetch request with default configuration
 * @param url - The endpoint URL
 * @param options - Fetch options (can include suppressErrors: boolean to suppress 401 errors)
 * @returns Promise with parsed JSON response
 */
const request = async (url: string, options: RequestInit & { suppressErrors?: boolean } = {}): Promise<{ data: any }> => {
  const { suppressErrors, ...fetchOptions } = options;
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Store the method for later use in error handling
  const method = fetchOptions.method || 'GET';

  const config: RequestInit = {
    ...fetchOptions,
    headers,
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
    let data: any;
    if (isJson) {
      try {
        data = await response.json();
      } catch (parseError) {
        data = { error: { message: 'Invalid JSON response from server' } };
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : { error: { message: `HTTP ${response.status}` } };
    }

    // Handle non-2xx responses
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401 && typeof window !== 'undefined') {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // If suppressErrors is true, return a structured error response instead of throwing
        // This is useful for expected 401s (like during auth initialization)
        if (suppressErrors) {
          return {
            data: {
              error: {
                message: 'Unauthorized',
                status: 401,
              },
            },
          };
        }

        // Only redirect if:
        // 1. We're not on login/register page
        // 2. We're not on the home page (which is public)
        // 3. The request was not a GET to /tasks (public read access)
        const currentPath = window.location.pathname;
        const isPublicRoute =
          currentPath === '/' ||
          currentPath.includes('/login') ||
          currentPath.includes('/register');
        const isPublicGetRequest = method === 'GET' && url.includes('/tasks');

        if (!isPublicRoute && !isPublicGetRequest) {
          setTimeout(() => {
            const stillOnProtectedPage =
              !window.location.pathname.includes('/login') &&
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

      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = { data };
      throw error;
    }

    return { data };
  } catch (error: any) {
    // Handle network errors
    if (
      error.name === 'TypeError' ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    ) {
      const networkError: any = new Error('Network error: Unable to connect to server');
      networkError.isNetworkError = true;
      networkError.status = 0;
      throw networkError;
    }
    // Re-throw if already processed
    if (error.status) {
      throw error;
    }
    // Handle other errors
    const genericError: any = new Error(error.message || 'An unexpected error occurred');
    genericError.status = error.status || 500;
    throw genericError;
  }
};

/**
 * GET request
 */
const get = async (url: string, options: RequestInit & { suppressErrors?: boolean } = {}) => {
  return request(url, {
    method: 'GET',
    ...options,
  });
};

/**
 * POST request
 */
const post = async (url: string, data: any, options: RequestInit = {}) => {
  return request(url, {
    method: 'POST',
    body: data,
    ...options,
  });
};

/**
 * PUT request
 */
const put = async (url: string, data: any, options: RequestInit = {}) => {
  return request(url, {
    method: 'PUT',
    body: data,
    ...options,
  });
};

/**
 * DELETE request
 */
const del = async (url: string, options: RequestInit = {}) => {
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


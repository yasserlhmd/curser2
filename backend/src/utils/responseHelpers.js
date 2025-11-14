/**
 * Response helper utilities
 * Provides consistent API response formatting
 */

const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Create a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data,
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Create an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} details - Optional error details
 */
const sendError = (res, message, code = ERROR_CODES.INTERNAL_ERROR, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code,
    },
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.error.details = details;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Create a validation error response
 * @param {Object} res - Express response object
 * @param {string|string[]} errors - Validation error message(s)
 */
const sendValidationError = (res, errors) => {
  const message = Array.isArray(errors) ? errors.join(', ') : errors;
  return sendError(res, message, ERROR_CODES.VALIDATION_ERROR, 400);
};

/**
 * Create a not found error response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'Task', 'User')
 */
const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, ERROR_CODES.RESOURCE_NOT_FOUND, 404);
};

/**
 * Create an unauthorized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = 'Authentication required') => {
  return sendError(res, message, ERROR_CODES.AUTH_REQUIRED, 401);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
};


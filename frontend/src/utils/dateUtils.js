/**
 * Date utility functions
 * Provides consistent date formatting across the application
 */

/**
 * Format date string for display
 * @param {string|null|undefined} dateString - ISO date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return date.toLocaleDateString(undefined, { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

/**
 * Format date for task display (simpler format)
 * @param {string|null|undefined} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatTaskDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};


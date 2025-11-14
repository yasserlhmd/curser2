/**
 * Task-related constants
 * Centralized constants for task statuses and UI labels
 */

/**
 * Valid task status values
 * @type {string[]}
 */
export const TASK_STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * Default task status
 * @type {string}
 */
export const DEFAULT_STATUS = 'pending';

/**
 * Task status labels for display
 * @type {Object<string, string>}
 */
export const STATUS_LABELS = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

/**
 * Task status colors for UI
 * @type {Object<string, string>}
 */
export const STATUS_COLORS = {
  'pending': '#ffc107',      // Yellow
  'in-progress': '#007bff',  // Blue
  'completed': '#28a745',    // Green
  'default': '#6c757d',      // Gray
};

/**
 * Filter options
 * @type {Object}
 */
export const FILTER_OPTIONS = {
  ALL: 'all',
  ME: 'me',
};


/**
 * Task-related constants
 * Centralized constants for task statuses and UI labels
 */

/**
 * Valid task status values
 */
export const TASK_STATUSES = ['pending', 'in-progress', 'completed'] as const;

/**
 * Default task status
 */
export const DEFAULT_STATUS = 'pending';

/**
 * Task status labels for display
 */
export const STATUS_LABELS: Record<string, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

/**
 * Task status colors for UI
 */
export const STATUS_COLORS: Record<string, string> = {
  'pending': '#ffc107',      // Yellow
  'in-progress': '#007bff',  // Blue
  'completed': '#28a745',    // Green
  'default': '#6c757d',      // Gray
};

/**
 * Filter options
 */
export const FILTER_OPTIONS = {
  ALL: 'all',
  ME: 'me',
} as const;


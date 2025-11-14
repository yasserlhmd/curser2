/**
 * Task-related constants
 * Centralized constants for task statuses and validation
 */

/**
 * Valid task status values
 * @type {string[]}
 */
const VALID_STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * Default task status
 * @type {string}
 */
const DEFAULT_STATUS = 'pending';

/**
 * Task status labels for display
 * @type {Object<string, string>}
 */
const STATUS_LABELS = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

module.exports = {
  VALID_STATUSES,
  DEFAULT_STATUS,
  STATUS_LABELS,
};


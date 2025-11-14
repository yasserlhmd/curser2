/**
 * Task Controller
 * Handles HTTP requests related to task management
 * Validates input, calls service layer, and formats responses
 */
const taskService = require('../services/taskService');
const { pool } = require('../config/database');
const { sendSuccess, sendError, sendNotFound, sendUnauthorized, sendValidationError } = require('../utils/responseHelpers');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Get all tasks with optional filters
 * 
 * Query Parameters:
 * - status: Filter by status (pending, in-progress, completed)
 * - user_id: Filter by user ('all', 'me', or specific user ID)
 * 
 * Examples:
 *   GET /api/tasks?status=pending&user_id=1
 *   GET /api/tasks?user_id=all (get all users' tasks)
 *   GET /api/tasks?user_id=me (get only current user's tasks)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTasks = async (req, res) => {
  try {
    const { status, user_id } = req.query;
    const currentUserId = req.user?.id || null; // From optionalAuth middleware (may be null for guests)
    
    // Determine which user's tasks to fetch based on user_id parameter
    let filterUserId = null;
    const normalizedUserId = user_id ? String(user_id).trim().toLowerCase() : null;
    
    if (normalizedUserId === 'all') {
      // Show all tasks from all users
      filterUserId = null;
    } else if (normalizedUserId === 'me') {
      // Show only current user's tasks (requires authentication)
      if (!currentUserId) {
        return sendUnauthorized(res, 'Authentication required to filter by "my tasks"');
      }
      filterUserId = currentUserId;
    } else if (!user_id) {
      // Default behavior: show all tasks for guests, or current user's tasks if logged in
      filterUserId = currentUserId || null;
    } else {
      // Filter by specific user ID
      const requestedUserId = parseInt(user_id, 10);
      if (isNaN(requestedUserId)) {
        return sendValidationError(res, 'Invalid user_id parameter');
      }
      filterUserId = requestedUserId;
    }
    
    // Assign orphaned tasks (without user_id) to current user if filtering by "me" and logged in
    // This ensures backward compatibility with tasks created before user authentication
    if ((user_id === 'me' || (!user_id && currentUserId)) && currentUserId) {
      await pool.query(
        'UPDATE tasks SET user_id = $1 WHERE user_id IS NULL',
        [currentUserId]
      );
    }
    
    // Fetch tasks from service layer
    // Note: userId parameter (first arg) is for access control, filterUserId is for actual filtering
    const tasks = await taskService.getAllTasks(null, status, filterUserId);

    return sendSuccess(res, tasks, null, 200);
  } catch (error) {
    console.error('Error in getAllTasks controller:', error);
    return sendError(res, 'Failed to fetch tasks', ERROR_CODES.INTERNAL_ERROR, 500, error.message);
  }
};

/**
 * Get task by ID
 * Public access - anyone can view any task (read-only)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return sendValidationError(res, 'Invalid task ID');
    }

    const userId = req.user?.id || null; // From optionalAuth middleware (may be null for guests)
    const task = await taskService.getTaskById(taskId, userId);

    if (!task) {
      return sendNotFound(res, 'Task');
    }

    return sendSuccess(res, task);
  } catch (error) {
    console.error('Error in getTaskById controller:', error);
    return sendError(res, 'Failed to fetch task', ERROR_CODES.INTERNAL_ERROR, 500, error.message);
  }
};

/**
 * Create new task
 * Requires authentication - task is automatically assigned to the authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return sendValidationError(res, 'Title is required');
    }

    const userId = req.user.id; // From authenticateToken middleware
    const task = await taskService.createTask({ title, description, status }, userId);

    return sendSuccess(res, task, 'Task created successfully', 201);
  } catch (error) {
    console.error('Error in createTask controller:', error);
    
    const statusCode = error.message.includes('Invalid status') ? 400 : 500;
    const errorCode = error.message.includes('Invalid status') 
      ? ERROR_CODES.VALIDATION_ERROR 
      : ERROR_CODES.INTERNAL_ERROR;
    
    return sendError(res, error.message || 'Failed to create task', errorCode, statusCode);
  }
};

/**
 * Update task
 * Requires authentication - users can only update their own tasks
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return sendValidationError(res, 'Invalid task ID');
    }

    const userId = req.user.id; // From authenticateToken middleware
    const task = await taskService.updateTask(taskId, req.body, userId);

    if (!task) {
      return sendNotFound(res, 'Task');
    }

    return sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    console.error('Error in updateTask controller:', error);
    
    const statusCode = error.message.includes('Invalid status') || 
                      error.message.includes('cannot be empty') ? 400 : 500;
    const errorCode = (error.message.includes('Invalid status') || 
                      error.message.includes('cannot be empty'))
      ? ERROR_CODES.VALIDATION_ERROR 
      : ERROR_CODES.INTERNAL_ERROR;
    
    return sendError(res, error.message || 'Failed to update task', errorCode, statusCode);
  }
};

/**
 * Delete task
 * Requires authentication - users can only delete their own tasks
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return sendValidationError(res, 'Invalid task ID');
    }

    const userId = req.user.id; // From authenticateToken middleware
    const task = await taskService.deleteTask(taskId, userId);

    if (!task) {
      return sendNotFound(res, 'Task');
    }

    return sendSuccess(res, task, 'Task deleted successfully');
  } catch (error) {
    console.error('Error in deleteTask controller:', error);
    return sendError(res, 'Failed to delete task', ERROR_CODES.INTERNAL_ERROR, 500, error.message);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};


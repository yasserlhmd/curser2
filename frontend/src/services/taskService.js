/**
 * Task Service
 * API client for task-related operations
 * Handles all HTTP requests to the task endpoints
 */
import api from './api';

/**
 * Get all tasks with optional filters
 * @param {string|null} status - Status filter (pending, in-progress, completed)
 * @param {string|number|null} userId - User filter ('all', 'me', or user ID)
 * @returns {Promise<Array>} Array of task objects
 * @throws {Error} If API request fails
 */
export const getAllTasks = async (status = null, userId = null) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    // Always send user_id parameter if provided (including 'all' or 'me')
    if (userId !== null && userId !== undefined) {
      params.append('user_id', String(userId));
    }
    
    const url = params.toString() ? `/tasks?${params.toString()}` : '/tasks';
    const response = await api.get(url);
    
    // Backend returns: { success: true, data: tasks }
    // API wrapper returns: { data: { success: true, data: tasks } }
    // Extract tasks array from nested structure
    const tasks = response.data?.data || response.data || [];
    
    // Ensure we return an array
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    throw error;
  }
};

/**
 * Get task by ID
 * @param {number} id - Task ID
 * @returns {Promise} Promise with task object
 */
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    // Backend returns: { success: true, data: task }
    // API wrapper returns: { data: { success: true, data: task } }
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new task
 * @param {Object} taskData - Task data { title, description?, status? }
 * @returns {Promise<Object>} Created task object
 * @throws {Error} If API request fails
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    // Backend returns: { success: true, data: task }
    // API wrapper returns: { data: { success: true, data: task } }
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update task
 * @param {number} id - Task ID
 * @param {Object} taskData - Task data to update
 * @returns {Promise} Promise with updated task
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    // Backend returns: { success: true, data: task }
    // API wrapper returns: { data: { success: true, data: task } }
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete task
 * @param {number} id - Task ID
 * @returns {Promise} Promise with deleted task
 */
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    // Backend returns: { success: true, data: { message: "..." } }
    // API wrapper returns: { data: { success: true, data: { message: "..." } } }
    // Delete doesn't return task data, just success message
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};


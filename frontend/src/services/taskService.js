import api from './api';

/**
 * Task Service - API calls for tasks
 */

/**
 * Get all tasks (with optional status filter)
 * @param {string} status - Optional status filter (pending, in-progress, completed)
 * @returns {Promise} Promise with tasks array
 */
export const getAllTasks = async (status = null) => {
  try {
    const url = status ? `/tasks?status=${encodeURIComponent(status)}` : '/tasks';
    const response = await api.get(url);
    return response.data;
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
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new task
 * @param {Object} taskData - Task data (title, description, status)
 * @returns {Promise} Promise with created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
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
    return response.data;
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
    return response.data;
  } catch (error) {
    throw error;
  }
};


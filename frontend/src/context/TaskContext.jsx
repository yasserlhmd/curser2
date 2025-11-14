/**
 * TaskContext
 * Global state management for tasks
 * Handles fetching, creating, updating, and deleting tasks
 * Manages filter state (status and user filters)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as taskService from '../services/taskService';
import { useAuth } from './AuthContext';
import { FILTER_OPTIONS } from '../constants/taskConstants';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'in-progress', 'completed'
  const [userFilter, setUserFilterState] = useState(() => {
    // Initialize based on auth status
    return isAuthenticated ? FILTER_OPTIONS.ME : FILTER_OPTIONS.ALL;
  }); // 'all', 'me', or user ID (number)
  
  /**
   * Update user filter state
   * @param {string|number} value - Filter value ('all', 'me', or user ID)
   */
  const setUserFilter = useCallback((value) => {
    setUserFilterState(value);
  }, []);
  
  // Reset filter for guests (they can only see 'all')
  useEffect(() => {
    if (!isAuthenticated && userFilter !== FILTER_OPTIONS.ALL) {
      setUserFilter(FILTER_OPTIONS.ALL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  /**
   * Fetch tasks from API
   * @param {string|null} status - Status filter (null for all)
   * @param {string|number|null} userId - User filter ('all', 'me', or user ID)
   */
  const fetchTasks = useCallback(async (status = null, userId = null) => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await taskService.getAllTasks(status, userId);
      setTasks(Array.isArray(tasks) ? tasks : []);
    } catch (err) {
      // Handle errors gracefully for guests (401 is expected for unauthenticated requests)
      if (err.status !== 401 || isAuthenticated) {
        const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to fetch tasks';
        setError(errorMessage);
      }
      // For guests, set empty array on 401 (expected behavior)
      if (!isAuthenticated && err.status === 401) {
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Create a new task
   * @param {Object} taskData - Task data { title, description?, status? }
   * @returns {Promise<Object>} Created task object
   */
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.createTask(taskData);
      
      // Ensure task has user info - add fallback if missing
      if (task && !task.user && task.user_id && currentUser && task.user_id === currentUser.id) {
        task.user = {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
        };
      }
      
      // Add new task to the beginning of the list
      setTasks((prevTasks) => [task, ...prevTasks]);
      return task;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} taskData - Task data to update
   * @returns {Promise<Object>} Updated task object
   */
  const updateTask = useCallback(async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.updateTask(id, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === id ? task : t))
      );
      return task;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {Promise<void>}
   */
  const deleteTask = useCallback(async (id) => {
    if (!id) {
      throw new Error('Task ID is required');
    }
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to delete task. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Determine userId parameter for API call based on current filter state
   * @returns {string|number} User filter value for API
   */
  const getUserIdForApi = useCallback(() => {
    if (!isAuthenticated || !currentUser) {
      // Guests always see all tasks
      return FILTER_OPTIONS.ALL;
    }
    
    // Logged-in users: use the selected filter
    if (userFilter === FILTER_OPTIONS.ALL || String(userFilter) === FILTER_OPTIONS.ALL) {
      return FILTER_OPTIONS.ALL;
    } else if (userFilter === FILTER_OPTIONS.ME || String(userFilter) === FILTER_OPTIONS.ME) {
      return FILTER_OPTIONS.ME;
    } else if (typeof userFilter === 'number' || (typeof userFilter === 'string' && !isNaN(parseInt(userFilter, 10)))) {
      // Specific user ID (from dropdown)
      return typeof userFilter === 'number' ? userFilter : parseInt(userFilter, 10);
    } else {
      // Default to 'me' if filter is invalid
      console.warn('Invalid userFilter value:', userFilter, 'defaulting to "me"');
      return FILTER_OPTIONS.ME;
    }
  }, [isAuthenticated, currentUser, userFilter]);

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    const status = statusFilter === 'all' ? null : statusFilter;
    const userId = getUserIdForApi();
    
    fetchTasks(status, userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, userFilter, currentUser, isAuthenticated, getUserIdForApi, fetchTasks]);

  const value = {
    tasks, // Backend already filters by status and user
    loading,
    error,
    statusFilter,
    setStatusFilter,
    userFilter,
    setUserFilter,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};


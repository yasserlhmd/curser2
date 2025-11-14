'use client';

/**
 * TaskContext
 * Global state management for tasks
 * Handles fetching, creating, updating, and deleting tasks
 * Manages filter state (status and user filters)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as taskService from '../lib/api/taskService';
import { useAuth } from './AuthContext';
import { FILTER_OPTIONS } from '../lib/constants/taskConstants';

interface TaskContextType {
  tasks: any[];
  loading: boolean;
  error: string | null;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  userFilter: string | number;
  setUserFilter: (filter: string | number) => void;
  fetchTasks: (status?: string | null, userId?: string | number | null) => Promise<void>;
  createTask: (taskData: any) => Promise<any>;
  updateTask: (id: number, taskData: any) => Promise<any>;
  deleteTask: (id: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({
  children,
  initialTasks,
  currentUser: initialUser,
}: {
  children: React.ReactNode;
  initialTasks?: any[];
  currentUser?: any | null;
}) => {
  const { user: currentUser, isAuthenticated } = useAuth();

  // State management - use initialTasks if provided (from Server Component)
  const [tasks, setTasks] = useState<any[]>(initialTasks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'in-progress', 'completed'
  const [userFilter, setUserFilterState] = useState<string | number>(() => {
    // Initialize based on auth status
    return isAuthenticated ? FILTER_OPTIONS.ME : FILTER_OPTIONS.ALL;
  }); // 'all', 'me', or user ID (number)

  /**
   * Update user filter state
   */
  const setUserFilter = useCallback((value: string | number) => {
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
   */
  const fetchTasks = useCallback(
    async (status: string | null = null, userId: string | number | null = null) => {
      setLoading(true);
      setError(null);
      try {
        const tasks = await taskService.getAllTasks(status, userId);
        setTasks(Array.isArray(tasks) ? tasks : []);
      } catch (err: any) {
        // Handle errors gracefully for guests (401 is expected for unauthenticated requests)
        if (err.status !== 401 || isAuthenticated) {
          const errorMessage =
            err.response?.data?.error?.message || err.message || 'Failed to fetch tasks';
          setError(errorMessage);
        }
        // For guests, set empty array on 401 (expected behavior)
        if (!isAuthenticated && err.status === 401) {
          setTasks([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (taskData: any) => {
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
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message || err.message || 'Failed to create task';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: number, taskData: any) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.updateTask(id, taskData);
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: number) => {
    if (!id) {
      throw new Error('Task ID is required');
    }
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Failed to delete task. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Determine userId parameter for API call based on current filter state
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
    } else if (
      typeof userFilter === 'number' ||
      (typeof userFilter === 'string' && !isNaN(parseInt(userFilter, 10)))
    ) {
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

  const value: TaskContextType = {
    tasks,
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


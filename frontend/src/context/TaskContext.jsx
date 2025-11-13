import React, { createContext, useContext, useState, useEffect } from 'react';
import * as taskService from '../services/taskService';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed

  // Fetch tasks
  const fetchTasks = async (status = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getAllTasks(status);
      setTasks(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.createTask(taskData);
      setTasks((prevTasks) => [response.data, ...prevTasks]);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? response.data : task))
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on current filter
  const getFilteredTasks = () => {
    if (filter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.status === filter);
  };

  // Fetch tasks on mount and when filter changes
  useEffect(() => {
    const status = filter === 'all' ? null : filter;
    fetchTasks(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const value = {
    tasks: getFilteredTasks(),
    allTasks: tasks,
    loading,
    error,
    filter,
    setFilter,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};


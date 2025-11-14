/**
 * Task Service
 * API client for task-related operations
 * Handles all HTTP requests to the task endpoints
 */
import api from './client';

/**
 * Get all tasks with optional filters
 */
export const getAllTasks = async (
  status: string | null = null,
  userId: string | number | null = null
): Promise<any[]> => {
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
 */
export const getTaskById = async (id: number): Promise<any> => {
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
 */
export const createTask = async (taskData: {
  title: string;
  description?: string;
  status?: string;
}): Promise<any> => {
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
 */
export const updateTask = async (
  id: number,
  taskData: { title?: string; description?: string; status?: string }
): Promise<any> => {
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
 */
export const deleteTask = async (id: number): Promise<any> => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    // Backend returns: { success: true, data: { message: "..." } }
    // API wrapper returns: { data: { success: true, data: { message: "..." } } }
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};


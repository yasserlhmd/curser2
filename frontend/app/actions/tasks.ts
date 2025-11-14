/**
 * Server Actions for Tasks
 * Server-side mutations with automatic revalidation
 */
'use server';

import { revalidatePath } from 'next/cache';
import type { CreateTaskData, UpdateTaskData, Task, ApiResponse } from '../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get authentication token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  // This will be available in Server Actions context
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value || null;
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskData): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Validate
    if (!data.title || data.title.trim().length === 0) {
      return {
        success: false,
        error: 'Title is required',
      };
    }

    // Call Next.js API route (which proxies to NestJS)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Forward cookies
      credentials: 'include',
    });

    const result: ApiResponse<Task> = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.success === false ? result.error.message : 'Failed to create task',
      };
    }

    // Revalidate the tasks page
    revalidatePath('/');
    revalidatePath('/api/tasks');

    return {
      success: true,
      task: result.data as Task,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

/**
 * Update a task
 */
export async function updateTask(
  id: number,
  data: UpdateTaskData
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Call Next.js API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result: ApiResponse<Task> = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.success === false ? result.error.message : 'Failed to update task',
      };
    }

    // Revalidate
    revalidatePath('/');
    revalidatePath(`/api/tasks/${id}`);

    return {
      success: true,
      task: result.data as Task,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Call Next.js API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const result: ApiResponse<{ message: string }> = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.success === false ? result.error.message : 'Failed to delete task',
      };
    }

    // Revalidate
    revalidatePath('/');
    revalidatePath('/api/tasks');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  }
}


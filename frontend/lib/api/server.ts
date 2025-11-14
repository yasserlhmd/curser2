/**
 * Server-side API Client
 * For use in Server Components and Server Actions
 * Uses Next.js API routes as proxy
 */
import type { Task, TaskQuery, User, ApiResponse, TasksResponse, CurrentUserResponse, UsersResponse } from '../../../shared/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Get authentication token from cookies (server-side)
 */
async function getAuthToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value || null;
}

/**
 * Fetch tasks from API (server-side)
 */
export async function fetchTasks(query?: TaskQuery): Promise<Task[]> {
  try {
    const queryParams = new URLSearchParams();
    if (query?.status) queryParams.set('status', query.status);
    if (query?.user_id) queryParams.set('user_id', query.user_id);

    const response = await fetch(`${API_BASE}/api/tasks?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 30 seconds
      next: { revalidate: 30 },
      credentials: 'include',
    });

    const data: ApiResponse<TasksResponse> = await response.json();

    if (!response.ok || !data.success) {
      return [];
    }

    return data.data.tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

/**
 * Get current user (server-side)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 60 seconds
      next: { revalidate: 60 },
      credentials: 'include',
    });

    const data: ApiResponse<CurrentUserResponse> = await response.json();

    if (!response.ok || !data.success) {
      return null;
    }

    return data.data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Get all users (server-side)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE}/api/auth/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
      credentials: 'include',
    });

    const data: ApiResponse<UsersResponse> = await response.json();

    if (!response.ok || !data.success) {
      return [];
    }

    return data.data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}


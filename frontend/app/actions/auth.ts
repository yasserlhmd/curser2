/**
 * Server Actions for Authentication
 * Server-side authentication mutations
 */
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { LoginData, RegisterData, AuthResponse, ApiResponse } from '../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Login user
 */
export async function login(data: LoginData): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate
    if (!data.email || !data.password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    // Call Next.js API route
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.success === false ? result.error.message : 'Login failed',
      };
    }

    // Revalidate to update user state
    revalidatePath('/');
    revalidatePath('/api/auth/me');

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

/**
 * Register user
 */
export async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate
    if (!data.email || !data.password) {
      return {
        success: false,
        error: 'Email and password are required',
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters',
      };
    }

    // Call Next.js API route
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.success === false ? result.error.message : 'Registration failed',
      };
    }

    // Revalidate
    revalidatePath('/');
    revalidatePath('/api/auth/me');

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

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    // Call Next.js API route
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // Revalidate
    revalidatePath('/');
    revalidatePath('/api/auth/me');

    // Redirect to home
    redirect('/');
  } catch (error) {
    // Even if API call fails, redirect
    redirect('/');
  }
}


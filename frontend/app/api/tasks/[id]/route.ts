/**
 * Next.js API Route: Task by ID
 * Server-side proxy for task operations (GET, PUT, DELETE)
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Task, UpdateTaskData, ApiResponse } from '../../../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * GET /api/tasks/[id] - Get task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    const id = params.id;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Call NestJS backend
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'GET',
      headers,
      // Cache for 60 seconds
      next: { revalidate: 60 },
    });

    const data: ApiResponse<Task> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Task not found',
                code: 'NOT_FOUND',
                status: 404,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<Task>>(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id] - Update task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    const id = params.id;
    const body: UpdateTaskData = await request.json();

    // Call NestJS backend
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data: ApiResponse<Task> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Failed to update task',
                code: 'UPDATE_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<Task>>(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id] - Delete task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    const id = params.id;

    // Call NestJS backend
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: ApiResponse<{ message: string }> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Failed to delete task',
                code: 'DELETE_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<{ message: string }>>(data, {
      status: 200,
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}


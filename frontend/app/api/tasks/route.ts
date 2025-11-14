/**
 * Next.js API Route: Tasks
 * Server-side proxy for task operations (GET all, POST create)
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Task, TaskQuery, TasksResponse, CreateTaskData, ApiResponse } from '../../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * GET /api/tasks - Get all tasks with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    const { searchParams } = new URL(request.url);
    
    // Build query string
    const query: TaskQuery = {};
    if (searchParams.get('status')) {
      query.status = searchParams.get('status') as any;
    }
    if (searchParams.get('user_id')) {
      query.user_id = searchParams.get('user_id')!;
    }

    const queryString = new URLSearchParams();
    if (query.status) queryString.set('status', query.status);
    if (query.user_id) queryString.set('user_id', query.user_id);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Call NestJS backend
    const response = await fetch(`${API_URL}/tasks?${queryString.toString()}`, {
      method: 'GET',
      headers,
      // Cache for 30 seconds
      next: { revalidate: 30 },
    });

    const data: ApiResponse<Task[]> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Failed to fetch tasks',
                code: 'FETCH_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<TasksResponse>>(
      {
        success: true,
        data: { tasks: data.data as Task[] },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
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
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
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

    const body: CreateTaskData = await request.json();

    // Validate request body
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'Title is required',
            code: 'VALIDATION_ERROR',
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Call NestJS backend
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
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
                message: 'Failed to create task',
                code: 'CREATE_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<Task>>(data, { status: 201 });
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


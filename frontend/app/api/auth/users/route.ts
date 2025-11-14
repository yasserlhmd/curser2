/**
 * Next.js API Route: Get All Users
 * Server-side proxy for getting all users (for filtering)
 */
import { NextRequest, NextResponse } from 'next/server';
import type { UsersResponse, ApiResponse } from '../../../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
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

    // Call NestJS backend
    const response = await fetch(`${API_URL}/auth/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    const data: ApiResponse<UsersResponse> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Failed to get users',
                code: 'FETCH_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<UsersResponse>>(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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


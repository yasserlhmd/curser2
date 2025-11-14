/**
 * Next.js API Route: Get Current User
 * Server-side proxy for getting current user information
 */
import { NextRequest, NextResponse } from 'next/server';
import type { CurrentUserResponse, ApiResponse } from '../../../../../shared/types';

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
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // Cache for 60 seconds
      next: { revalidate: 60 },
    });

    const data: ApiResponse<CurrentUserResponse> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Failed to get user',
                code: 'FETCH_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    return NextResponse.json<ApiResponse<CurrentUserResponse>>(data, {
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


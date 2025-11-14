/**
 * Next.js API Route: Register
 * Server-side proxy for user registration
 */
import { NextRequest, NextResponse } from 'next/server';
import type { RegisterData, AuthResponse, ApiResponse } from '../../../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'Email and password are required',
            code: 'VALIDATION_ERROR',
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            message: 'Password must be at least 8 characters',
            code: 'VALIDATION_ERROR',
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Call NestJS backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json<ApiResponse>(
        data.success === false
          ? data
          : {
              success: false,
              error: {
                message: 'Registration failed',
                code: 'REGISTRATION_ERROR',
                status: response.status,
              },
            },
        { status: response.status }
      );
    }

    // Set HTTP-only cookies for tokens
    const authData = data.data as AuthResponse;
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    const res = NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        data: authData,
      },
      { status: 201 }
    );

    // Set access token cookie
    res.cookies.set('accessToken', authData.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour
    });

    // Set refresh token cookie
    res.cookies.set('refreshToken', authData.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set user cookie (non-HTTP-only for client access)
    res.cookies.set('user', JSON.stringify(authData.user), {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
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


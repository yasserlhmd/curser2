/**
 * Next.js API Route: Logout
 * Server-side proxy for user logout
 */
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '../../../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    // Call NestJS backend if token exists
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      }
    }

    // Clear cookies
    const res = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Logged out successfully' },
      },
      { status: 200 }
    );

    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    res.cookies.delete('user');

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


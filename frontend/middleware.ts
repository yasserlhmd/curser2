import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Handles authentication and route protection
 * Runs before the request is completed
 */
export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For now, allow all routes (authentication is handled client-side)
  // In the future, you can add server-side token validation here
  
  return NextResponse.next();
}

/**
 * Configure which routes should be processed by middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


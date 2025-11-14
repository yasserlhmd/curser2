# Next.js Migration Plan

## Executive Summary

This document outlines the comprehensive migration plan for converting the frontend from Create React App (CRA) to Next.js, utilizing Next.js 14+ App Router and best practices.

## Current Architecture Analysis

### Technology Stack
- **Framework**: Create React App (CRA)
- **React Version**: 19.2.0
- **Routing**: React Router DOM v6
- **State Management**: React Context API (AuthContext, TaskContext)
- **Styling**: CSS Modules + Regular CSS files
- **API Client**: Native Fetch API wrapper
- **Build Tool**: Webpack (via react-scripts)

### Current Structure
```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── context/          # React Context providers
│   ├── services/         # API service layer
│   ├── constants/        # Constants and configs
│   ├── utils/           # Utility functions
│   ├── App.js           # Root component with routing
│   └── index.js         # Entry point
```

### Key Features
1. **Authentication**: Login, Register, Logout with JWT tokens
2. **Task Management**: CRUD operations for tasks
3. **Task Filtering**: Filter by status (pending, in-progress, completed) and user
4. **Public/Private Routes**: Home page is public, authenticated features require login
5. **Responsive Design**: Mobile-friendly UI

## Next.js Architecture Design

### Target Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **React Version**: 19.2.0 (maintained)
- **Routing**: Next.js File-based Routing (App Router)
- **State Management**: 
  - Server Components for server state
  - React Context API for client-side state (AuthContext, TaskContext)
  - React Server Components for initial data fetching
- **Styling**: CSS Modules (maintained for consistency)
- **API Client**: Native Fetch API (maintained, with Next.js optimizations)
- **TypeScript**: Optional migration (recommended for future-proofing)
- **Build Tool**: Turbopack (Next.js default)

### Target Structure
```
frontend/
├── app/                  # Next.js App Router directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page (server component)
│   ├── login/
│   │   └── page.tsx     # Login page
│   ├── register/
│   │   └── page.tsx    # Register page
│   ├── api/            # API routes (if needed)
│   └── (auth)/         # Route groups for organization
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── context/            # React Context providers (client components)
├── lib/                # Utilities and helpers
│   ├── api/           # API client
│   ├── utils/         # Utility functions
│   └── constants/     # Constants
├── hooks/              # Custom React hooks
├── types/              # TypeScript types (if migrating to TS)
├── styles/              # Global styles
├── public/              # Static assets
├── middleware.ts        # Next.js middleware for auth
├── next.config.js       # Next.js configuration
└── package.json
```

## Migration Strategy

### Phase 1: Project Setup & Configuration

#### 1.1 Initialize Next.js Project
- Create new Next.js project with App Router
- Configure TypeScript (optional but recommended)
- Set up ESLint and Prettier
- Configure environment variables

#### 1.2 Dependencies Migration
- **Remove**: `react-scripts`, `react-router-dom`
- **Add**: `next@latest`, `react@19.2.0`, `react-dom@19.2.0`
- **Maintain**: All other dependencies
- **Add** (optional): `@types/node`, `@types/react`, `typescript`

#### 1.3 Configuration Files
- `next.config.js`: Configure API rewrites, image domains, etc.
- `tsconfig.json`: TypeScript configuration (if using TS)
- `.env.local`: Environment variables with `NEXT_PUBLIC_` prefix
- `middleware.ts`: Authentication middleware

### Phase 2: Core Infrastructure Migration

#### 2.1 API Client Migration
- Migrate `services/api.js` to `lib/api/client.ts`
- Update base URL to use `NEXT_PUBLIC_API_URL`
- Maintain existing error handling and token management
- Add Next.js-specific optimizations (caching, revalidation)

#### 2.2 Context Providers Migration
- Convert `context/AuthContext.jsx` to client component
- Convert `context/TaskContext.jsx` to client component
- Add `'use client'` directive to all context files
- Maintain existing functionality

#### 2.3 Utilities & Constants
- Migrate `utils/` to `lib/utils/`
- Migrate `constants/` to `lib/constants/`
- Update imports throughout codebase

### Phase 3: Component Migration

#### 3.1 Layout Components
- Create `app/layout.tsx` (root layout)
- Migrate `components/Navbar.jsx` to `components/layout/Navbar.tsx`
- Create `components/layout/ErrorBoundary.tsx` (if needed)

#### 3.2 UI Components
- Migrate all components from `components/` to `components/ui/` or `components/features/`
- Convert to TypeScript (optional)
- Add `'use client'` directive to interactive components
- Maintain CSS modules structure

#### 3.3 Feature Components
- `TaskForm`, `TaskList`, `TaskItem`, `TaskFilter` → `components/features/tasks/`
- `Button`, `Input` → `components/ui/`
- Update imports and paths

### Phase 4: Page Migration

#### 4.1 Home Page (`/`)
- Convert `pages/HomePage.jsx` to `app/page.tsx`
- Use Server Component for initial data fetching (optional)
- Wrap with Client Component for interactivity
- Migrate `HomePage.css` to CSS module

#### 4.2 Authentication Pages
- Convert `pages/LoginPage.jsx` to `app/login/page.tsx`
- Convert `pages/RegisterPage.jsx` to `app/register/page.tsx`
- Make them Client Components (require interactivity)
- Migrate CSS files

#### 4.3 Route Protection
- Remove `ProtectedRoute` component (not needed with Next.js middleware)
- Implement route protection in `middleware.ts`
- Use Next.js redirects for protected routes

### Phase 5: Routing & Navigation

#### 5.1 File-based Routing
- Remove React Router setup
- Use Next.js App Router file structure
- Convert all routes to file-based routing

#### 5.2 Navigation Updates
- Replace `react-router-dom` `Link` with Next.js `Link`
- Replace `useNavigate` with Next.js `useRouter`
- Update all navigation logic

#### 5.3 Middleware Implementation
- Create `middleware.ts` for authentication checks
- Protect routes that require authentication
- Handle token validation and refresh

### Phase 6: Styling & Assets

#### 6.1 CSS Migration
- Convert global CSS to `app/globals.css`
- Maintain component-level CSS modules
- Update import paths

#### 6.2 Static Assets
- Migrate `public/` assets
- Update asset references
- Configure Next.js Image optimization (if using images)

### Phase 7: Optimization & Best Practices

#### 7.1 Performance Optimizations
- Implement Server Components where possible
- Use Next.js Image component for images
- Add loading states and Suspense boundaries
- Implement proper caching strategies

#### 7.2 SEO & Metadata
- Add metadata to all pages
- Implement proper title and description tags
- Add Open Graph tags

#### 7.3 Error Handling
- Implement Next.js error boundaries
- Create custom error pages (`error.tsx`, `not-found.tsx`)
- Improve error handling in API calls

### Phase 8: Testing & Cleanup

#### 8.1 Testing
- Update test configurations for Next.js
- Test all routes and navigation
- Test authentication flow
- Test task CRUD operations

#### 8.2 Cleanup
- Remove old CRA files and configurations
- Remove unused dependencies
- Clean up old routing code
- Update documentation

## Detailed Implementation Steps

### Step 1: Initialize Next.js Project

```bash
# Create new Next.js project
npx create-next-app@latest frontend-nextjs --typescript --app --no-tailwind --eslint

# Or without TypeScript
npx create-next-app@latest frontend-nextjs --app --no-tailwind --eslint
```

### Step 2: Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Directory Structure Setup

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── components/
│   ├── ui/
│   ├── features/
│   └── layout/
├── context/
├── lib/
│   ├── api/
│   ├── utils/
│   └── constants/
├── hooks/
├── styles/
└── public/
```

### Step 4: Middleware for Authentication

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add authentication logic here
  // Check for protected routes
  // Validate JWT tokens
}

export const config = {
  matcher: ['/dashboard/:path*'], // Protected routes
};
```

## Key Differences & Considerations

### 1. Routing
- **CRA**: `<Route path="/login" element={<LoginPage />} />`
- **Next.js**: File-based routing - `app/login/page.tsx`

### 2. Navigation
- **CRA**: `useNavigate()`, `<Link to="/login">`
- **Next.js**: `useRouter()`, `<Link href="/login">`

### 3. Data Fetching
- **CRA**: Client-side only (useEffect, API calls)
- **Next.js**: Server Components for initial data, Client Components for interactivity

### 4. State Management
- **CRA**: Context API (client-side only)
- **Next.js**: Context API (client components) + Server Components for server state

### 5. Environment Variables
- **CRA**: `REACT_APP_API_URL`
- **Next.js**: `NEXT_PUBLIC_API_URL`

### 6. Build Output
- **CRA**: Static build in `build/`
- **Next.js**: Optimized build with SSR/SSG capabilities

## Benefits of Migration

1. **Performance**: 
   - Server-side rendering for better initial load
   - Automatic code splitting
   - Image optimization
   - Font optimization

2. **SEO**: 
   - Better SEO with server-side rendering
   - Metadata API for dynamic meta tags

3. **Developer Experience**:
   - File-based routing (simpler)
   - Built-in TypeScript support
   - Better error handling
   - Fast Refresh

4. **Production Ready**:
   - Optimized builds
   - Better caching strategies
   - Edge runtime support

5. **Future-Proof**:
   - Active development and community
   - Modern React features support
   - Better tooling

## Migration Checklist

### Pre-Migration
- [ ] Backup current codebase
- [ ] Document current functionality
- [ ] List all dependencies
- [ ] Identify all routes

### During Migration
- [ ] Set up Next.js project
- [ ] Migrate API client
- [ ] Migrate context providers
- [ ] Migrate components
- [ ] Migrate pages
- [ ] Set up middleware
- [ ] Update navigation
- [ ] Migrate styles
- [ ] Update environment variables

### Post-Migration
- [ ] Test all routes
- [ ] Test authentication flow
- [ ] Test task CRUD operations
- [ ] Test filtering functionality
- [ ] Performance testing
- [ ] SEO verification
- [ ] Update documentation
- [ ] Deploy and verify

## Risk Mitigation

1. **Breaking Changes**: Test thoroughly at each phase
2. **State Management**: Ensure Context API works correctly with Next.js
3. **Routing**: Verify all routes work correctly
4. **Authentication**: Test token management and refresh
5. **Styling**: Ensure all styles are properly migrated

## Timeline Estimate

- **Phase 1-2**: 2-3 hours (Setup & Infrastructure)
- **Phase 3-4**: 3-4 hours (Components & Pages)
- **Phase 5-6**: 2-3 hours (Routing & Styling)
- **Phase 7-8**: 2-3 hours (Optimization & Testing)

**Total Estimated Time**: 9-13 hours

## Next Steps

1. Review and approve this plan
2. Create feature branch for migration
3. Begin Phase 1 implementation
4. Test incrementally after each phase
5. Merge to main after complete testing


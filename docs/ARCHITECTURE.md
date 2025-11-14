# Architecture Overview

## System Architecture

The Task Manager application follows a **modern full-stack architecture** with clear separation between frontend and backend, leveraging the best features of NestJS and Next.js.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3000)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Server Components (Initial Render)              │  │
│  │  - Fetches data on server                        │  │
│  │  - SEO optimized                                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Client Components (Interactivity)                │  │
│  │  - React Context for state                       │  │
│  │  - Server Actions for mutations                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (Proxy Layer)                │  │
│  │  - HTTP-only cookie management                   │  │
│  │  - Request/response transformation               │  │
│  │  - Caching with revalidation                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│            NestJS Backend (Port 5000)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Controllers (HTTP Handlers)                     │  │
│  │  - Auth, Users, Tasks                            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                       │  │
│  │  - Authentication, Task management              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Guards & Interceptors                           │  │
│  │  - JWT authentication                            │  │
│  │  - Rate limiting                                 │  │
│  │  - Response caching                              │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL     │    │     Redis       │
│   (Database)     │    │     (Cache)     │
└─────────────────┘    └─────────────────┘
```

---

## Technology Stack

### Frontend (Next.js 15)
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **UI**: React 19 with Server Components
- **State**: React Context API
- **Styling**: CSS Modules
- **Routing**: File-based routing
- **Data Fetching**: Server Components + Server Actions

### Backend (NestJS 10)
- **Framework**: NestJS with TypeScript
- **Database**: TypeORM + PostgreSQL
- **Cache**: Redis (via @nestjs/cache-manager)
- **Auth**: JWT with Passport.js
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler

### Infrastructure
- **Database**: PostgreSQL (Docker)
- **Cache**: Redis (Docker)
- **Type Safety**: Shared TypeScript types

---

## Data Flow

### 1. Initial Page Load
```
Browser Request
    ↓
Next.js Server Component
    ↓
Server-side API call (lib/api/server.ts)
    ↓
Next.js API Route (/api/tasks)
    ↓
NestJS Backend (/api/tasks)
    ↓
TypeORM Query → PostgreSQL
    ↓
Response (cached in Next.js + NestJS)
    ↓
Server Component renders with data
    ↓
HTML sent to browser
```

### 2. User Action (Create Task)
```
User submits form
    ↓
Server Action (app/actions/tasks.ts)
    ↓
Next.js API Route (/api/tasks POST)
    ↓
NestJS Backend (TasksController.create)
    ↓
TasksService.create → TypeORM → PostgreSQL
    ↓
Cache invalidation
    ↓
Response → Server Action
    ↓
Automatic revalidation
    ↓
UI updates
```

### 3. Authentication Flow
```
User Login
    ↓
Server Action (app/actions/auth.ts)
    ↓
Next.js API Route (/api/auth/login)
    ↓
NestJS Backend (AuthController.login)
    ↓
AuthService.login → JWT generation
    ↓
HTTP-only cookies set
    ↓
User authenticated
```

---

## Module Structure

### Backend Modules

#### Auth Module
- **Controller**: Handles auth endpoints
- **Service**: Login, register, token management
- **Strategy**: JWT Passport strategy
- **DTOs**: Register, Login, AuthResponse

#### Users Module
- **Controller**: User endpoints
- **Service**: User CRUD operations
- **DTOs**: UserResponse

#### Tasks Module
- **Controller**: Task endpoints (with caching)
- **Service**: Task business logic
- **DTOs**: Create, Update, Query, Response

#### Common Module
- **Guards**: JWT authentication, optional JWT
- **Interceptors**: Response transformation, caching
- **Filters**: Exception handling
- **Decorators**: @Public, @CurrentUser

### Frontend Structure

#### App Router
- **Pages**: Server Components for initial render
- **API Routes**: Proxy to NestJS backend
- **Actions**: Server Actions for mutations

#### Components
- **UI**: Reusable components (Button, Input)
- **Features**: Task-related components
- **Layout**: Navigation, structure

#### Context
- **AuthContext**: Authentication state
- **TaskContext**: Task state and operations

---

## Security Architecture

### Authentication
- **JWT Tokens**: Access token (1h) + Refresh token (7d)
- **Storage**: HTTP-only cookies (XSS protection)
- **Validation**: Server-side in middleware and guards
- **Revocation**: Redis blacklist + token versioning

### Authorization
- **Guards**: Route-level protection
- **Optional Guards**: Public routes with optional auth
- **User Context**: @CurrentUser decorator

### Security Features
- **Rate Limiting**: 100 requests/minute globally
- **CORS**: Configured for specific origins
- **Input Validation**: DTOs with class-validator
- **Error Handling**: Structured error responses

---

## Caching Strategy

### Multi-Layer Caching

1. **Next.js Data Cache**
   - API routes: 30-300 seconds
   - Server Components: Initial render
   - Revalidation: On-demand or time-based

2. **NestJS Cache Interceptor**
   - GET endpoints: 30-60 seconds
   - Redis-backed
   - Automatic cache invalidation on mutations

3. **Browser Cache**
   - Static assets
   - API responses (via Cache-Control headers)

### Cache Invalidation
- **On Mutations**: Automatic via Server Actions
- **Time-based**: TTL expiration
- **Manual**: revalidatePath() in Server Actions

---

## Type Safety

### Shared Types Package
```
shared/types/
├── auth.types.ts      # Authentication types
├── task.types.ts      # Task types
├── api.types.ts       # API response types
└── index.ts           # Exports
```

### Benefits
- Single source of truth
- Type-safe API calls
- Compile-time error detection
- Better IDE autocomplete

---

## Performance Optimizations

### Frontend
- ✅ Server Components for initial render
- ✅ Automatic code splitting
- ✅ Image optimization (ready)
- ✅ Font optimization (ready)
- ✅ CSS Modules for scoped styling

### Backend
- ✅ Redis caching for queries
- ✅ Database connection pooling
- ✅ Query optimization with TypeORM
- ✅ Response compression (Express default)

### Network
- ✅ HTTP/2 support
- ✅ Gzip compression
- ✅ Cache-Control headers
- ✅ Stale-while-revalidate

---

## Deployment Architecture

### Production Setup
```
┌─────────────┐
│   Vercel    │  ← Next.js Frontend
│  (CDN Edge) │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Railway   │  ← NestJS Backend
│  (Backend)  │
└──────┬──────┘
       │
   ┌───┴───┐
   ↓       ↓
┌──────┐ ┌──────┐
│  PG   │ │Redis │
│  DB   │ │Cache │
└──────┘ └──────┘
```

---

## Development Workflow

1. **Local Development**
   - Docker Compose for PostgreSQL + Redis
   - Hot reload for both frontend and backend
   - TypeScript compilation in watch mode

2. **Testing**
   - Unit tests (to be added)
   - Integration tests (to be added)
   - E2E tests (to be added)

3. **Deployment**
   - Frontend: Vercel (automatic from Git)
   - Backend: Railway/Render (Docker or direct)
   - Database: Managed PostgreSQL
   - Cache: Managed Redis

---

**Last Updated**: 2024  
**Version**: 3.0.0


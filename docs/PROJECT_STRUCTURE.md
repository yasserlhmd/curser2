# Project Structure

## Overview

Task Manager - Modern full-stack application with **Next.js** frontend and **NestJS** backend, featuring type-safe architecture and optimized performance.

## Directory Structure

```
task-manager/
├── frontend/                  # Next.js Frontend Application
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── providers.tsx      # Client providers wrapper
│   │   ├── page.tsx           # Home page (Server Component)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── api/               # Next.js API routes (proxy)
│   │   │   ├── auth/          # Auth endpoints
│   │   │   └── tasks/          # Task endpoints
│   │   └── actions/            # Server Actions
│   │       ├── auth.ts         # Auth mutations
│   │       └── tasks.ts        # Task mutations
│   ├── components/            # React components
│   │   ├── ui/                # Base UI (Button, Input)
│   │   ├── features/          # Feature components
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   └── TaskFilter.tsx
│   │   └── layout/            # Layout components
│   │       └── Navbar.tsx
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── TaskContext.tsx
│   ├── lib/                   # Utilities and services
│   │   ├── api/               # API clients
│   │   │   ├── client.ts      # Client-side API (uses /api routes)
│   │   │   ├── server.ts      # Server-side API (for Server Components)
│   │   │   ├── authService.ts
│   │   │   └── taskService.ts
│   │   ├── constants/
│   │   └── utils/
│   ├── styles/                # Global styles
│   │   └── globals.css
│   ├── middleware.ts          # Next.js middleware
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── main.ts            # Application entry point
│   │   ├── app.module.ts      # Root module
│   │   ├── app.controller.ts # Health check
│   │   ├── app.service.ts
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/           # Register, Login, AuthResponse DTOs
│   │   ├── users/              # Users module
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── tasks/              # Tasks module
│   │   │   ├── tasks.module.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   └── dto/           # Create, Update, Query, Response DTOs
│   │   ├── database/           # Database module
│   │   │   ├── database.module.ts
│   │   │   ├── database.service.ts
│   │   │   └── entities/     # User, Task entities
│   │   ├── redis/              # Redis module
│   │   │   ├── redis.module.ts
│   │   │   └── redis.service.ts
│   │   ├── token-revocation/   # Token revocation module
│   │   ├── common/             # Shared utilities
│   │   │   ├── decorators/    # @Public, @CurrentUser
│   │   │   ├── guards/        # JwtAuthGuard, OptionalJwtGuard
│   │   │   ├── interceptors/  # TransformInterceptor, CacheInterceptor
│   │   │   ├── filters/       # HttpExceptionFilter
│   │   │   └── interfaces/
│   │   └── config/            # Configuration
│   │       ├── config.module.ts
│   │       └── config.service.ts
│   ├── env.example            # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── shared/                     # Shared TypeScript Types
│   ├── types/
│   │   ├── auth.types.ts     # Authentication types
│   │   ├── task.types.ts     # Task types
│   │   ├── api.types.ts      # API response types
│   │   └── index.ts          # Exports
│   ├── package.json
│   └── tsconfig.json
│
├── database/                   # Database Setup
│   ├── schema.sql             # Database schema
│   ├── docker-compose.yml     # Docker PostgreSQL + Redis setup
│   ├── migrations/            # Database migrations
│   ├── setup.sh              # Setup script (Git Bash)
│   ├── setup.ps1             # Setup script (PowerShell)
│   └── README.md
│
├── docs/                       # Project Documentation
│   ├── README.md              # Documentation index
│   ├── QUICK_START.md         # Quick start guide
│   ├── ARCHITECTURE.md        # Detailed architecture
│   ├── MIGRATION_HISTORY.md   # Migration details
│   ├── IMPLEMENTATION_COMPLETE.md
│   └── ...                    # Other documentation
│
└── README.md                   # Project README
```

## Key Files

### Frontend (Next.js)

#### App Router
- `app/layout.tsx` - Root layout with metadata
- `app/page.tsx` - Home page (Server Component)
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Register page

#### API Routes
- `app/api/auth/*` - Authentication endpoints (proxy to NestJS)
- `app/api/tasks/*` - Task endpoints (proxy to NestJS)

#### Server Actions
- `app/actions/auth.ts` - Authentication mutations
- `app/actions/tasks.ts` - Task mutations

#### Components
- `components/ui/` - Reusable UI components (Button, Input)
- `components/features/` - Feature components (TaskForm, TaskList, etc.)
- `components/layout/` - Layout components (Navbar)

#### Services
- `lib/api/client.ts` - Client-side API client (uses Next.js API routes)
- `lib/api/server.ts` - Server-side API client (for Server Components)
- `lib/api/authService.ts` - Auth service methods
- `lib/api/taskService.ts` - Task service methods

### Backend (NestJS)

#### Core
- `src/main.ts` - Application bootstrap
- `src/app.module.ts` - Root module with all imports

#### Modules
- `src/auth/` - Authentication module (JWT, Passport)
- `src/users/` - Users module
- `src/tasks/` - Tasks module (with caching)
- `src/database/` - Database module (TypeORM)
- `src/redis/` - Redis module
- `src/token-revocation/` - Token revocation module

#### Common
- `src/common/guards/` - Authentication guards
- `src/common/interceptors/` - Response transformation, caching
- `src/common/filters/` - Exception handling
- `src/common/decorators/` - Custom decorators

### Shared
- `shared/types/` - TypeScript types shared across stack

## Code Organization

### Frontend Structure
- **App Router**: Pages, API routes, Server Actions
- **Components**: UI, features, layout components
- **Context**: Global state management (Auth, Tasks)
- **Services**: API communication layer
- **Lib**: Utilities, constants, helpers

### Backend Structure
- **Modules**: Feature modules (Auth, Users, Tasks)
- **Controllers**: HTTP request/response handling
- **Services**: Business logic and database operations
- **DTOs**: Data transfer objects with validation
- **Entities**: TypeORM database entities
- **Guards**: Route protection
- **Interceptors**: Response transformation, caching
- **Filters**: Exception handling

## Environment Files

### Backend (`backend/.env`)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secret_key
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Legacy Files

The following directories contain legacy files from the old implementation:

- `backend/src/routes/` - Old Express routes (not used)
- `backend/src/controllers/` - Old Express controllers (not used)
- `backend/src/services/` - Old Express services (not used)
- `backend/src/middleware/` - Old Express middleware (not used)
- `frontend/src/` - Old Create React App structure (not used)

See [CLEANUP_GUIDE.md](./CLEANUP_GUIDE.md) for details on removing legacy files.

---

**Last Updated**: 2024  
**Version**: 3.0.0

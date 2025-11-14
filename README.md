# Task Manager

A modern, efficient task management web application built with **NestJS** and **Next.js**. Features type-safe architecture, server-side rendering, and optimized performance.

## 🎯 Project Overview

**Features:**
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ Task status tracking (pending → in-progress → completed)
- ✅ Advanced filtering (by status, user, nested filters)
- ✅ User authentication with JWT
- ✅ Multi-user support with task ownership
- ✅ Server-side rendering for better performance
- ✅ Real-time updates with optimistic UI
- ✅ SEO optimized with dynamic metadata

## 🛠️ Tech Stack

**Frontend:**
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Server Components** for initial rendering
- **Server Actions** for mutations
- **CSS Modules** for styling

**Backend:**
- **NestJS 10** with TypeScript
- **TypeORM** for database operations
- **PostgreSQL** for data persistence
- **Redis** for caching and token revocation
- **Swagger** for API documentation

**Infrastructure:**
- **Docker** for local PostgreSQL and Redis
- **TypeScript** throughout
- **Shared types** package for type safety
- **Rate limiting** and security features

## 📁 Project Structure

```
task-manager/
├── frontend/          # Next.js frontend application
│   ├── app/           # Next.js App Router (pages, API routes, actions)
│   ├── components/    # React components
│   ├── context/       # Context providers
│   ├── lib/           # Utilities and services
│   └── shared/        # Shared types
├── backend/           # NestJS backend API
│   └── src/           # Source code
│       ├── auth/      # Authentication module
│       ├── users/     # Users module
│       ├── tasks/      # Tasks module
│       ├── database/  # Database module
│       └── common/    # Shared utilities
├── shared/            # Shared TypeScript types
├── database/           # Database schema and Docker setup
└── docs/               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (latest)
- npm or yarn
- Docker (for local PostgreSQL)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. **Set up database (Docker)**
   ```bash
   cd database
   docker-compose up -d
   ```

3. **Set up backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

4. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm start
   ```

## 📚 Documentation

See **[docs/README.md](docs/README.md)** for complete documentation index.

**Quick Links:**
- **[Quick Start Guide](docs/QUICK_START.md)** - Get started quickly
- **[Implementation Status](docs/IMPLEMENTATION_COMPLETE.md)** - Current state
- **[Optimization Plan](docs/OPTIMIZATION_PLAN.md)** - Performance optimizations
- **[Migration History](docs/MIGRATION_HISTORY.md)** - Migration details

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Start NestJS in watch mode
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🌐 API Endpoints

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Get all tasks (with filters) | Optional |
| GET | `/api/tasks/:id` | Get task by ID | Optional |
| POST | `/api/tasks` | Create new task | Required |
| PUT | `/api/tasks/:id` | Update task | Required |
| DELETE | `/api/tasks/:id` | Delete task | Required |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users` | Get all users (for filtering) |

**API Documentation**: `http://localhost:5000/api/docs` (Swagger)

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000

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

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

See `backend/env.example` for complete backend configuration.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Key Features

- **Type Safety**: Shared TypeScript types across frontend and backend
- **Performance**: Multi-layer caching (Next.js + NestJS), Server Components
- **Security**: HTTP-only cookies, rate limiting, JWT authentication
- **SEO**: Dynamic metadata, Open Graph tags, server-side rendering
- **Developer Experience**: Server Actions, automatic revalidation, Swagger docs

## 🚢 Deployment

See [MANIFEST.md](docs/MANIFEST.md) for detailed deployment instructions.

**Quick Deploy:**
- Frontend: Deploy to Vercel (optimized for Next.js)
- Backend: Deploy to Railway/Render
- Database: Managed PostgreSQL
- Cache: Managed Redis

## 📄 License

MIT License

## 👥 Contributing

See [GUIDELINES.md](docs/GUIDELINES.md) for coding standards and contribution guidelines.

---

**Status:** ✅ Production Ready  
**Version:** 3.0.0  
**Last Updated:** 2024

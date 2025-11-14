# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 14+ (via Docker or local installation)
- **Redis** 6+ (via Docker or local installation)
- **npm** or **yarn**
- **Docker** (for local database and Redis)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd task-manager
```

2. **Install Backend Dependencies**:
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**:
```bash
cd frontend
npm install
```

### Environment Setup

1. **Backend Environment** (`backend/.env`):
```bash
cd backend
cp env.example .env
# Edit .env with your configuration
```

Required variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=taskmanager_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secure_secret_key_here
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

2. **Frontend Environment** (`frontend/.env.local`):
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
```

### Running the Application

1. **Start Database & Redis** (Docker):
```bash
cd database
docker-compose up -d
```

2. **Start Backend**:
```bash
cd backend
npm run start:dev
```
Backend will be available at `http://localhost:5000`

3. **Start Frontend** (in a new terminal):
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:3000`

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Swagger Docs**: http://localhost:5000/api/docs (development only)
- **Next.js API Routes**: http://localhost:3000/api/*

---

## 🎯 Key Features

### Type Safety
- Shared types in `shared/types/`
- TypeScript strict mode
- Type-safe API calls

### Performance
- Server Components for initial render
- Multi-layer caching (Next.js + NestJS)
- Server Actions for mutations

### Security
- HTTP-only cookies
- Rate limiting (100 req/min)
- Server-side validation

### SEO
- Dynamic metadata
- Open Graph tags
- Twitter cards

---

## 📝 Usage Examples

### Using Server Actions

```typescript
'use client';
import { createTask } from '@/app/actions/tasks';

async function handleSubmit(formData: FormData) {
  const result = await createTask({
    title: formData.get('title'),
    description: formData.get('description'),
  });
  
  if (result.success) {
    // Task created, cache automatically revalidated
  }
}
```

### Using Server Components

```typescript
// app/page.tsx
import { fetchTasks } from '@/lib/api/server';

export default async function Page() {
  const tasks = await fetchTasks(); // Server-side fetch
  return <TaskList initialTasks={tasks} />;
}
```

### Using API Routes

```typescript
// Client-side
const response = await fetch('/api/tasks', {
  credentials: 'include', // Sends cookies
});
```

---

## 🔧 Troubleshooting

### Cache Issues
- Clear Next.js cache: `rm -rf .next`
- Clear NestJS cache: Restart Redis

### Type Errors
- Run `npm run build` in `shared/` directory
- Check TypeScript paths in `tsconfig.json`

### Cookie Issues
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Verify cookie domain settings

---

## 📚 Documentation

- [Optimization Plan](./OPTIMIZATION_PLAN.md)
- [Synergy Enhancements](./SYNERGY_ENHANCEMENTS.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)
- [Implementation Complete](./IMPLEMENTATION_COMPLETE.md)

---

**Happy Coding! 🎉**


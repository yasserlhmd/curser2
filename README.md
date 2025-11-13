# Task Manager Web App

A simple, efficient task management web application built with React and Node.js. Focus on simplicity, speed, and immediate usability.

## 🎯 Project Overview

**MVP Features:**
- Task CRUD operations (Create, Read, Update, Delete)
- Task status tracking (pending → in-progress → completed)
- Basic filtering by status (all, pending, completed)
- Responsive React UI
- PostgreSQL database persistence

## 🛠️ Tech Stack

**Frontend:**
- React (latest)
- Tailwind CSS
- Axios
- React Context API

**Backend:**
- Node.js (latest)
- Express.js
- PostgreSQL
- pg (node-postgres)

**Development:**
- Docker (for local PostgreSQL)
- ESLint + Prettier

**Deployment:**
- Frontend: Vercel/Netlify
- Backend: Railway/Render
- Database: Managed PostgreSQL

## 📁 Project Structure

```
task-manager/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── database/          # Database schema and Docker setup
└── docs/              # Project documentation
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

- **[PRD.md](docs/PRD.md)** - Product Requirements Document
- **[ROADMAP.md](docs/ROADMAP.md)** - Product roadmap and features
- **[BLUEPRINT.md](docs/BLUEPRINT.md)** - Architecture blueprint
- **[SPRINT.md](docs/SPRINT.md)** - Sprint plan and task backlog
- **[GUIDELINES.md](docs/GUIDELINES.md)** - Coding guidelines and AI prompts
- **[TEST.md](docs/TEST.md)** - Test strategy and QA checklist
- **[MANIFEST.md](docs/MANIFEST.md)** - Deployment configuration
- **[DEVLOG.md](docs/DEVLOG.md)** - Development log

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Run ESLint
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm test             # Run tests
npm run build        # Build for production
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks?status=pending` | Filter tasks by status |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

See [MANIFEST.md](docs/MANIFEST.md) for detailed deployment instructions.

**Quick Deploy:**
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to Railway/Render
- Database: Set up managed PostgreSQL

## 📄 License

MIT License

## 👥 Contributing

This is an MVP project. See [GUIDELINES.md](docs/GUIDELINES.md) for coding standards and contribution guidelines.

---

**Status:** 🚧 In Development (MVP)

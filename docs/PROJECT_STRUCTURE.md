# Project Structure

## Overview

Task Manager Web App - Full-stack MVP application with React frontend and Node.js backend.

## Directory Structure

```
task-manager/
├── frontend/              # React Frontend Application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components (Button, Input, TaskList, TaskItem, TaskForm, TaskFilter)
│   │   ├── context/       # React Context (TaskContext)
│   │   ├── pages/         # Page components (HomePage)
│   │   ├── services/      # API service layer (api.js, taskService.js)
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   ├── package.json
│   └── README.md
│
├── backend/                # Node.js Backend API
│   ├── src/
│   │   ├── config/        # Configuration (database.js)
│   │   ├── controllers/   # Request handlers (taskController.js)
│   │   ├── services/      # Business logic (taskService.js)
│   │   ├── routes/        # API routes (taskRoutes.js)
│   │   ├── middleware/    # Custom middleware
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   ├── migrations/        # Database migrations
│   ├── env.example       # Environment variables template
│   ├── package.json
│   └── .gitignore
│
├── database/               # Database Setup
│   ├── schema.sql         # Database schema
│   ├── docker-compose.yml # Docker PostgreSQL setup
│   ├── setup.sh          # Setup script (Git Bash)
│   ├── setup.ps1         # Setup script (PowerShell)
│   └── README.md
│
├── docs/                   # Project Documentation
│   ├── PRD.md             # Product Requirements Document
│   ├── ROADMAP.md         # Product Roadmap
│   ├── BLUEPRINT.md       # Architecture Blueprint
│   ├── SPRINT.md          # Sprint Plan
│   ├── GUIDELINES.md      # Coding Guidelines
│   ├── TEST.md            # Test Strategy
│   ├── MANIFEST.md        # Deployment Manifest
│   └── DEVLOG.md          # Development Log
│
└── README.md               # Project README
```

## Key Files

### Frontend
- `src/App.js` - Main application component
- `src/pages/HomePage.jsx` - Main page with all components
- `src/components/` - Reusable UI components
- `src/services/api.js` - Axios instance configuration
- `src/services/taskService.js` - Task API methods
- `src/context/TaskContext.jsx` - Global state management

### Backend
- `src/server.js` - Server entry point
- `src/app.js` - Express app configuration
- `src/routes/taskRoutes.js` - Task API routes
- `src/controllers/taskController.js` - Request handlers
- `src/services/taskService.js` - Business logic
- `src/config/database.js` - Database connection

### Database
- `schema.sql` - Database schema with tasks table
- `docker-compose.yml` - PostgreSQL Docker setup
- `setup.sh` / `setup.ps1` - Database setup scripts

## Code Organization

### Frontend Structure
- **Components**: Reusable UI components (Button, Input, TaskList, TaskItem, TaskForm, TaskFilter)
- **Context**: Global state management (TaskContext)
- **Services**: API communication layer
- **Pages**: Page-level components

### Backend Structure
- **Routes**: API endpoint definitions
- **Controllers**: HTTP request/response handling
- **Services**: Business logic and database operations
- **Config**: Configuration files (database connection)
- **Middleware**: Custom middleware (error handling, validation)

## Environment Files

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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks?status=pending` | Filter tasks by status |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Technology Stack

- **Frontend**: React, Axios, React Context API
- **Backend**: Node.js, Express.js, PostgreSQL (pg)
- **Database**: PostgreSQL (Docker for local development)
- **Deployment**: Vercel/Netlify (frontend), Railway/Render (backend)


# Roadmap / Feature Map

## 1. Release Goals

- **Version 1.0 (MVP):** Core functionality
  - Task CRUD operations
  - Task status tracking (pending → in-progress → completed)
  - Basic filtering by status
  - Responsive React UI
  - PostgreSQL database
  - Production deployment

## 2. Epics and Features

| Epic | Feature | Description | Priority | Status |
|------|---------|-------------|----------|--------|
| **Core Task Management** | Task CRUD Operations | Create, read, update, and delete tasks via REST API | High | ✅ Completed |
| **Core Task Management** | Task Status Management | Track task status (pending → in-progress → completed) | High | ✅ Completed |
| **Core Task Management** | Backend Data Persistence | PostgreSQL database integration for task storage | High | ✅ Completed |
| **Core Task Management** | Basic Filtering | Filter tasks by status (all/pending/completed) | High | ✅ Completed |
| **Core Task Management** | Responsive React UI | Component-based React interface with CSS | High | ✅ Completed |
| **Core Task Management** | Node.js Express API | RESTful API server for backend operations | High | ✅ Completed |

## 3. Milestones

| Milestone | Target Date | Deliverables | Owner | Status |
|-----------|-------------|--------------|-------|--------|
| **MVP Development (v1.0)** | 4-5 weeks | Task CRUD, Status management, Database, Filtering, React UI, Express API | Development Team | ✅ Completed |
| **MVP Deployment (v1.0)** | TBD | Production deployment, Testing, Monitoring | Development Team | ⏸️ Pending |

## 4. Dependencies

### External Dependencies
- **React**: Frontend framework (latest version)
- **Express.js**: Backend framework (latest version)
- **PostgreSQL**: Database system (managed service)
- **Vercel/Netlify**: Frontend hosting (free tier available)
- **Railway/Render**: Backend hosting (free tier available)
- **Docker**: Local database development (optional)

### Internal Dependencies
- **Task CRUD Operations** → Required for all task-related features
- **Node.js Express API** → Required for backend data persistence
- **User Authentication** → Required for multi-user support and collaboration features
- **Backend Data Persistence** → Required for all data-driven features
- **Task List View** → Required for drag-and-drop reordering
- **Basic Filtering** → Required for advanced filtering
- **Task Categories** → Required for advanced filtering by category
- **Due Dates** → Required for task reminders
- **Task Sharing** → Required for multi-user editing and comments
- **File Storage** → Required for task attachments

### Dependency Status
| Dependency | Status | Notes |
|------------|--------|-------|
| React | ✅ Available | Latest version |
| Express.js | ✅ Available | Latest version |
| PostgreSQL | ✅ Available | Managed service required |
| Frontend Hosting | ✅ Available | Vercel/Netlify free tier |
| Backend Hosting | ✅ Available | Railway/Render free tier |
| Docker | ✅ Available | Optional for local dev |

## 5. Future Ideas (Backlog)

Post-MVP features to consider after v1.0 launch:
- **User authentication and multi-user support** - 📋 [Feature Plan Available](FEATURE_PLAN_AUTH.md)
- Task categories, tags, and search
- Due dates and reminders
- Dark mode theme
- Task sharing and collaboration
- File attachments
- Mobile native app
- Offline support

---

**Document Version**: 2.1  
**Last Updated**: 2025-01-XX


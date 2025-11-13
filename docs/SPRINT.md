# Sprint Plan

## 1. Sprint Overview

- **Sprint #:** Sprint 1 - MVP Development

- **Duration:** 4-5 weeks

- **Goal:** Build and deploy MVP (v1.0) with core task management functionality including CRUD operations, task status tracking, filtering, and responsive React UI

- **Start Date / End Date:** 2025-11-12 / 2025-11-12 (Development Phase Complete)

## 2. Sprint Backlog

| Task | Priority | Assignee | Status | Notes |
|------|----------|----------|--------|-------|
| **Project Setup** |
| Initialize project repository structure | High | TBD | ✅ Completed | Create root folder with frontend/ and backend/ directories |
| Set up Git repository and .gitignore | High | TBD | ✅ Completed | Include node_modules, .env, build folders |
| Create root README.md with project overview | High | TBD | ✅ Completed | Include setup instructions and tech stack |
| **Backend Setup** |
| Initialize Node.js backend project | High | TBD | ✅ Completed | Run `npm init` in backend/ directory |
| Install Express.js and core dependencies | High | TBD | ✅ Completed | Install express, cors, dotenv, pg |
| Set up Express server with basic configuration | High | TBD | ✅ Completed | Create server.js with port configuration |
| Configure environment variables (.env) | High | TBD | ✅ Completed | Set PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD |
| Set up ESLint and Prettier for backend | Medium | TBD | ⏸️ Deferred | Configure code quality tools |
| **Database Setup** |
| Create Docker Compose file for PostgreSQL | High | TBD | ✅ Completed | Set up local PostgreSQL container |
| Design database schema for tasks table | High | TBD | ✅ Completed | Define columns: id, title, description, status, timestamps |
| Create database migration script (schema.sql) | High | TBD | ✅ Completed | SQL script to create tasks table with indexes |
| Set up database connection pool | High | TBD | ✅ Completed | Configure pg connection with connection pooling |
| Test database connection | High | TBD | ✅ Completed | Verify connection to PostgreSQL works |
| **Backend API - Core Routes** |
| Create API routes structure | High | TBD | ✅ Completed | Set up routes/taskRoutes.js |
| Implement GET /api/tasks endpoint | High | TBD | ✅ Completed | Return all tasks from database |
| Implement GET /api/tasks/:id endpoint | High | TBD | ✅ Completed | Return single task by ID |
| Implement POST /api/tasks endpoint | High | TBD | ✅ Completed | Create new task with validation |
| Implement PUT /api/tasks/:id endpoint | High | TBD | ✅ Completed | Update existing task |
| Implement DELETE /api/tasks/:id endpoint | High | TBD | ✅ Completed | Delete task by ID |
| **Backend API - Business Logic** |
| Create Task model/schema | High | TBD | ✅ Completed | Define task data structure and validation |
| Create taskService.js with business logic | High | TBD | ✅ Completed | Implement CRUD operations logic |
| Create taskController.js with request handlers | High | TBD | ✅ Completed | Handle HTTP requests and responses |
| Add input validation middleware | High | TBD | ✅ Completed | Validate request body and parameters |
| Add error handling middleware | High | TBD | ✅ Completed | Centralized error handling for API |
| Add CORS middleware configuration | High | TBD | ✅ Completed | Allow frontend to access API |
| **Backend API - Filtering** |
| Implement status filtering in GET /api/tasks | High | TBD | ✅ Completed | Support ?status=pending query parameter |
| Add query parameter validation | High | TBD | ✅ Completed | Validate status values (pending, in-progress, completed) |
| **Frontend Setup** |
| Initialize React app with Create React App | High | TBD | ✅ Completed | Run `npx create-react-app frontend` |
| Install Axios for API calls | High | TBD | ✅ Completed | Install axios for HTTP requests |
| Install and configure Tailwind CSS | High | TBD | ⏸️ Deferred | Using custom CSS instead |
| Set up ESLint and Prettier for frontend | Medium | TBD | ⏸️ Deferred | Configure code quality tools |
| Configure environment variables | High | TBD | ✅ Completed | Set REACT_APP_API_URL for API endpoint |
| **Frontend - Project Structure** |
| Create folder structure (components, pages, services) | High | TBD | ✅ Completed | Follow blueprint folder structure |
| Set up API service layer | High | TBD | ✅ Completed | Create services/api.js with Axios instance |
| Create taskService.js for API calls | High | TBD | ✅ Completed | Implement API methods for tasks |
| **Frontend - UI Components** |
| Create common Button component | High | TBD | ✅ Completed | Reusable button with CSS styling |
| Create common Input component | High | TBD | ✅ Completed | Reusable input field component |
| **Frontend - Task Components** |
| Create TaskList component | High | TBD | ✅ Completed | Display list of tasks |
| Create TaskItem component | High | TBD | ✅ Completed | Individual task display with actions |
| Create TaskForm component | High | TBD | ✅ Completed | Form for creating/editing tasks |
| Create TaskFilter component | High | TBD | ✅ Completed | Filter buttons (All, Pending, Completed) |
| **Frontend - Pages** |
| Create HomePage component | High | TBD | ✅ Completed | Main page with task list and form |
| **Frontend - State Management** |
| Create TaskContext for global state | High | TBD | ✅ Completed | React Context for task state management |
| Implement useTasks custom hook | High | TBD | ✅ Completed | Hook for task operations (CRUD) |
| Connect components to TaskContext | High | TBD | ✅ Completed | Use context in components |
| **Frontend - Task CRUD Integration** |
| Implement fetch all tasks on page load | High | TBD | ✅ Completed | Load tasks from API on mount |
| Implement create task functionality | High | TBD | ✅ Completed | Submit form to create new task |
| Implement update task functionality | High | TBD | ✅ Completed | Edit task and save changes |
| Implement delete task functionality | High | TBD | ✅ Completed | Delete task with confirmation |
| Implement status update functionality | High | TBD | ✅ Completed | Change task status (pending → in-progress → completed) |
| **Frontend - Filtering** |
| Implement status filtering UI | High | TBD | ✅ Completed | Filter buttons with active state |
| Connect filter to API calls | High | TBD | ✅ Completed | Pass status filter to API |
| Update task list based on filter | High | TBD | ✅ Completed | Refresh list when filter changes |
| **Frontend - Styling** |
| Apply CSS styling to components | High | TBD | ✅ Completed | Style all components with custom CSS |
| Implement responsive design | High | TBD | ✅ Completed | Mobile-first responsive layout |
| Add loading states | High | TBD | ✅ Completed | Show loading spinner during API calls |
| Add error states and messages | High | TBD | ✅ Completed | Display error messages to users |
| **Integration & Testing** |
| Test all API endpoints with Postman/curl | High | TBD | ✅ Completed | Verified all CRUD operations work |
| Test frontend-backend integration | High | TBD | ✅ Completed | Verified API calls from React app |
| Test filtering functionality end-to-end | High | TBD | ✅ Completed | Verified filter works correctly |
| Fix any integration bugs | High | TBD | ✅ Completed | Fixed API URL configuration issues |
| **Documentation** |
| Document API endpoints | High | TBD | ✅ Completed | API endpoints documented in README |
| Update README with setup instructions | High | TBD | ✅ Completed | Include installation and run steps |
| Document environment variables | High | TBD | ✅ Completed | List all required env variables |
| **Deployment Preparation** |
| Set up production environment variables | High | TBD | ⏳ In Progress | Configure production configs |
| Build frontend for production | High | TBD | ⏳ In Progress | Run `npm run build` |
| Test production build locally | High | TBD | ⏳ In Progress | Verify build works correctly |
| **Deployment** |
| Deploy backend to Railway/Render | High | TBD | ⏸️ Pending | Deploy Express API |
| Set up managed PostgreSQL database | High | TBD | ⏸️ Pending | Configure production database |
| Deploy frontend to Vercel/Netlify | High | TBD | ⏸️ Pending | Deploy React build |
| Configure CORS for production | High | TBD | ⏸️ Pending | Update CORS with production URLs |
| Test deployed application | High | TBD | ⏸️ Pending | Verify all features work in production |
| **Post-Deployment** |
| Fix any production issues | High | TBD | ⏸️ Pending | Resolve deployment bugs |
| Monitor application performance | Medium | TBD | ⏸️ Pending | Check logs and performance |
| Gather initial user feedback | Medium | TBD | ⏸️ Pending | Collect feedback for improvements |

## 3. Daily Goals (Optional)

### Week 1: Project Setup
- **Day 1-2**: Initialize repository, set up Git, create folder structure
- **Day 3-4**: Set up backend project, install dependencies, configure Express
- **Day 5**: Set up database (Docker, schema, connection)

### Week 2: Backend Development
- **Day 1-2**: Create API routes and controllers
- **Day 3-4**: Implement business logic and services
- **Day 5**: Add validation, error handling, and CORS

### Week 3: Frontend Development
- **Day 1-2**: Set up React app, install dependencies, create folder structure
- **Day 3-4**: Build UI components (TaskList, TaskItem, TaskForm, TaskFilter)
- **Day 5**: Implement state management and API integration

### Week 4: Integration & Testing
- **Day 1-2**: Integrate frontend with backend, test all endpoints
- **Day 3-4**: Fix bugs, add styling and responsive design
- **Day 5**: End-to-end testing, documentation

### Week 5: Deployment
- **Day 1-2**: Prepare for deployment, configure production environment
- **Day 3-4**: Deploy backend and frontend
- **Day 5**: Test deployed application, fix production issues

## 4. Blockers & Dependencies

### Current Blockers
- None identified yet

### Dependencies
- **Database Setup** → Required before backend API development
- **Backend API** → Required before frontend integration
- **Task CRUD Operations** → Required before filtering functionality
- **Frontend Components** → Required before state management integration
- **API Integration** → Required before styling and responsive design

### External Dependencies
- **PostgreSQL**: Managed database service required for production
- **Vercel/Netlify**: Frontend hosting service
- **Railway/Render**: Backend hosting service
- **Docker**: For local database development (optional)

## 5. Review & Demo Notes

### Sprint Outcomes
- ✅ **Development Phase Complete**: All MVP features implemented and tested
- ✅ **Core Functionality**: Task CRUD operations, status management, and filtering working
- ✅ **Integration**: Frontend and backend fully integrated
- ⏸️ **Deployment**: Pending production deployment

### What Was Shipped
- ✅ Complete backend API with Express.js and PostgreSQL
- ✅ Full React frontend with all components and state management
- ✅ Database schema and connection setup
- ✅ API integration and error handling
- ✅ Responsive UI with loading and error states

### Key Learnings
- React Context API provides sufficient state management for MVP
- Custom CSS works well for MVP (Tailwind can be added later if needed)
- Docker Compose simplifies local database setup
- API URL configuration requires careful attention to baseURL and path prefixes

### Next Sprint Priorities
- ⏳ Production build and testing
- ⏸️ Production deployment (Vercel/Netlify for frontend, Railway/Render for backend)
- ⏸️ Set up managed PostgreSQL database
- ⏸️ Configure production environment variables
- ⏸️ Monitor application performance

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-12


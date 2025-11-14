# Feature Plan: User Authentication and Multi-User Support

## 1. Overview

**Feature**: User Authentication and Multi-User Support  
**Priority**: High (First Post-MVP Feature)  
**Estimated Timeline**: 3-4 weeks  
**Status**: 📋 Planned

### Objective
Transform the single-user Task Manager into a multi-user application where each user has their own isolated task list. Users can register, login, and manage their personal tasks securely.

### Success Criteria
- Users can register with email and password
- Users can login and receive authentication tokens
- Users can only see and manage their own tasks
- Authentication persists across browser sessions
- Secure password storage with hashing
- Protected API endpoints require authentication
- Frontend routes are protected based on auth state

## 2. User Stories

- As a **new user**, I want to create an account with email and password, so I can start using the application.
- As a **user**, I want to login with my credentials, so I can access my tasks.
- As a **user**, I want to logout, so I can securely end my session.
- As a **user**, I want my tasks to be private and only visible to me, so my data is secure.
- As a **user**, I want to stay logged in across browser sessions, so I don't have to login repeatedly.
- As a **user**, I want to see my user profile information, so I know which account I'm using.

## 3. Technical Architecture

### 3.1 Authentication Strategy

**JWT (JSON Web Tokens) Based Authentication**
- Stateless authentication using JWT tokens
- Token stored in `localStorage` (frontend) or `httpOnly` cookies (more secure option)
- Token expiration: 7 days (configurable)
- Refresh token mechanism for extended sessions

**Why JWT?**
- Stateless (no server-side session storage needed)
- Scalable (works well with distributed systems)
- Native implementation possible (using Node.js `crypto` module)
- Industry standard for REST APIs

### 3.2 Password Security

**Password Hashing**
- Use Node.js native `crypto` module with `pbkdf2` or `scrypt`
- Salt each password individually
- Minimum password requirements: 8 characters, 1 uppercase, 1 lowercase, 1 number
- Password reset functionality (future enhancement)

**Why Native Crypto?**
- No external dependencies (bcrypt would require a package)
- Built into Node.js, well-tested and secure
- Good performance with proper configuration

### 3.3 Session Revocation Strategy

**Hybrid Approach: Persistent Redis Token Blacklist + Token Versioning**

To enable secure token revocation while maintaining performance, we use a two-tier approach:

1. **Token Versioning (Primary)**: Fast bulk revocation
   - Each user has a `token_version` field in the database
   - When password changes or security breach occurs, increment version
   - All tokens with old version are automatically invalid
   - Very fast check (single database lookup per request)

2. **Persistent Redis Blacklist (Secondary)**: Granular per-token revocation
   - Redis stores revoked token IDs (JTI) with TTL matching token expiration
   - Used for individual logout operations
   - Redis persistence enabled (RDB + AOF) to survive restarts
   - Sub-millisecond lookup performance
   - Automatic cleanup via TTL

**Why This Hybrid Approach?**
- **Performance**: Redis provides ultra-fast token blacklist checks (~0.1-1ms)
- **Persistence**: Redis persistence ensures tokens remain revoked after restarts
- **Scalability**: Works excellently in distributed systems (multiple servers)
- **Flexibility**: Token versioning for bulk operations, Redis for granular control
- **Reliability**: If Redis is unavailable, fallback to token versioning only

**Token Structure:**
```javascript
{
  "userId": 123,
  "email": "user@example.com",
  "jti": "unique-token-id-uuid",  // Required for blacklisting
  "version": 1,                    // User's token_version
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Revocation Scenarios:**
- **Logout**: Add token JTI to Redis blacklist with TTL
- **Password Change**: Increment user's token_version (invalidates all tokens)
- **Security Breach**: Increment token_version + optionally blacklist specific tokens
- **Account Deletion**: Increment token_version + clear all user's Redis entries

**Fallback Strategy:**
- If Redis is unavailable, system falls back to token versioning only
- Graceful degradation ensures service continues operating
- Logs Redis connection issues for monitoring

### 3.4 Database Schema Changes

#### New Table: `users`
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    token_version INTEGER DEFAULT 1,  -- Increment to invalidate all user tokens
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_token_version ON users(id, token_version);
```

**Token Versioning:**
- `token_version` starts at 1 for new users
- Incremented when password changes or security breach occurs
- All tokens with version < current version are automatically invalid
- Fast single-query check during token validation

#### Modify Table: `tasks`
```sql
ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Migration Strategy:**
- Create migration script to add `user_id` to existing tasks
- For existing tasks without user_id, assign to a default "guest" user or mark as orphaned
- Add foreign key constraint with CASCADE delete (when user is deleted, their tasks are deleted)

## 4. Implementation Plan

### Phase 1: Backend Authentication (Week 1)

#### 4.1 Database Setup
- [ ] Create `users` table migration script
- [ ] Modify `tasks` table to include `user_id` column
- [ ] Create database indexes for performance
- [ ] Test migration on development database

#### 4.2 Authentication Service
- [ ] Create `backend/src/services/authService.js`
  - `registerUser(email, password, name)` - Register new user
  - `loginUser(email, password)` - Authenticate and return JWT
  - `verifyToken(token)` - Verify JWT token
  - `hashPassword(password, salt)` - Hash password with salt
  - `generateSalt()` - Generate random salt
  - `validatePassword(password, hash, salt)` - Verify password

#### 4.3 JWT Implementation
- [ ] Create `backend/src/utils/jwt.js` using Node.js `crypto`
  - `generateToken(userId, email, tokenVersion)` - Create JWT token with JTI and version
  - `verifyToken(token)` - Verify and decode JWT
  - `getTokenFromRequest(req)` - Extract token from Authorization header
  - `generateJTI()` - Generate unique token identifier (UUID)

#### 4.4 Token Revocation Service
- [ ] Create `backend/src/services/tokenRevocationService.js`
  - `revokeAllUserTokens(userId)` - Increment token_version (bulk revocation)
  - `revokeToken(jti, userId, expiresAt, reason)` - Add token to Redis blacklist
  - `isTokenRevoked(jti, userId, tokenVersion)` - Check if token is revoked
  - `checkTokenVersion(userId, tokenVersion)` - Verify token version matches user
  - `cleanupExpiredTokens()` - Cleanup expired Redis entries (optional, TTL handles this)

#### 4.5 Redis Setup
- [ ] Set up Redis connection (local or managed service)
- [ ] Configure Redis persistence (RDB snapshots + AOF for durability)
- [ ] Create `backend/src/config/redis.js` - Redis client configuration
- [ ] Implement connection retry logic with fallback
- [ ] Add Redis health check endpoint

#### 4.6 Authentication Middleware
- [ ] Create `backend/src/middleware/auth.js`
  - `authenticateToken` - Verify JWT, check token version, check Redis blacklist
  - `optionalAuth` - Optional authentication (for public endpoints)
  - Implement fallback logic if Redis is unavailable

#### 4.7 Authentication Routes
- [ ] Create `backend/src/routes/authRoutes.js`
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user (returns JWT with JTI and version)
  - `POST /api/auth/logout` - Logout (adds token to Redis blacklist)
  - `GET /api/auth/me` - Get current user info
  - `POST /api/auth/refresh` - Refresh JWT token (optional)
  - `POST /api/auth/revoke-all` - Revoke all user tokens (increment version)

#### 4.8 Update Task Routes
- [ ] Modify all task routes to require authentication
- [ ] Filter tasks by `user_id` automatically
- [ ] Ensure users can only access their own tasks
- [ ] Update task creation to associate with current user

### Phase 2: Frontend Authentication (Week 2)

#### 4.7 Authentication Context
- [ ] Create `frontend/src/context/AuthContext.jsx`
  - `AuthProvider` - Global auth state management
  - `useAuth` hook - Access auth state and methods
  - `login(email, password)` - Login function
  - `register(email, password, name)` - Register function
  - `logout()` - Logout function
  - `getCurrentUser()` - Get current user info
  - Token storage in `localStorage`

#### 4.8 Authentication Service
- [ ] Create `frontend/src/services/authService.js`
  - API calls for register, login, logout, getCurrentUser
  - Token management (store, retrieve, remove)
  - Automatic token attachment to API requests

#### 4.9 Update API Service
- [ ] Modify `frontend/src/services/api.js`
  - Add Authorization header with JWT token
  - Handle 401 errors (unauthorized) - redirect to login
  - Token refresh logic (if implemented)

#### 4.10 Authentication UI Components
- [ ] Create `frontend/src/components/LoginForm.jsx`
  - Email and password input
  - Form validation
  - Error handling
  - Loading states

- [ ] Create `frontend/src/components/RegisterForm.jsx`
  - Email, password, confirm password, name inputs
  - Password strength indicator
  - Form validation
  - Error handling

- [ ] Create `frontend/src/components/ProtectedRoute.jsx`
  - Route wrapper that requires authentication
  - Redirect to login if not authenticated

- [ ] Create `frontend/src/components/UserProfile.jsx`
  - Display user information
  - Logout button

#### 4.11 Update App Routing
- [ ] Create `frontend/src/pages/LoginPage.jsx`
- [ ] Create `frontend/src/pages/RegisterPage.jsx`
- [ ] Update `frontend/src/App.js` with routing
  - `/login` - Login page
  - `/register` - Register page
  - `/` - Protected home page (requires auth)
- [ ] Add route protection

### Phase 3: Integration & Testing (Week 3)

#### 4.12 Backend Integration
- [ ] Update all task controllers to use authenticated user
- [ ] Test all API endpoints with authentication
- [ ] Verify user isolation (users can't see other users' tasks)
- [ ] Test error handling (invalid tokens, expired tokens)

#### 4.13 Frontend Integration
- [ ] Update TaskContext to work with authenticated user
- [ ] Ensure tasks are filtered by current user
- [ ] Test login/logout flow
- [ ] Test protected routes
- [ ] Test token persistence across page refreshes

#### 4.14 Security Testing
- [ ] Test password hashing and verification
- [ ] Test JWT token generation and validation
- [ ] Test unauthorized access attempts
- [ ] Test SQL injection prevention (already using parameterized queries)
- [ ] Test XSS prevention in user inputs

### Phase 4: Polish & Documentation (Week 4)

#### 4.15 Error Handling
- [ ] Improve error messages for authentication failures
- [ ] Handle token expiration gracefully
- [ ] Add user-friendly error messages

#### 4.16 UI/UX Improvements
- [ ] Add loading states during authentication
- [ ] Improve form validation feedback
- [ ] Add "Remember me" functionality (optional)
- [ ] Add password visibility toggle

#### 4.17 Documentation
- [ ] Update API documentation with auth endpoints
- [ ] Update README with authentication setup
- [ ] Document environment variables for JWT secret
- [ ] Update BLUEPRINT.md with auth architecture
- [ ] Create migration guide for existing users

## 5. API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No (client-side) |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/refresh` | Refresh JWT token | Yes |

### Updated Task Endpoints

All task endpoints now require authentication and filter by `user_id`:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get current user's tasks | Yes |
| GET | `/api/tasks/:id` | Get task by ID (user's own) | Yes |
| POST | `/api/tasks` | Create task (for current user) | Yes |
| PUT | `/api/tasks/:id` | Update task (user's own) | Yes |
| DELETE | `/api/tasks/:id` | Delete task (user's own) | Yes |

## 6. Database Migration Script

```sql
-- Migration: Add User Authentication
-- File: database/migrations/001_add_user_authentication.sql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add user_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Add foreign key constraint (after data migration)
-- ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user_id 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update existing tasks (assign to guest user or handle as needed)
-- This should be done carefully based on business requirements
```

## 7. Environment Variables

### Backend (.env)
```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Password Configuration
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBER=true
```

## 8. Security Considerations

### Password Security
- ✅ Passwords are hashed using `pbkdf2` or `scrypt` (native Node.js crypto)
- ✅ Each password has unique salt
- ✅ Minimum password requirements enforced
- ✅ Passwords never stored in plain text
- ✅ Passwords never logged

### Token Security
- ✅ JWT secret stored in environment variables
- ✅ Tokens expire after configured time
- ✅ Tokens include user ID and email (no sensitive data)
- ✅ HTTPS required in production
- ⚠️ Consider httpOnly cookies instead of localStorage (more secure)

### API Security
- ✅ All task endpoints require authentication
- ✅ Users can only access their own tasks
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation on all endpoints
- ✅ CORS configured properly

## 9. Testing Strategy

### Unit Tests
- [ ] Test password hashing and verification
- [ ] Test JWT token generation and verification
- [ ] Test authentication service methods
- [ ] Test user registration validation

### Integration Tests
- [ ] Test complete registration flow
- [ ] Test complete login flow
- [ ] Test protected route access
- [ ] Test user task isolation
- [ ] Test token expiration handling

### Manual Testing Checklist
- [ ] Register new user successfully
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (error handling)
- [ ] Access protected routes without auth (redirect to login)
- [ ] Create task (automatically associated with user)
- [ ] View only own tasks
- [ ] Cannot access other users' tasks
- [ ] Logout clears session
- [ ] Token persists across page refresh
- [ ] Token expiration handled gracefully

## 10. Dependencies

### Backend
- **New dependency required**:
  - `redis` or `ioredis` - Redis client for token blacklist (recommended: `ioredis` for better features)
- **Native Node.js modules**:
  - `crypto` - Password hashing and JWT signing
  - `fs` - Already used for env loading
- **Existing dependencies**:
  - `express` - Already installed
  - `pg` - Already installed (PostgreSQL client)

**Redis Options:**
- **Local Redis**: Docker container for development
- **Managed Redis**: Redis Cloud, AWS ElastiCache, Railway Redis, Upstash (production)
- **Fallback**: System gracefully degrades to token versioning only if Redis unavailable

### Frontend
- **New dependency required**:
  - `react-router-dom` - Required for protected routes and navigation (v6.x recommended)
- **Existing dependencies**:
  - `react` - Already installed
  - Native `fetch` - Already using

## 11. Redis Configuration

### Redis Persistence Setup

**For Production (Recommended):**
```conf
# redis.conf
save 900 1          # Save if at least 1 key changed in 900 seconds
save 300 10         # Save if at least 10 keys changed in 300 seconds
save 60 10000       # Save if at least 10000 keys changed in 60 seconds

appendonly yes      # Enable AOF (Append Only File)
appendfsync everysec # Sync AOF every second (good balance)
```

**For Development (Docker):**
```yaml
# docker-compose.yml addition
redis:
  image: redis:7-alpine
  container_name: task-manager-redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes --appendfsync everysec
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5

volumes:
  redis_data:
```

### Redis Key Structure

**Token Blacklist Keys:**
```
Format: revoked_token:{jti}
Value: JSON string with {userId, expiresAt, reason, revokedAt}
TTL: Set to match token expiration time
```

**Example:**
```javascript
// Store revoked token
await redis.setex(
  `revoked_token:${jti}`,
  tokenExpirationSeconds,
  JSON.stringify({
    userId: 123,
    expiresAt: '2025-01-15T10:00:00Z',
    reason: 'logout',
    revokedAt: '2025-01-15T09:00:00Z'
  })
);

// Check if revoked
const revoked = await redis.exists(`revoked_token:${jti}`);
```

### Redis Connection Configuration

```javascript
// backend/src/config/redis.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Exponential backoff with max delay
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false, // Don't queue commands if disconnected
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  // System continues with token versioning fallback
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

module.exports = redis;
```

### Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, for production
REDIS_ENABLED=true  # Set to false to disable Redis (use versioning only)

# Token Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m  # Short-lived access tokens
JWT_REFRESH_EXPIRES_IN=7d  # Longer-lived refresh tokens
```

## 12. Breaking Changes

### Migration Impact
- **Existing Tasks**: Need to handle existing tasks without `user_id`
  - Option 1: Create a default "guest" user and assign all existing tasks
  - Option 2: Mark existing tasks as orphaned and require user registration
  - Option 3: Delete existing tasks (if acceptable for MVP)

### API Changes
- All task endpoints now require `Authorization: Bearer <token>` header
- Task responses now automatically filtered by user
- `/api/auth/*` endpoints added

### Frontend Changes
- All API calls must include authentication token
- Routes must be protected
- Login/Register pages required

## 13. Rollout Strategy

### Phase 1: Development
1. Implement backend authentication
2. Test with Postman/curl
3. Implement frontend authentication
4. Test complete flow

### Phase 2: Staging
1. Deploy to staging environment
2. Test with multiple users
3. Verify user isolation
4. Performance testing

### Phase 3: Production
1. Backup existing database
2. Run migration script
3. Deploy backend with authentication
4. Deploy frontend with authentication
5. Monitor for issues
6. Provide user communication (if existing users exist)

## 14. Token Revocation Implementation Details

### Token Validation Flow

```javascript
// backend/src/middleware/auth.js (simplified)
async function authenticateToken(req, res, next) {
  try {
    // 1. Extract token from request
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. Verify JWT signature and expiration
    const decoded = verifyToken(token);
    
    // 3. Check token version (fast database lookup)
    const user = await getUserById(decoded.userId);
    if (decoded.version !== user.token_version) {
      return res.status(401).json({ error: 'Token revoked - version mismatch' });
    }

    // 4. Check Redis blacklist (if Redis enabled)
    if (process.env.REDIS_ENABLED === 'true') {
      try {
        const isBlacklisted = await redis.exists(`revoked_token:${decoded.jti}`);
        if (isBlacklisted) {
          return res.status(401).json({ error: 'Token revoked - in blacklist' });
        }
      } catch (redisError) {
        // Redis unavailable - log error but continue (graceful degradation)
        console.warn('Redis check failed, using version check only:', redisError);
        // Continue with token version check only
      }
    }

    // 5. Token is valid - attach user to request
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### Logout Implementation

```javascript
// backend/src/controllers/authController.js
async function logout(req, res) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token); // Verify before revoking
    
    // Add to Redis blacklist (if enabled)
    if (process.env.REDIS_ENABLED === 'true') {
      try {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await tokenRevocationService.revokeToken(
            decoded.jti,
            decoded.userId,
            new Date(decoded.exp * 1000),
            'logout'
          );
        }
      } catch (redisError) {
        console.error('Failed to blacklist token in Redis:', redisError);
        // Continue - token will expire naturally
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Password Change Implementation

```javascript
// backend/src/controllers/authController.js
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 1. Verify current password
    const user = await getUserById(userId);
    const isValid = await validatePassword(currentPassword, user.password_hash, user.password_salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 2. Hash new password
    const salt = generateSalt();
    const newPasswordHash = await hashPassword(newPassword, salt);

    // 3. Update password and increment token version (revokes all tokens)
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, password_salt = $2, token_version = token_version + 1 
       WHERE id = $3`,
      [newPasswordHash, salt, userId]
    );

    // 4. Optionally clear user's Redis entries (if using Redis)
    if (process.env.REDIS_ENABLED === 'true') {
      try {
        // Pattern match to find all user's tokens
        const keys = await redis.keys(`revoked_token:*`);
        // Note: In production, use SCAN instead of KEYS for better performance
        // This is simplified for example
      } catch (redisError) {
        console.warn('Failed to clear Redis entries:', redisError);
      }
    }

    res.json({ success: true, message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
}
```

### Performance Considerations

**Token Version Check:**
- Single database query: `SELECT token_version FROM users WHERE id = $1`
- Indexed lookup: ~2-5ms
- Used for every authenticated request

**Redis Blacklist Check:**
- Single Redis lookup: `EXISTS revoked_token:{jti}`
- In-memory operation: ~0.1-1ms
- Used for every authenticated request (if Redis enabled)

**Combined Performance:**
- Total validation time: ~2-6ms (excellent for production)
- Scales to thousands of requests per second
- Redis provides 10-50x speedup over database-only approach

### Monitoring & Observability

**Key Metrics to Track:**
- Redis connection status and latency
- Token validation success/failure rates
- Token revocation counts (by reason: logout, password_change, etc.)
- Fallback to version-only validation frequency
- Redis memory usage for blacklist

**Health Check Endpoint:**
```javascript
// GET /api/health/auth
{
  "redis": {
    "status": "connected",
    "latency": "0.5ms",
    "blacklist_size": 1234
  },
  "token_versioning": {
    "enabled": true
  },
  "fallback_mode": false
}
```

## 15. Future Enhancements

After initial implementation:
- Password reset functionality
- Email verification
- OAuth integration (Google, GitHub)
- Two-factor authentication (2FA)
- Session management (view active sessions)
- Account deletion
- User profile editing
- Password change functionality

## 16. Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1: Backend** | 1 week | Database, Auth Service, JWT, Routes, Middleware |
| **Phase 2: Frontend** | 1 week | Auth Context, UI Components, Routing, Integration |
| **Phase 3: Testing** | 1 week | Unit tests, Integration tests, Security testing |
| **Phase 4: Polish** | 1 week | Error handling, UI/UX, Documentation |
| **Total** | **3-4 weeks** | Complete authentication system |

## 17. Risk Assessment

### Technical Risks
- **JWT Implementation Complexity**: Mitigated by using well-documented native crypto module
- **Password Security**: Using industry-standard hashing (pbkdf2/scrypt)
- **Token Storage**: localStorage is vulnerable to XSS, consider httpOnly cookies
- **Migration Complexity**: Existing tasks need user assignment strategy
- **Redis Dependency**: Mitigated by graceful fallback to token versioning only
- **Redis Persistence**: Ensure RDB + AOF configured for data durability
- **Redis Scalability**: Monitor memory usage; implement key expiration cleanup

### Product Risks
- **User Adoption**: Users may resist creating accounts
- **Password Management**: Users may forget passwords (need reset functionality)
- **Breaking Changes**: Existing single-user mode will be replaced

### Mitigation Strategies
- Thorough testing before rollout
- Clear migration path for existing data
- User-friendly registration/login flow
- Consider "guest mode" as fallback (optional)

---

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Status**: 📋 Planning Phase  
**Next Steps**: Review plan, get approval, begin Phase 1 implementation


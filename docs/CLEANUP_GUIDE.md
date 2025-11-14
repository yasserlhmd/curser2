# Cleanup Guide

## Legacy Files to Remove

This document lists legacy files from the old Express.js/React implementation that can be safely removed.

### Backend Legacy Files (Express.js)

These files are from the old Express.js implementation and are **NOT USED** by NestJS:

```
backend/src/
├── app.js                      ❌ Old Express app
├── server.js                   ❌ Old Express server
├── routes/                     ❌ Old Express routes
│   ├── authRoutes.js
│   └── taskRoutes.js
├── controllers/                ❌ Old Express controllers
│   ├── authController.js
│   └── taskController.js
├── services/                   ❌ Old Express services
│   ├── authService.js
│   ├── taskService.js
│   └── tokenRevocationService.js
├── middleware/                 ❌ Old Express middleware
│   ├── auth.js
│   └── cors.js
├── config/                     ⚠️ Some files may be legacy
│   ├── env.js                  ❌ (if not used)
│   ├── database.js             ❌ (if not used)
│   └── redis.js                ❌ (if not used)
├── constants/                  ⚠️ Check if used
│   ├── errorCodes.js
│   └── taskConstants.js
└── utils/                      ⚠️ Check if used
    ├── jwt.js                  ❌ (NestJS uses @nestjs/jwt)
    └── responseHelpers.js      ❌ (NestJS uses interceptors)
```

**Note**: Before removing, verify they're not imported anywhere in the NestJS codebase.

### Frontend Legacy Files (Create React App)

These files are from the old CRA implementation:

```
frontend/src/                   ❌ Entire directory (old CRA structure)
├── App.js
├── App.css
├── index.js
├── index.css
├── components/                 ❌ Old components
├── pages/                      ❌ Old pages
├── services/                   ❌ Old services
├── context/                   ❌ Old context (if duplicated)
└── utils/                      ❌ Old utils (if duplicated)
```

**Note**: The new Next.js structure is in `frontend/app/`, `frontend/components/`, etc.

---

## Cleanup Commands

### Backend
```bash
cd backend/src
# Remove old Express.js files
rm -rf routes/ controllers/ services/ middleware/
rm app.js server.js
# Check and remove unused config/utils if not needed
```

### Frontend
```bash
cd frontend
# Remove old CRA structure (after verifying new structure works)
rm -rf src/
```

---

## Verification

Before removing files:

1. **Check imports**: Search for imports of these files
2. **Test application**: Ensure everything still works
3. **Build check**: Run `npm run build` in both frontend and backend
4. **Git commit**: Commit current state before cleanup

---

**Status**: Ready for cleanup  
**Risk**: Low (files are not used by current implementation)


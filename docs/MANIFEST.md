# Deployment Manifest

## 1. Environments

| Name | URL | Description |
|------|-----|-------------|
| **Development** | localhost:3000 (frontend), localhost:5000 (backend) | Local testing |
| **Staging** | staging.task-manager.app | Pre-production |
| **Production** | task-manager.app | Live users |

## 2. Environment Variables

| Key | Example Value | Purpose |
|-----|---------------|---------|
| **Frontend** |
| `REACT_APP_API_URL` | `https://api.task-manager.app` | Main API endpoint |
| `REACT_APP_ENV` | `production` | Environment identifier |
| **Backend** |
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `5000` | Server port |
| `DATABASE_URL` | `postgres://user:pass@host:5432/dbname` | Main DB connection |
| `DB_HOST` | `prod-db.railway.app` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `taskmanager_prod` | Database name |
| `DB_USER` | `prod_user` | Database user |
| `DB_PASSWORD` | `<password>` | Database password |
| `DB_SSL` | `true` | SSL connection |
| `CORS_ORIGIN` | `https://task-manager.app` | Allowed frontend origin |
| `LOG_LEVEL` | `error` | Logging level |

## 3. Build & Deployment Steps

### Frontend
- `npm run build` - Build React app for production
- Output: `frontend/build/` directory
- Deploy: Vercel/Netlify (automatic on push to main)

### Backend
- `npm install --production` - Install production dependencies
- `npm start` - Start Express server
- Deploy: Railway/Render (automatic on push to main)

### CI/CD: GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      # Deploy commands
```

## 4. Rollback Plan

Steps to revert to the last stable release:

### Frontend Rollback
1. **Vercel**: Go to Deployments → Select previous deployment → Promote to Production
2. **Manual**: Revert commit, rebuild, redeploy
   ```bash
   git revert HEAD
   git push origin main
   npm run build
   vercel deploy --prod
   ```

### Backend Rollback
1. **Railway**: Go to Deployments → Select previous deployment → Redeploy
2. **Manual**: Revert commit, redeploy
   ```bash
   git revert HEAD
   git push origin main
   railway up
   ```

### Database Rollback
1. **Migration Rollback**: Run rollback SQL script
   ```bash
   psql -h <db-host> -U <db-user> -d <db-name> -f rollback.sql
   ```
2. **Data Restore**: Restore from backup
   ```bash
   pg_restore -h <db-host> -U <db-user> -d <db-name> backup.dump
   ```

## 5. Monitoring & Logs

### Logging
- **Tool**: Console logging (backend), Browser console (frontend)
- **Levels**: `debug` (dev), `error` (production)

### Monitoring (MVP)
- **Backend**: Railway/Render built-in metrics
- **Frontend**: Vercel/Netlify built-in analytics
- **Health Check**: `/api/health` endpoint

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-12


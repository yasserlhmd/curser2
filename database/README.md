# Database Setup

## Quick Start

### 1. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 2. Run Database Schema

**Option A: Using setup script (recommended)**
```bash
# Git Bash
bash setup.sh

# PowerShell
.\setup.ps1
```

**Option B: Using Docker exec directly**
```bash
# Git Bash / PowerShell
docker exec -i task-manager-db psql -U postgres -d taskmanager_dev < schema.sql
```

### 3. Verify Database
```bash
# Connect to database using Docker
docker exec -it task-manager-db psql -U postgres -d taskmanager_dev

# Inside psql, run:
\dt              # List all tables
\d tasks         # Show tasks table structure
SELECT * FROM tasks;  # View tasks (if any)
\q              # Exit psql
```

## Database Credentials

- **Host**: localhost
- **Port**: 5432
- **Database**: taskmanager_dev
- **User**: postgres
- **Password**: postgres

## Stop Database

```bash
docker-compose down
```

## Reset Database

```bash
docker-compose down -v  # Removes volumes
docker-compose up -d    # Starts fresh
```


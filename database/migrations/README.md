# Database Migrations

## Running Migrations

### Migration 001: Add User Authentication

This migration adds user authentication support:
- Creates `users` table with authentication fields
- Adds `user_id` column to `tasks` table
- Adds `token_version` for token revocation

**To run the migration:**

```bash
# Using Docker (recommended)
docker exec -i task-manager-db psql -U postgres -d taskmanager_dev < migrations/001_add_user_authentication.sql

# Or using setup script
cd database
# Git Bash
bash setup.sh

# PowerShell
.\setup.ps1
```

**Important Notes:**
- The foreign key constraint is commented out initially
- After running the migration, you may need to handle existing tasks:
  - Option 1: Assign existing tasks to a default user
  - Option 2: Delete existing tasks (if acceptable)
  - Option 3: Mark as orphaned and require user registration

**To enable foreign key constraint:**
```sql
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```


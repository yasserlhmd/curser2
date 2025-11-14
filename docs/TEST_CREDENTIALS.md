# Test Credentials

This file contains test user credentials for development and testing purposes.

## Mock Users

The following users have been created in the database for testing:

| Email | Password | Name |
|-------|----------|------|
| john@example.com | Test1234 | John Doe |
| jane@example.com | Test1234 | Jane Smith |
| admin@example.com | Admin123 | Admin User |
| alice@example.com | User1234 | Alice Johnson |
| bob@example.com | User1234 | Bob Williams |

## Password Requirements

All passwords meet the following criteria:
- ✅ At least 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number

## Creating Mock Users

To recreate these users, run:

```bash
cd backend
node scripts/createMockUsers.js
```

The script will:
- Check if users already exist (skips if they do)
- Create users with properly hashed passwords
- Display all created credentials

## Notes

- These are test credentials only - **DO NOT use in production**
- All users have the same password format for easy testing
- Users are created with `token_version = 1` by default
- The script uses the same password hashing method as the production code

## Database Status

- **Tasks**: All existing tasks have been deleted
- **Users**: 6 total users (1 existing + 5 mock users)


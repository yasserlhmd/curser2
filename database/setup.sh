#!/bin/bash

# Database Setup Script
# This script sets up the database schema using Docker

echo "Setting up Task Manager database..."

# Check if container is running
if ! docker ps | grep -q task-manager-db; then
    echo "Error: Database container is not running. Please run 'docker-compose up -d' first."
    exit 1
fi

# Run schema.sql
echo "Running schema.sql..."
docker exec -i task-manager-db psql -U postgres -d taskmanager_dev < schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully!"
    echo ""
    echo "You can now verify by running:"
    echo "  docker exec -it task-manager-db psql -U postgres -d taskmanager_dev"
    echo "  \\dt  (to list tables)"
    echo "  \\d tasks  (to see tasks table structure)"
else
    echo "❌ Error creating database schema"
    exit 1
fi


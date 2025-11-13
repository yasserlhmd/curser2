# Database Setup Script for PowerShell
# This script sets up the database schema using Docker

Write-Host "Setting up Task Manager database..." -ForegroundColor Cyan

# Check if container is running
$containerRunning = docker ps --filter "name=task-manager-db" --format "{{.Names}}"
if (-not $containerRunning) {
    Write-Host "Error: Database container is not running. Please run 'docker-compose up -d' first." -ForegroundColor Red
    exit 1
}

# Run schema.sql
Write-Host "Running schema.sql..." -ForegroundColor Yellow
Get-Content schema.sql | docker exec -i task-manager-db psql -U postgres -d taskmanager_dev

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now verify by running:" -ForegroundColor Cyan
    Write-Host "  docker exec -it task-manager-db psql -U postgres -d taskmanager_dev"
    Write-Host "  \dt  (to list tables)"
    Write-Host "  \d tasks  (to see tasks table structure)"
} else {
    Write-Host "❌ Error creating database schema" -ForegroundColor Red
    exit 1
}


/**
 * Task Routes
 * Defines HTTP endpoints for task management
 * Public read access, authenticated write access
 */
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// ==================== Public Routes (Read-Only) ====================
// GET /api/tasks - Get all tasks with optional filters (public access)
router.get('/', optionalAuth, taskController.getAllTasks);

// GET /api/tasks/:id - Get task by ID (public access)
router.get('/:id', optionalAuth, taskController.getTaskById);

// ==================== Protected Routes (Authentication Required) ====================
// POST /api/tasks - Create new task
router.post('/', authenticateToken, taskController.createTask);

// PUT /api/tasks/:id - Update task (owner only)
router.put('/:id', authenticateToken, taskController.updateTask);

// DELETE /api/tasks/:id - Delete task (owner only)
router.delete('/:id', authenticateToken, taskController.deleteTask);

module.exports = router;


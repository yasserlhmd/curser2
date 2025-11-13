const taskService = require('../services/taskService');

/**
 * Get all tasks (with optional status filter)
 * GET /api/tasks?status=pending
 */
const getAllTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const tasks = await taskService.getAllTasks(status);

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error in getAllTasks controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch tasks',
        details: error.message
      }
    });
  }
};

/**
 * Get task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID'
        }
      });
    }

    const task = await taskService.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error in getTaskById controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch task',
        details: error.message
      }
    });
  }
};

/**
 * Create new task
 * POST /api/tasks
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Basic validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Title is required'
        }
      });
    }

    const task = await taskService.createTask({ title, description, status });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error in createTask controller:', error);
    
    const statusCode = error.message.includes('Invalid status') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to create task',
        details: error.message
      }
    });
  }
};

/**
 * Update task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID'
        }
      });
    }

    const task = await taskService.updateTask(taskId, req.body);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error in updateTask controller:', error);
    
    const statusCode = error.message.includes('Invalid status') || 
                      error.message.includes('cannot be empty') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to update task',
        details: error.message
      }
    });
  }
};

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid task ID'
        }
      });
    }

    const task = await taskService.deleteTask(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTask controller:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete task',
        details: error.message
      }
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};


const { pool } = require('../config/database');

// Valid status values
const VALID_STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * Get all tasks with optional status filter
 */
const getAllTasks = async (status = null) => {
  try {
    let query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    let params = [];

    if (status && VALID_STATUSES.includes(status)) {
      query = 'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC';
      params = [status];
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

/**
 * Get task by ID
 */
const getTaskById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting task by ID:', error);
    throw error;
  }
};

/**
 * Create new task
 */
const createTask = async (taskData) => {
  try {
    const { title, description, status } = taskData;

    // Validate required fields
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const finalStatus = status || 'pending';
    const query = `
      INSERT INTO tasks (title, description, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const params = [title.trim(), description?.trim() || null, finalStatus];

    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update task
 */
const updateTask = async (id, taskData) => {
  try {
    // Check if task exists
    const existingTask = await getTaskById(id);
    if (!existingTask) {
      return null;
    }

    const { title, description, status } = taskData;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      if (title.trim() === '') {
        throw new Error('Title cannot be empty');
      }
      updates.push(`title = $${paramIndex}`);
      params.push(title.trim());
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description?.trim() || null);
      paramIndex++;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
      }
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return existingTask; // No updates provided
    }

    params.push(id);
    const query = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete task
 */
const deleteTask = async (id) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};


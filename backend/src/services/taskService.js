/**
 * Task Service
 * Business logic for task management operations
 * Handles all database interactions related to tasks
 */
const { pool } = require('../config/database');
const { VALID_STATUSES, DEFAULT_STATUS } = require('../constants/taskConstants');

/**
 * Helper function to transform database row to task object with user info
 * @param {Object} row - Database row from query
 * @returns {Object} Task object with user information
 */
const transformTaskRow = (row) => {
  // Check if user exists - joined_user_id will be null if LEFT JOIN finds no match
  const hasUser = row.joined_user_id != null && String(row.joined_user_id).trim() !== '';
  
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_id: row.user_id,
    user: hasUser ? {
      id: row.joined_user_id,
      email: row.user_email || null,
      name: row.user_name || null,
    } : null,
  };
};

/**
 * Helper function to build task query with filters
 * @param {Object} options - Query options
 * @param {number|null} options.filterUserId - User ID to filter by (null for all users)
 * @param {string|null} options.status - Status filter
 * @returns {Object} { query: string, params: Array }
 */
const buildTaskQuery = ({ filterUserId = null, status = null }) => {
  const baseQuery = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.status,
      t.created_at,
      t.updated_at,
      t.user_id,
      u.id as joined_user_id,
      u.email as user_email,
      u.name as user_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.id
  `;
  
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Filter by user if specified
  if (filterUserId !== null && filterUserId !== undefined) {
    conditions.push(`t.user_id = $${paramIndex}`);
    params.push(filterUserId);
    paramIndex++;
  }

  // Filter by status if specified
  if (status && VALID_STATUSES.includes(status)) {
    conditions.push(`t.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  let query = baseQuery;
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY t.created_at DESC';

  return { query, params };
};

/**
 * Get all tasks with optional filters
 * @param {number|null} userId - User ID for access control (not used for filtering)
 * @param {string|null} status - Optional status filter (pending, in-progress, completed)
 * @param {number|null} filterUserId - Optional user ID to filter by (null for all users)
 * @returns {Promise<Array>} Array of task objects with user information
 * @throws {Error} If database query fails
 */
const getAllTasks = async (userId, status = null, filterUserId = null) => {
  try {
    const { query, params } = buildTaskQuery({ filterUserId, status });
    const result = await pool.query(query, params);
    
    return result.rows.map(transformTaskRow);
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

/**
 * Get task by ID
 * @param {number} id - Task ID
 * @param {number|null} userId - User ID for access control (null allows public access)
 * @returns {Promise<Object|null>} Task object with user information, or null if not found
 * @throws {Error} If database query fails
 */
const getTaskById = async (id, userId) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.created_at,
        t.updated_at,
        t.user_id,
        u.id as joined_user_id,
        u.email as user_email,
        u.name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return transformTaskRow(result.rows[0]);
  } catch (error) {
    console.error('Error getting task by ID:', error);
    throw error;
  }
};

/**
 * Create new task
 * @param {Object} taskData - Task data { title, description?, status? }
 * @param {number} userId - User ID (required)
 * @returns {Promise<Object>} Created task object with user information
 * @throws {Error} If validation fails or database operation fails
 */
const createTask = async (taskData, userId) => {
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

    const finalStatus = status || DEFAULT_STATUS;
    
    // Insert task and get user info in a single query using JOIN
    const query = `
      INSERT INTO tasks (title, description, status, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        t.id,
        t.title,
        t.description,
        t.status,
        t.created_at,
        t.updated_at,
        t.user_id,
        u.id as joined_user_id,
        u.email as user_email,
        u.name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = (SELECT id FROM tasks WHERE id = t.id)
    `;
    
    // Simplified approach: Insert then fetch with user info
    const insertQuery = `
      INSERT INTO tasks (title, description, status, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const insertParams = [title.trim(), description?.trim() || null, finalStatus, userId];
    const insertResult = await pool.query(insertQuery, insertParams);
    const task = insertResult.rows[0];
    
    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [userId]
    );
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      created_at: task.created_at,
      updated_at: task.updated_at,
      user_id: task.user_id,
      user: userResult.rows[0] ? {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        name: userResult.rows[0].name,
      } : null,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update task
 * @param {number} id - Task ID
 * @param {Object} taskData - Task data to update { title?, description?, status? }
 * @param {number} userId - User ID (required for authorization)
 * @returns {Promise<Object|null>} Updated task object with user information, or null if not found
 * @throws {Error} If validation fails or database operation fails
 */
const updateTask = async (id, taskData, userId) => {
  try {
    // Check if task exists and belongs to user
    const existingTask = await getTaskById(id, userId);
    if (!existingTask) {
      return null;
    }

    const { title, description, status } = taskData;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    // Build dynamic update query
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

    // If no updates provided, return existing task
    if (updates.length === 0) {
      return existingTask;
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause parameters
    params.push(id, userId);
    const query = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return null;
    }
    
    const task = result.rows[0];
    
    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [userId]
    );
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      created_at: task.created_at,
      updated_at: task.updated_at,
      user_id: task.user_id,
      user: userResult.rows[0] ? {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        name: userResult.rows[0].name,
      } : null,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete task
 * @param {number} id - Task ID
 * @param {number} userId - User ID (required for authorization)
 * @returns {Promise<Object|null>} Deleted task object, or null if not found
 * @throws {Error} If database operation fails
 */
const deleteTask = async (id, userId) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
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


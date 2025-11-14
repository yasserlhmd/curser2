/**
 * TaskItem Component
 * Displays a single task with its details, actions, and metadata
 * Supports read-only mode for guests and edit/delete for task owners
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS, TASK_STATUSES, STATUS_LABELS } from '../constants/taskConstants';
import { formatTaskDate } from '../utils/dateUtils';
import Button from './Button';
import TaskForm from './TaskForm';
import './TaskItem.css';

const TaskItem = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if current user owns this task
  const isOwner = isAuthenticated && currentUser && task.user_id === currentUser.id;
  const canEdit = isAuthenticated && isOwner;

  const handleStatusChange = async (newStatus) => {
    setError(null);
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task status. Please try again.';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setError(null);
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete task. Please try again.';
        setError(errorMessage);
        setIsDeleting(false);
      }
    }
  };

  /**
   * Get status color for badge
   * @param {string} status - Task status
   * @returns {string} Hex color code
   */
  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };

  if (isEditing) {
    return (
      <div className="task-item task-item-editing">
        <TaskForm task={task} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }


  return (
    <div className="task-item">
      {error && (
        <div className="task-error" style={{ 
          padding: '8px', 
          marginBottom: '8px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <span
          className="task-status-badge"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {canEdit && (
        <div className="task-actions">
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {TASK_STATUSES.map(status => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            className="btn-small"
          >
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-small"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}
      
      {!isAuthenticated && (
        <div className="task-readonly-notice">
          <p>Read-only mode. <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login</Link> to edit or delete tasks.</p>
        </div>
      )}
      
      {isAuthenticated && !isOwner && (
        <div className="task-readonly-notice">
          <p>You can only edit or delete your own tasks.</p>
        </div>
      )}

      <div className="task-meta">
        <div className="task-user-info">
          <span className="user-label">Owner:</span>
          <span className="user-name">
            {task.user?.name || task.user?.email || 'Unassigned'}
          </span>
        </div>
        <div className="task-dates">
          <span className="task-date">
            Created: {formatTaskDate(task.created_at)}
          </span>
          {task.updated_at && task.updated_at !== task.created_at && (
            <span className="task-date">
              Updated: {formatTaskDate(task.updated_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;


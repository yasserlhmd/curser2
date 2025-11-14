'use client';

/**
 * TaskItem Component
 * Displays a single task with its details, actions, and metadata
 * Supports read-only mode for guests and edit/delete for task owners
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { STATUS_COLORS, TASK_STATUSES, STATUS_LABELS } from '../../lib/constants/taskConstants';
import { formatTaskDate } from '../../lib/utils/dateUtils';
import Button from '../ui/Button';
import TaskForm from './TaskForm';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: any;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user owns this task
  // Handle both userId (from API) and user_id (from database)
  const taskUserId = task.userId || task.user_id;
  const isOwner = isAuthenticated && currentUser && taskUserId === currentUser.id;
  const canEdit = isAuthenticated && isOwner;

  const handleStatusChange = async (newStatus: string) => {
    setError(null);
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update task status. Please try again.';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this task?')) {
      setError(null);
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to delete task. Please try again.';
        setError(errorMessage);
        setIsDeleting(false);
      }
    }
  };

  /**
   * Get status color for badge
   */
  const getStatusColor = (status: string): string => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };

  if (isEditing) {
    return (
      <div className={`${styles['task-item']} ${styles['task-item-editing']}`}>
        <TaskForm task={task} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className={styles['task-item']}>
      {error && (
        <div
          className={styles['task-error']}
          style={{
            padding: '8px',
            marginBottom: '8px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}
      <div className={styles['task-header']}>
        <h4 className={styles['task-title']}>{task.title}</h4>
        <span
          className={styles['task-status-badge']}
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status}
        </span>
      </div>

      {task.description && <p className={styles['task-description']}>{task.description}</p>}

      {canEdit && (
        <div className={styles['task-actions']}>
          <select
            className={styles['status-select']}
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <Button variant="secondary" onClick={() => setIsEditing(true)} className={styles['btn-small']}>
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            className={styles['btn-small']}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}

      {!isAuthenticated && (
        <div className={styles['task-readonly-notice']}>
          <p>
            Read-only mode.{' '}
            <Link href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Login
            </Link>{' '}
            to edit or delete tasks.
          </p>
        </div>
      )}

      {isAuthenticated && !isOwner && (
        <div className={styles['task-readonly-notice']}>
          <p>You can only edit or delete your own tasks.</p>
        </div>
      )}

      <div className={styles['task-meta']}>
        <div className={styles['task-user-info']}>
          <span className={styles['user-label']}>Owner:</span>
          <span className={styles['user-name']}>
            {task.user?.name || task.user?.email || 'Unassigned'}
          </span>
        </div>
        <div className={styles['task-dates']}>
          <span className={styles['task-date']}>Created: {formatTaskDate(task.createdAt)}</span>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <span className={styles['task-date']}>Updated: {formatTaskDate(task.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;


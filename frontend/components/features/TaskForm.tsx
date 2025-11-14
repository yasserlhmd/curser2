'use client';

/**
 * TaskForm Component
 * Form for creating and editing tasks
 * Shows guest message when user is not authenticated
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TASK_STATUSES, STATUS_LABELS, DEFAULT_STATUS } from '../../lib/constants/taskConstants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  task?: any | null;
  onCancel?: (() => void) | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ task = null, onCancel = null }) => {
  const { createTask, updateTask } = useTasks();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || DEFAULT_STATUS,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!task;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate title
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
        // Reset form after successful creation
        setFormData({
          title: '',
          description: '',
          status: 'pending',
        });
      }
      if (onCancel) {
        onCancel();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show form for guests (read-only access)
  if (!isAuthenticated) {
    return (
      <div className={`${styles['task-form']} ${styles['task-form-guest']}`}>
        <h3>Create New Task</h3>
        <div className={styles['guest-message']}>
          <p>You must be logged in to create tasks.</p>
          <div className={styles['guest-actions']}>
            <Link href="/login" className={styles['guest-link']}>
              Login
            </Link>
            <span>or</span>
            <Link href="/register" className={styles['guest-link']}>
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={styles['task-form']} onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Task' : 'Create New Task'}</h3>

      {error && <div className={styles['form-error']}>{error}</div>}

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter task title"
        required
        error={error && !formData.title ? 'Title is required' : ''}
      />

      <div className={styles['input-group']}>
        <label className={styles['input-label']}>Description</label>
        <textarea
          className={styles.input}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>

      <div className={styles['input-group']}>
        <label className={styles['input-label']}>Status</label>
        <select
          className={styles.input}
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['form-actions']}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;


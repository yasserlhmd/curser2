import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import Button from './Button';
import Input from './Input';
import './TaskForm.css';

const TaskForm = ({ task = null, onCancel = null }) => {
  const { createTask, updateTask } = useTasks();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!task;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Task' : 'Create New Task'}</h3>
      
      {error && <div className="form-error">{error}</div>}

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter task title"
        required
        error={error && !formData.title ? 'Title is required' : ''}
      />

      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea
          className="input"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description (optional)"
          rows="3"
        />
      </div>

      <div className="input-group">
        <label className="input-label">Status</label>
        <select
          className="input"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="form-actions">
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


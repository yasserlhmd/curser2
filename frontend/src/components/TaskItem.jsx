import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import Button from './Button';
import TaskForm from './TaskForm';
import './TaskItem.css';

const TaskItem = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'in-progress':
        return '#007bff';
      case 'completed':
        return '#28a745';
      default:
        return '#6c757d';
    }
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

      <div className="task-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
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

      <div className="task-meta">
        <span className="task-date">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </span>
        {task.updated_at !== task.created_at && (
          <span className="task-date">
            Updated: {new Date(task.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskItem;


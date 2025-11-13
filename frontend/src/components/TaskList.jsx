import React from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = () => {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return (
      <div className="task-list-loading">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks found. Create your first task above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;


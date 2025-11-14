'use client';

/**
 * TaskList Component
 * Displays a list of tasks with loading and error states
 * Renders TaskItem components for each task
 */
import React from 'react';
import { useTasks } from '../../context/TaskContext';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

const TaskList: React.FC = () => {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return (
      <div className={styles['task-list-loading']}>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['task-list-error']}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles['task-list-empty']}>
        <p>No tasks found. Create your first task above!</p>
      </div>
    );
  }

  return (
    <div className={styles['task-list']}>
      {tasks.map((task: any) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;


'use client';

/**
 * HomePage Component
 * Main page displaying task management interface
 * Public access - guests can view tasks, authenticated users can manage their own
 */
import React from 'react';
import { TaskProvider } from '../context/TaskContext';
import TaskFilter from '../components/features/TaskFilter';
import TaskForm from '../components/features/TaskForm';
import TaskList from '../components/features/TaskList';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <TaskProvider>
      <div className={styles['home-page']}>
        <header className={styles['page-header']}>
          <div className={styles['header-content']}>
            <h1>Task Manager</h1>
            <p>Organize and track your tasks efficiently</p>
          </div>
        </header>

        <div className={styles['page-content']}>
          <TaskFilter />
          <TaskForm />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}


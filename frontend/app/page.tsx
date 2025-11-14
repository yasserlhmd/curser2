/**
 * HomePage Component (Server Component)
 * Main page displaying task management interface
 * Fetches initial data on the server for better performance and SEO
 */
import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { TaskProvider } from '../context/TaskContext';
import TaskFilter from '../components/features/TaskFilter';
import TaskForm from '../components/features/TaskForm';
import TaskList from '../components/features/TaskList';
import { fetchTasks, getCurrentUser } from '../lib/api/server';
import styles from './home.module.css';
import type { Task, User } from '../../../shared/types';

/**
 * Generate metadata for SEO
 */
export const metadata: Metadata = {
  title: 'Task Manager - Organize and Track Your Tasks',
  description: 'Efficiently manage and organize your tasks with our powerful task management system. Create, update, and track tasks with ease.',
  keywords: ['task management', 'productivity', 'tasks', 'organize', 'track'],
  openGraph: {
    title: 'Task Manager',
    description: 'Organize and track your tasks efficiently',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Task Manager',
    description: 'Organize and track your tasks efficiently',
  },
};

/**
 * Loading component for Suspense
 */
function TasksLoading() {
  return (
    <div className={styles['loading-container']}>
      <p>Loading tasks...</p>
    </div>
  );
}

/**
 * HomePage Server Component
 * Fetches initial data on the server
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: { status?: string; user_id?: string };
}) {
  // Fetch initial data on the server
  const initialTasks: Task[] = await fetchTasks({
    status: searchParams.status as any,
    user_id: searchParams.user_id,
  });

  const currentUser: User | null = await getCurrentUser();

  return (
    <TaskProvider initialTasks={initialTasks} currentUser={currentUser}>
      <div className={styles['home-page']}>
        <header className={styles['page-header']}>
          <div className={styles['header-content']}>
            <h1>Task Manager</h1>
            <p>Organize and track your tasks efficiently</p>
          </div>
        </header>

        <div className={styles['page-content']}>
          <Suspense fallback={<TasksLoading />}>
            <TaskFilter />
            <TaskForm />
            <TaskList initialTasks={initialTasks} />
          </Suspense>
        </div>
      </div>
    </TaskProvider>
  );
}


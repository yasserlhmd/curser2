/**
 * HomePage Component
 * Main page displaying task management interface
 * Public access - guests can view tasks, authenticated users can manage their own
 */
import React from 'react';
import { TaskProvider } from '../context/TaskContext';
import TaskFilter from '../components/TaskFilter';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import './HomePage.css';

const HomePage = () => {
  return (
    <TaskProvider>
      <div className="home-page">
        <header className="page-header">
          <div className="header-content">
            <h1>Task Manager</h1>
            <p>Organize and track your tasks efficiently</p>
          </div>
        </header>

        <div className="page-content">
          <TaskFilter />
          <TaskForm />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
};

export default HomePage;


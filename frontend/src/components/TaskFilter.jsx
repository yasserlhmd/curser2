/**
 * TaskFilter Component
 * Provides filtering options for tasks by user and status
 * Supports nested filtering (user + status combinations)
 */
import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TASK_STATUSES, STATUS_LABELS, FILTER_OPTIONS } from '../constants/taskConstants';
import * as authService from '../services/authService';
import './TaskFilter.css';

const TaskFilter = () => {
  const { statusFilter, setStatusFilter, userFilter, setUserFilter } = useTasks();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for filtering
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersList = await authService.getAllUsers();
        setUsers(usersList);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Status filter options
  const statusFilters = [
    { value: 'all', label: 'All Status' },
    ...TASK_STATUSES.map(status => ({
      value: status,
      label: STATUS_LABELS[status],
    })),
  ];

  // User filter options (varies based on authentication)
  const userFilters = isAuthenticated ? [
    { value: FILTER_OPTIONS.ALL, label: 'All Users' },
    { value: FILTER_OPTIONS.ME, label: 'My Tasks' },
  ] : [
    { value: FILTER_OPTIONS.ALL, label: 'All Users' },
  ];

  return (
    <div className="task-filter">
      <div className="filter-section">
        <h3>Filter by User</h3>
        <div className="filter-buttons">
          {userFilters.map((filterOption) => (
            <button
              key={filterOption.value}
              className={`filter-btn ${String(userFilter) === String(filterOption.value) ? 'active' : ''}`}
              onClick={() => setUserFilter(filterOption.value)}
            >
              {filterOption.label}
            </button>
          ))}
          {isAuthenticated && !loadingUsers && users.length > 0 && (
            <select
              className="filter-select"
              value={String(userFilter)}
              onChange={(e) => {
                const value = e.target.value;
                // Convert numeric strings to numbers, keep 'all' and 'me' as strings
                const filterValue = (value === 'all' || value === 'me') ? value : parseInt(value, 10);
                setUserFilter(filterValue);
              }}
            >
              <option value="me">My Tasks</option>
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name || u.email} {u.id === currentUser?.id ? '(You)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by Status</h3>
        <div className="filter-buttons">
          {statusFilters.map((filterOption) => (
            <button
              key={filterOption.value}
              className={`filter-btn ${statusFilter === filterOption.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(filterOption.value)}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;

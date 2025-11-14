'use client';

/**
 * TaskFilter Component
 * Provides filtering options for tasks by user and status
 * Supports nested filtering (user + status combinations)
 */
import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TASK_STATUSES, STATUS_LABELS, FILTER_OPTIONS } from '../../lib/constants/taskConstants';
import * as authService from '../../lib/api/authService';
import styles from './TaskFilter.module.css';

const TaskFilter: React.FC = () => {
  const { statusFilter, setStatusFilter, userFilter, setUserFilter } = useTasks();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for filtering (only when authenticated)
  useEffect(() => {
    const loadUsers = async () => {
      // Only load users if authenticated
      if (!isAuthenticated) {
        setUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        // Use suppressErrors to avoid console errors for expected 401s
        const usersList = await authService.getAllUsers(true);
        setUsers(usersList);
      } catch (error: any) {
        // Silently handle 401 errors (expected when not authenticated)
        // Only log other errors
        if (error.status !== 401) {
          console.error('Failed to load users:', error);
        }
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, [isAuthenticated]);

  // Status filter options
  const statusFilters = [
    { value: 'all', label: 'All Status' },
    ...TASK_STATUSES.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
    })),
  ];

  // User filter options (varies based on authentication)
  const userFilters = isAuthenticated
    ? [
        { value: FILTER_OPTIONS.ALL, label: 'All Users' },
        { value: FILTER_OPTIONS.ME, label: 'My Tasks' },
      ]
    : [{ value: FILTER_OPTIONS.ALL, label: 'All Users' }];

  return (
    <div className={styles['task-filter']}>
      <div className={styles['filter-section']}>
        <h3>Filter by User</h3>
        <div className={styles['filter-buttons']}>
          {userFilters.map((filterOption) => (
            <button
              key={filterOption.value}
              className={`${styles['filter-btn']} ${
                String(userFilter) === String(filterOption.value) ? styles.active : ''
              }`}
              onClick={() => setUserFilter(filterOption.value)}
            >
              {filterOption.label}
            </button>
          ))}
          {isAuthenticated && !loadingUsers && users.length > 0 && (
            <select
              className={styles['filter-select']}
              value={String(userFilter)}
              onChange={(e) => {
                const value = e.target.value;
                // Convert numeric strings to numbers, keep 'all' and 'me' as strings
                const filterValue = value === 'all' || value === 'me' ? value : parseInt(value, 10);
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

      <div className={styles['filter-section']}>
        <h3>Filter by Status</h3>
        <div className={styles['filter-buttons']}>
          {statusFilters.map((filterOption) => (
            <button
              key={filterOption.value}
              className={`${styles['filter-btn']} ${
                statusFilter === filterOption.value ? styles.active : ''
              }`}
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


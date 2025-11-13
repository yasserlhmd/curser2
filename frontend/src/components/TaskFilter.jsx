import React from 'react';
import { useTasks } from '../context/TaskContext';
import './TaskFilter.css';

const TaskFilter = () => {
  const { filter, setFilter } = useTasks();

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="task-filter">
      {filters.map((filterOption) => (
        <button
          key={filterOption.value}
          className={`filter-btn ${filter === filterOption.value ? 'active' : ''}`}
          onClick={() => setFilter(filterOption.value)}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
};

export default TaskFilter;


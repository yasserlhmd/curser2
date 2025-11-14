/**
 * Task Types
 * Shared types for tasks across frontend and backend
 */

/**
 * Task Status Enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

/**
 * User information in task response
 */
export interface TaskUser {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}

/**
 * Task data
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: number | null;
  user: TaskUser | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create task data
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Update task data (all fields optional)
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Task query parameters
 */
export interface TaskQuery {
  status?: TaskStatus;
  user_id?: string; // 'all', 'me', or user ID
}

/**
 * Tasks response
 */
export interface TasksResponse {
  tasks: Task[];
}

/**
 * Task response
 */
export interface TaskResponse {
  task: Task;
}


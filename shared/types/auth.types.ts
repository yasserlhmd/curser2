/**
 * Authentication Types
 * Shared types for authentication across frontend and backend
 */

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  name?: string | null;
}

/**
 * User login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * User information (public)
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  sub: number; // user id
  email: string;
  jti: string; // token id
  iat: number;
  exp: number;
  userId: number;
}

/**
 * Current user response
 */
export interface CurrentUserResponse {
  user: User;
}

/**
 * Users list response
 */
export interface UsersResponse {
  users: User[];
}


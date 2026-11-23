/**
 * Model for the `users` table.
 * Store owner and authorized staff accounts.
 */

export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

/** Shape used when creating a new user. */
export interface NewUser {
  name: string;
  username: string;
  password_hash: string;
  role?: string;
}

/**
 * Plain-text input accepted by the controller when creating a user.
 * The controller hashes `password` before it reaches the service layer.
 */
export interface NewUserInput {
  name: string;
  username: string;
  password: string;
  role?: string;
}

/** Credentials used to authenticate (login). */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Shape used when updating an existing user (all fields optional). */
export interface UpdateUser {
  name?: string;
  username?: string;
  password_hash?: string;
  role?: string;
}
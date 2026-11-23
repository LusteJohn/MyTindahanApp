import * as userService from '../services/userService';
import type {
  LoginCredentials,
  NewUserInput,
  UpdateUser,
  User,
} from '../models/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { fail, ok, run, type ControllerResult } from './result';

/**
 * Controller for the `users` table.
 * Coordinates validation, password hashing, and calls into the service layer.
 */

/** Public-safe user shape returned to callers (never exposes password_hash). */
export type SafeUser = Omit<User, 'password_hash'>;

function toSafeUser(user: User): SafeUser {
  const { password_hash: _omit, ...safe } = user;
  return safe;
}

export async function listUsers(): Promise<ControllerResult<SafeUser[]>> {
  return run(async () => {
    const users = await userService.findAll();
    return users.map(toSafeUser);
  });
}

export async function getUser(id: number): Promise<ControllerResult<SafeUser>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid user id');
  }
  return run(async () => {
    const user = await userService.findById(id);
    if (!user) throw new Error('User not found');
    return toSafeUser(user);
  });
}

export async function addUser(
  input: NewUserInput
): Promise<ControllerResult<number>> {
  if (!input.name?.trim()) return fail('Name is required');
  if (!input.username?.trim()) return fail('Username is required');
  if (!input.password) return fail('Password is required');

  return run(async () => {
    const existing = await userService.findByUsername(input.username);
    if (existing) throw new Error('Username already exists');

    const passwordHash = hashPassword(input.password);
    if (!passwordHash) throw new Error('Password is required');

    return userService.create({
      name: input.name,
      username: input.username,
      password_hash: passwordHash,
      role: input.role,
    });
  });
}

export async function editUser(
  id: number,
  input: UpdateUser
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid user id');
  }
  return run(async () => {
    const existing = await userService.findById(id);
    if (!existing) throw new Error('User not found');

    // If a new password_hash is supplied it is already hashed; otherwise
    // keep the existing hash by reading it from the current row.
    await userService.update(id, {
      name: input.name ?? existing.name,
      username: input.username ?? existing.username,
      password_hash: input.password_hash ?? existing.password_hash,
      role: input.role ?? existing.role,
    });
  });
}

export async function deleteUser(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid user id');
  }
  return run(async () => {
    const existing = await userService.findById(id);
    if (!existing) throw new Error('User not found');
    await userService.remove(id);
  });
}

/**
 * Authenticates a user by username + plain-text password.
 * Returns the safe user on success, or a failure with a generic message.
 */
export async function authenticate(
  credentials: LoginCredentials
): Promise<ControllerResult<SafeUser>> {
  if (!credentials.username?.trim() || !credentials.password) {
    return fail('Username and password are required');
  }
  return run(async () => {
    const user = await userService.findByUsername(credentials.username.trim());
    if (!user) throw new Error('Invalid username or password');
    const valid = verifyPassword(credentials.password, user.password_hash);
    if (!valid) throw new Error('Invalid username or password');
    return toSafeUser(user);
  });
}

export type { User };
export { ok };
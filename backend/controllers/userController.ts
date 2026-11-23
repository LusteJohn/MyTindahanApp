import * as userService from '../services/userService';
import type { NewUser, UpdateUser, User } from '../models/User';
import { fail, ok, run, type ControllerResult } from './result';

/**
 * Controller for the `users` table.
 * Coordinates validation and calls into the service layer.
 */

export async function listUsers(): Promise<ControllerResult<User[]>> {
  return run(() => userService.findAll());
}

export async function getUser(id: number): Promise<ControllerResult<User>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid user id');
  }
  return run(async () => {
    const user = await userService.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  });
}

export async function addUser(input: NewUser): Promise<ControllerResult<number>> {
  if (!input.name?.trim()) return fail('Name is required');
  if (!input.username?.trim()) return fail('Username is required');
  if (!input.password_hash?.trim()) return fail('Password is required');

  return run(async () => {
    const existing = await userService.findByUsername(input.username);
    if (existing) throw new Error('Username already exists');
    return userService.create(input);
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
    await userService.update(id, input);
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

export type { User };
export { ok };
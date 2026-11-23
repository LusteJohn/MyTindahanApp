/**
 * Database seeding.
 *
 * Creates the default sari-sari store owner account on first launch so
 * the app is usable immediately after installing. Seeding is idempotent:
 * it only inserts the owner when the `users` table is empty.
 */

import { getDatabase } from './database';
import { TABLES } from './config/db';
import { hashPassword } from './utils/password';

/**
 * Default owner credentials for the sari-sari store.
 *
 * These are created only when there are no users yet. Change the
 * password after first login.
 */
export const DEFAULT_OWNER = {
  name: 'Store Owner',
  username: 'owner',
  password: 'owner123',
  role: 'owner',
} as const;

/**
 * Seeds the default store owner if the users table has no rows.
 * Returns `true` when a seed row was inserted, `false` otherwise.
 */
export async function seedDefaultOwner(): Promise<boolean> {
  const db = await getDatabase();

  const existing = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${TABLES.users}`
  );
  if (existing && existing.count > 0) {
    return false;
  }

  const passwordHash = hashPassword(DEFAULT_OWNER.password);
  await db.runAsync(
    `INSERT INTO ${TABLES.users} (name, username, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [DEFAULT_OWNER.name, DEFAULT_OWNER.username, passwordHash, DEFAULT_OWNER.role]
  );

  return true;
}

/**
 * Ensures the database schema exists and the default owner is present.
 * This is the single entry point the app calls on startup (mobile).
 */
export async function initializeBackend(): Promise<void> {
  // getDatabase() creates the schema if it does not exist yet.
  await getDatabase();
  await seedDefaultOwner();
}
import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type { NewUser, UpdateUser, User } from '../models/User';

/**
 * Service layer for the `users` table.
 * Contains all direct SQL access for store owner / staff accounts.
 */

export async function findAll(): Promise<User[]> {
  const db = await getDatabase();
  return db.getAllAsync<User>(`SELECT * FROM ${TABLES.users} ORDER BY id ASC`);
}

export async function findById(id: number): Promise<User | null> {
  const db = await getDatabase();
  return db.getFirstAsync<User>(`SELECT * FROM ${TABLES.users} WHERE id = ?`, [id]);
}

export async function findByUsername(username: string): Promise<User | null> {
  const db = await getDatabase();
  return db.getFirstAsync<User>(`SELECT * FROM ${TABLES.users} WHERE username = ?`, [
    username,
  ]);
}

export async function create(user: NewUser): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.users} (name, username, password_hash, role) VALUES (?, ?, ?, ?)`,
    [user.name, user.username, user.password_hash, user.role ?? 'staff']
  );
  return result.lastInsertRowId;
}

export async function update(id: number, user: UpdateUser): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.users}
       SET name = ?, username = ?, password_hash = ?, role = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [
      user.name ?? '',
      user.username ?? '',
      user.password_hash ?? '',
      user.role ?? 'staff',
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.users} WHERE id = ?`, [id]);
}
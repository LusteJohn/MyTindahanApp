import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  Category,
  NewCategory,
  UpdateCategory,
} from '../models/Category';

/**
 * Service layer for the `categories` table.
 * Contains all direct SQL access for product categories.
 */

export async function findAll(): Promise<Category[]> {
  const db = await getDatabase();
  return db.getAllAsync<Category>(`SELECT * FROM ${TABLES.categories} ORDER BY id ASC`);
}

export async function findById(id: number): Promise<Category | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Category>(`SELECT * FROM ${TABLES.categories} WHERE id = ?`, [
    id,
  ]);
}

export async function findByName(categoryName: string): Promise<Category | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Category>(
    `SELECT * FROM ${TABLES.categories} WHERE category_name = ?`,
    [categoryName]
  );
}

export async function create(category: NewCategory): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.categories} (category_name, description, status) VALUES (?, ?, ?)`,
    [category.category_name, category.description ?? null, category.status ?? 'active']
  );
  return result.lastInsertRowId;
}

export async function update(id: number, category: UpdateCategory): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.categories}
       SET category_name = ?, description = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [
      category.category_name ?? '',
      category.description ?? null,
      category.status ?? 'active',
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.categories} WHERE id = ?`, [id]);
}
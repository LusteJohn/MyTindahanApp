import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  Inventory,
  NewInventory,
  UpdateInventory,
} from '../models/Inventory';

/**
 * Service layer for the `inventory` table.
 * Stores the current stock level per product. There is exactly one
 * inventory row per product (enforced by a UNIQUE constraint on
 * product_id). Use `ensureForProduct` to lazily create the row.
 */

export async function findAll(): Promise<Inventory[]> {
  const db = await getDatabase();
  return db.getAllAsync<Inventory>(`SELECT * FROM ${TABLES.inventory} ORDER BY id ASC`);
}

export async function findByProductId(
  productId: number
): Promise<Inventory | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Inventory>(
    `SELECT * FROM ${TABLES.inventory} WHERE product_id = ?`,
    [productId]
  );
}

export async function findById(id: number): Promise<Inventory | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Inventory>(`SELECT * FROM ${TABLES.inventory} WHERE id = ?`, [
    id,
  ]);
}

export async function create(inventory: NewInventory): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.inventory} (product_id, quantity, reorder_level) VALUES (?, ?, ?)`,
    [
      inventory.product_id,
      inventory.quantity ?? 0,
      inventory.reorder_level ?? 0,
    ]
  );
  return result.lastInsertRowId;
}

export async function update(id: number, inventory: UpdateInventory): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.inventory}
       SET quantity = ?, reorder_level = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [inventory.quantity ?? 0, inventory.reorder_level ?? 0, id]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.inventory} WHERE id = ?`, [id]);
}

/**
 * Ensures an inventory row exists for the given product and returns it.
 * Created with zeroed quantity/reorder level if missing.
 */
export async function ensureForProduct(productId: number): Promise<Inventory> {
  const db = await getDatabase();
  const existing = await findByProductId(productId);
  if (existing) return existing;

  await db.runAsync(
    `INSERT INTO ${TABLES.inventory} (product_id, quantity, reorder_level) VALUES (?, 0, 0)`,
    [productId]
  );
  const created = await findByProductId(productId);
  if (!created) throw new Error('Failed to create inventory row');
  return created;
}

/**
 * Sets an absolute quantity for a product's inventory.
 * Returns the updated inventory row.
 */
export async function setQuantity(
  productId: number,
  quantity: number
): Promise<Inventory> {
  const inventory = await ensureForProduct(productId);
  await update(inventory.id, { quantity });
  const updated = await findByProductId(productId);
  if (!updated) throw new Error('Failed to update inventory');
  return updated;
}
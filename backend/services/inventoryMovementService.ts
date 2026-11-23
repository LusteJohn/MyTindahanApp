import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  InventoryMovement,
  NewInventoryMovement,
} from '../models/InventoryMovement';
import type { Inventory } from '../models/Inventory';

/**
 * Service layer for the `inventory_movements` table.
 *
 * Each movement records a stock change and, via `record()`, also applies
 * that change to the product's inventory row inside a single transaction
 * so the ledger and the stock level never drift apart.
 *
 * Effect on quantity:
 *   IN          -> quantity += movement.quantity
 *   OUT         -> quantity -= movement.quantity
 *   ADJUSTMENT  -> quantity  = movement.quantity (absolute)
 */

export async function findAll(): Promise<InventoryMovement[]> {
  const db = await getDatabase();
  return db.getAllAsync<InventoryMovement>(
    `SELECT * FROM ${TABLES.inventoryMovements} ORDER BY id ASC`
  );
}

export async function findByProduct(
  productId: number
): Promise<InventoryMovement[]> {
  const db = await getDatabase();
  return db.getAllAsync<InventoryMovement>(
    `SELECT * FROM ${TABLES.inventoryMovements} WHERE product_id = ? ORDER BY id ASC`,
    [productId]
  );
}

export async function findById(id: number): Promise<InventoryMovement | null> {
  const db = await getDatabase();
  return db.getFirstAsync<InventoryMovement>(
    `SELECT * FROM ${TABLES.inventoryMovements} WHERE id = ?`,
    [id]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.inventoryMovements} WHERE id = ?`, [id]);
}

/**
 * Records a movement and applies its effect to the inventory row
 * atomically. Returns the updated inventory row.
 */
export async function record(
  movement: NewInventoryMovement
): Promise<Inventory> {
  const db = await getDatabase();

  let updatedInventory: Inventory | null = null;

  await db.withTransactionAsync(async () => {
    // Ensure an inventory row exists for the product.
    await db.runAsync(
      `INSERT INTO ${TABLES.inventory} (product_id, quantity, reorder_level)
       VALUES (?, 0, 0)
       ON CONFLICT(product_id) DO NOTHING`,
      [movement.product_id]
    );

    const current = await db.getFirstAsync<Inventory>(
      `SELECT * FROM ${TABLES.inventory} WHERE product_id = ?`,
      [movement.product_id]
    );
    if (!current) throw new Error('Failed to load inventory');

    let nextQuantity: number;
    switch (movement.movement_type) {
      case 'IN':
        nextQuantity = current.quantity + movement.quantity;
        break;
      case 'OUT':
        nextQuantity = current.quantity - movement.quantity;
        break;
      case 'ADJUSTMENT':
        nextQuantity = movement.quantity;
        break;
      default:
        throw new Error(`Unsupported movement type: ${movement.movement_type}`);
    }

    // Persist the movement record.
    await db.runAsync(
      `INSERT INTO ${TABLES.inventoryMovements}
         (product_id, movement_type, quantity, reference_type, reference_id, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        movement.product_id,
        movement.movement_type,
        movement.quantity,
        movement.reference_type ?? null,
        movement.reference_id ?? null,
        movement.remarks ?? null,
      ]
    );

    // Apply the new quantity to inventory.
    await db.runAsync(
      `UPDATE ${TABLES.inventory}
         SET quantity = ?, updated_at = datetime('now')
       WHERE product_id = ?`,
      [nextQuantity, movement.product_id]
    );

    const updated = await db.getFirstAsync<Inventory>(
      `SELECT * FROM ${TABLES.inventory} WHERE product_id = ?`,
      [movement.product_id]
    );
    if (!updated) throw new Error('Failed to update inventory');
    updatedInventory = updated;
  });

  if (!updatedInventory) throw new Error('Failed to record movement');
  return updatedInventory;
}
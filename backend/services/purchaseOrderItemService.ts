import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  PurchaseOrderItem,
  NewPurchaseOrderItem,
  UpdatePurchaseOrderItem,
} from '../models/PurchaseOrderItem';

/**
 * Service layer for the `purchase_order_items` table.
 * Contains all direct SQL access for purchase order line items.
 * The subtotal is computed from quantity * cost_price when omitted.
 */

export async function findAll(): Promise<PurchaseOrderItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<PurchaseOrderItem>(
    `SELECT * FROM ${TABLES.purchaseOrderItems} ORDER BY id ASC`
  );
}

export async function findByOrder(
  purchaseOrderId: number
): Promise<PurchaseOrderItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<PurchaseOrderItem>(
    `SELECT * FROM ${TABLES.purchaseOrderItems} WHERE purchase_order_id = ? ORDER BY id ASC`,
    [purchaseOrderId]
  );
}

export async function findById(id: number): Promise<PurchaseOrderItem | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PurchaseOrderItem>(
    `SELECT * FROM ${TABLES.purchaseOrderItems} WHERE id = ?`,
    [id]
  );
}

export async function create(item: NewPurchaseOrderItem): Promise<number> {
  const db = await getDatabase();
  const costPrice = item.cost_price ?? 0;
  const subtotal = item.subtotal ?? item.quantity * costPrice;
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.purchaseOrderItems}
       (purchase_order_id, product_id, quantity, cost_price, subtotal)
     VALUES (?, ?, ?, ?, ?)`,
    [item.purchase_order_id, item.product_id, item.quantity, costPrice, subtotal]
  );
  return result.lastInsertRowId;
}

export async function update(
  id: number,
  item: UpdatePurchaseOrderItem
): Promise<void> {
  const db = await getDatabase();
  const costPrice = item.cost_price ?? 0;
  const subtotal =
    item.subtotal ?? (item.quantity !== undefined ? item.quantity * costPrice : 0);
  await db.runAsync(
    `UPDATE ${TABLES.purchaseOrderItems}
       SET purchase_order_id = ?,
           product_id = ?,
           quantity = ?,
           cost_price = ?,
           subtotal = ?
     WHERE id = ?`,
    [
      item.purchase_order_id ?? 0,
      item.product_id ?? 0,
      item.quantity ?? 0,
      costPrice,
      subtotal,
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.purchaseOrderItems} WHERE id = ?`, [id]);
}
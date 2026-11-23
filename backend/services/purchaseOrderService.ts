import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  PurchaseOrder,
  NewPurchaseOrder,
  UpdatePurchaseOrder,
} from '../models/PurchaseOrder';

/**
 * Service layer for the `purchase_orders` table.
 * Contains all direct SQL access for purchase orders.
 */

export async function findAll(): Promise<PurchaseOrder[]> {
  const db = await getDatabase();
  return db.getAllAsync<PurchaseOrder>(
    `SELECT * FROM ${TABLES.purchaseOrders} ORDER BY id ASC`
  );
}

export async function findById(id: number): Promise<PurchaseOrder | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PurchaseOrder>(
    `SELECT * FROM ${TABLES.purchaseOrders} WHERE id = ?`,
    [id]
  );
}

export async function findByOrderNumber(
  orderNumber: string
): Promise<PurchaseOrder | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PurchaseOrder>(
    `SELECT * FROM ${TABLES.purchaseOrders} WHERE order_number = ?`,
    [orderNumber]
  );
}

export async function create(order: NewPurchaseOrder): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.purchaseOrders}
       (supplier_id, order_number, order_date, status, total_amount, remarks)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      order.supplier_id ?? null,
      order.order_number,
      order.order_date ?? new Date().toISOString(),
      order.status ?? 'pending',
      order.total_amount ?? 0,
      order.remarks ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function update(
  id: number,
  order: UpdatePurchaseOrder
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.purchaseOrders}
       SET supplier_id = ?,
           order_number = ?,
           order_date = ?,
           status = ?,
           total_amount = ?,
           remarks = ?,
           updated_at = datetime('now')
     WHERE id = ?`,
    [
      order.supplier_id ?? null,
      order.order_number ?? '',
      order.order_date ?? new Date().toISOString(),
      order.status ?? 'pending',
      order.total_amount ?? 0,
      order.remarks ?? null,
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.purchaseOrders} WHERE id = ?`, [id]);
}
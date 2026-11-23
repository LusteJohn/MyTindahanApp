import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  Supplier,
  NewSupplier,
  UpdateSupplier,
} from '../models/Supplier';

/**
 * Service layer for the `suppliers` table.
 * Contains all direct SQL access for product suppliers.
 */

export async function findAll(): Promise<Supplier[]> {
  const db = await getDatabase();
  return db.getAllAsync<Supplier>(`SELECT * FROM ${TABLES.suppliers} ORDER BY id ASC`);
}

export async function findById(id: number): Promise<Supplier | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Supplier>(`SELECT * FROM ${TABLES.suppliers} WHERE id = ?`, [
    id,
  ]);
}

export async function create(supplier: NewSupplier): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.suppliers}
       (supplier_name, contact_number, address, email, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      supplier.supplier_name,
      supplier.contact_number ?? null,
      supplier.address ?? null,
      supplier.email ?? null,
      supplier.status ?? 'active',
    ]
  );
  return result.lastInsertRowId;
}

export async function update(id: number, supplier: UpdateSupplier): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.suppliers}
       SET supplier_name = ?,
           contact_number = ?,
           address = ?,
           email = ?,
           status = ?,
           updated_at = datetime('now')
     WHERE id = ?`,
    [
      supplier.supplier_name ?? '',
      supplier.contact_number ?? null,
      supplier.address ?? null,
      supplier.email ?? null,
      supplier.status ?? 'active',
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.suppliers} WHERE id = ?`, [id]);
}
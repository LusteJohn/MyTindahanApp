import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  Customer,
  NewCustomer,
  UpdateCustomer,
} from '../models/Customer';
import type { CustomerGroup } from '../models/CustomerGroup';
import type { CustomerWithGroups } from '../models/relationships';

/**
 * Service layer for the `customers` table.
 * Contains all direct SQL access for customer information.
 */

export async function findAll(): Promise<Customer[]> {
  const db = await getDatabase();
  return db.getAllAsync<Customer>(`SELECT * FROM ${TABLES.customers} ORDER BY id ASC`);
}

export async function findById(id: number): Promise<Customer | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Customer>(`SELECT * FROM ${TABLES.customers} WHERE id = ?`, [
    id,
  ]);
}

export async function findByCode(customerCode: string): Promise<Customer | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Customer>(
    `SELECT * FROM ${TABLES.customers} WHERE customer_code = ?`,
    [customerCode]
  );
}

export async function create(customer: NewCustomer): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.customers}
       (customer_code, first_name, last_name, contact_number, address, credit_limit, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      customer.customer_code,
      customer.first_name,
      customer.last_name,
      customer.contact_number ?? null,
      customer.address ?? null,
      customer.credit_limit ?? 0,
      customer.status ?? 'active',
    ]
  );
  return result.lastInsertRowId;
}

export async function update(id: number, customer: UpdateCustomer): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.customers}
       SET customer_code = ?,
           first_name = ?,
           last_name = ?,
           contact_number = ?,
           address = ?,
           credit_limit = ?,
           status = ?,
           updated_at = datetime('now')
     WHERE id = ?`,
    [
      customer.customer_code ?? '',
      customer.first_name ?? '',
      customer.last_name ?? '',
      customer.contact_number ?? null,
      customer.address ?? null,
      customer.credit_limit ?? 0,
      customer.status ?? 'active',
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.customers} WHERE id = ?`, [id]);
}

/**
 * Relationship-aware: returns every group a customer belongs to.
 * Reads through the `customer_group_members` join table.
 */
export async function findGroupsByCustomer(
  customerId: number
): Promise<CustomerGroup[]> {
  const db = await getDatabase();
  return db.getAllAsync<CustomerGroup>(
    `SELECT g.*
       FROM ${TABLES.customerGroups} g
       INNER JOIN ${TABLES.customerGroupMembers} m ON m.group_id = g.id
      WHERE m.customer_id = ?
      ORDER BY g.id ASC`,
    [customerId]
  );
}

/**
 * Relationship-aware: returns a customer together with the list of
 * groups they belong to. The related rows are loaded via the join table
 * so the returned object is fully populated.
 */
export async function findByIdWithGroups(
  id: number
): Promise<CustomerWithGroups | null> {
  const db = await getDatabase();
  const customer = await findById(id);
  if (!customer) return null;
  const groups = await findGroupsByCustomer(id);
  return { ...customer, groups };
}
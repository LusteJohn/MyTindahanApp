import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  CustomerGroup,
  NewCustomerGroup,
  UpdateCustomerGroup,
} from '../models/CustomerGroup';
import type { Customer } from '../models/Customer';
import type { CustomerGroupWithCustomers } from '../models/relationships';

/**
 * Service layer for the `customer_groups` table.
 * Contains all direct SQL access for customer groups
 * (family, neighbors, coworkers, ...).
 */

export async function findAll(): Promise<CustomerGroup[]> {
  const db = await getDatabase();
  return db.getAllAsync<CustomerGroup>(
    `SELECT * FROM ${TABLES.customerGroups} ORDER BY id ASC`
  );
}

export async function findById(id: number): Promise<CustomerGroup | null> {
  const db = await getDatabase();
  return db.getFirstAsync<CustomerGroup>(
    `SELECT * FROM ${TABLES.customerGroups} WHERE id = ?`,
    [id]
  );
}

export async function create(group: NewCustomerGroup): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.customerGroups} (group_name, description, status) VALUES (?, ?, ?)`,
    [group.group_name, group.description ?? null, group.status ?? 'active']
  );
  return result.lastInsertRowId;
}

export async function update(
  id: number,
  group: UpdateCustomerGroup
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.customerGroups}
       SET group_name = ?, description = ?, status = ?
     WHERE id = ?`,
    [
      group.group_name ?? '',
      group.description ?? null,
      group.status ?? 'active',
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.customerGroups} WHERE id = ?`, [id]);
}

/**
 * Relationship-aware: returns every customer that belongs to a group.
 * Reads through the `customer_group_members` join table.
 */
export async function findCustomersByGroup(
  groupId: number
): Promise<Customer[]> {
  const db = await getDatabase();
  return db.getAllAsync<Customer>(
    `SELECT c.*
       FROM ${TABLES.customers} c
       INNER JOIN ${TABLES.customerGroupMembers} m ON m.customer_id = c.id
      WHERE m.group_id = ?
      ORDER BY c.id ASC`,
    [groupId]
  );
}

/**
 * Relationship-aware: returns a group together with its member
 * customers and the total member count.
 */
export async function findByIdWithCustomers(
  id: number
): Promise<CustomerGroupWithCustomers | null> {
  const db = await getDatabase();
  const group = await findById(id);
  if (!group) return null;
  const customers = await findCustomersByGroup(id);
  return { ...group, customers, member_count: customers.length };
}
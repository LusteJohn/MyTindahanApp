import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  CustomerGroupMember,
  NewCustomerGroupMember,
} from '../models/CustomerGroupMember';
import type {
  CustomerGroupMemberDetail,
} from '../models/relationships';

/**
 * Service layer for the `customer_group_members` table.
 * Connects customers to their respective groups.
 */

export async function findAll(): Promise<CustomerGroupMember[]> {
  const db = await getDatabase();
  return db.getAllAsync<CustomerGroupMember>(
    `SELECT * FROM ${TABLES.customerGroupMembers} ORDER BY id ASC`
  );
}

export async function findByGroup(groupId: number): Promise<CustomerGroupMember[]> {
  const db = await getDatabase();
  return db.getAllAsync<CustomerGroupMember>(
    `SELECT * FROM ${TABLES.customerGroupMembers} WHERE group_id = ? ORDER BY id ASC`,
    [groupId]
  );
}

export async function findByCustomer(
  customerId: number
): Promise<CustomerGroupMember[]> {
  const db = await getDatabase();
  return db.getAllAsync<CustomerGroupMember>(
    `SELECT * FROM ${TABLES.customerGroupMembers} WHERE customer_id = ? ORDER BY id ASC`,
    [customerId]
  );
}

export async function create(member: NewCustomerGroupMember): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.customerGroupMembers} (group_id, customer_id) VALUES (?, ?)`,
    [member.group_id, member.customer_id]
  );
  return result.lastInsertRowId;
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.customerGroupMembers} WHERE id = ?`, [id]);
}

export async function removeByGroupAndCustomer(
  groupId: number,
  customerId: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `DELETE FROM ${TABLES.customerGroupMembers} WHERE group_id = ? AND customer_id = ?`,
    [groupId, customerId]
  );
}

/**
 * Relationship-aware: returns membership rows joined with their
 * customer and group records in a single query.
 *
 * `json_object` packs the related customer/group rows into JSON text,
 * which is parsed here into the nested `CustomerGroupMemberDetail` shape.
 */
export async function findDetailsByGroup(
  groupId: number
): Promise<CustomerGroupMemberDetail[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<
    Omit<CustomerGroupMemberDetail, 'customer' | 'group'> & {
      customer: string;
      group: string;
    }
  >(
    `SELECT
        m.id          AS id,
        m.group_id    AS group_id,
        m.customer_id AS customer_id,
        m.joined_at   AS joined_at,
        json_object(
          'id', c.id,
          'customer_code', c.customer_code,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'contact_number', c.contact_number,
          'address', c.address,
          'credit_limit', c.credit_limit,
          'status', c.status,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        ) AS customer,
        json_object(
          'id', g.id,
          'group_name', g.group_name,
          'description', g.description,
          'status', g.status,
          'created_at', g.created_at
        ) AS group
       FROM ${TABLES.customerGroupMembers} m
       INNER JOIN ${TABLES.customers} c ON c.id = m.customer_id
       INNER JOIN ${TABLES.customerGroups} g ON g.id = m.group_id
      WHERE m.group_id = ?
      ORDER BY m.id ASC`,
    [groupId]
  );

  return rows.map((row) => ({
    id: row.id,
    group_id: row.group_id,
    customer_id: row.customer_id,
    joined_at: row.joined_at,
    customer: JSON.parse(row.customer),
    group: JSON.parse(row.group),
  }));
}
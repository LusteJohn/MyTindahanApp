/**
 * Model for the `customer_groups` table.
 * Groups of customers, such as family, neighbors, or coworkers.
 */

export type CustomerGroupStatus = 'active' | 'inactive';

export interface CustomerGroup {
  id: number;
  group_name: string;
  description: string | null;
  status: string;
  created_at: string;
}

/** Shape used when creating a new customer group. */
export interface NewCustomerGroup {
  group_name: string;
  description?: string | null;
  status?: string;
}

/** Shape used when updating an existing customer group (all fields optional). */
export interface UpdateCustomerGroup {
  group_name?: string;
  description?: string | null;
  status?: string;
}
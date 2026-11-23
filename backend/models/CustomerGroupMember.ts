/**
 * Model for the `customer_group_members` table.
 * Connects customers to their respective groups.
 */

export interface CustomerGroupMember {
  id: number;
  group_id: number;
  customer_id: number;
  joined_at: string;
}

/** Shape used when adding a customer to a group. */
export interface NewCustomerGroupMember {
  group_id: number;
  customer_id: number;
}
/**
 * Relationship-enriched view types.
 *
 * The base tables are linked through `customer_group_members`
 * (customer_groups 1 --- N customer_group_members N --- 1 customers).
 * These types represent the joined shapes returned by the
 * relationship-aware service queries.
 */

import type { Customer } from './Customer';
import type { CustomerGroup } from './CustomerGroup';
import type { CustomerGroupMember } from './CustomerGroupMember';
import type { Category } from './Category';
import type { Product } from './Product';
import type { Inventory } from './Inventory';
import type { InventoryMovement } from './InventoryMovement';
import type { PurchaseOrderItem } from './PurchaseOrderItem';

/** A customer together with every group they belong to. */
export interface CustomerWithGroups extends Customer {
  groups: CustomerGroup[];
}

/** A group together with its member customers and member count. */
export interface CustomerGroupWithCustomers extends CustomerGroup {
  customers: Customer[];
  member_count: number;
}

/** A membership row joined with its customer and group records. */
export interface CustomerGroupMemberDetail extends CustomerGroupMember {
  customer: Customer;
  group: CustomerGroup;
}

/** A product joined with its category and current inventory row. */
export interface ProductWithDetails extends Product {
  category: Category | null;
  inventory: Inventory | null;
  in_stock: boolean;
  low_stock: boolean;
}
/**
 * Model for the `inventory` table.
 * Current stock level per product.
 */

export interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  reorder_level: number;
  updated_at: string;
}

export interface NewInventory {
  product_id: number;
  quantity?: number;
  reorder_level?: number;
}

export interface UpdateInventory {
  quantity?: number;
  reorder_level?: number;
}
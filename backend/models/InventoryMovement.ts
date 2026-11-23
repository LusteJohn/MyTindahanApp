/**
 * Model for the `inventory_movements` table.
 * Stock In / Out / Adjustment history per product.
 */

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface InventoryMovement {
  id: number;
  product_id: number;
  movement_type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: number | null;
  remarks: string | null;
  created_at: string;
}

export interface NewInventoryMovement {
  product_id: number;
  movement_type: MovementType;
  quantity: number;
  reference_type?: string | null;
  reference_id?: number | null;
  remarks?: string | null;
}
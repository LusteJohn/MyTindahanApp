/**
 * Model for the `purchase_orders` table.
 * Purchase orders placed to suppliers.
 */

export type PurchaseOrderStatus =
  | 'pending'
  | 'ordered'
  | 'received'
  | 'cancelled';

export interface PurchaseOrder {
  id: number;
  supplier_id: number | null;
  order_number: string;
  order_date: string;
  status: string;
  total_amount: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewPurchaseOrder {
  supplier_id?: number | null;
  order_number: string;
  order_date?: string;
  status?: string;
  total_amount?: number;
  remarks?: string | null;
}

export interface UpdatePurchaseOrder {
  supplier_id?: number | null;
  order_number?: string;
  order_date?: string;
  status?: string;
  total_amount?: number;
  remarks?: string | null;
}
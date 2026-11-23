/**
 * Model for the `purchase_order_items` table.
 * Line items belonging to a purchase order.
 */

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  cost_price: number;
  subtotal: number;
  created_at: string;
}

export interface NewPurchaseOrderItem {
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  cost_price?: number;
  subtotal?: number;
}

export interface UpdatePurchaseOrderItem {
  purchase_order_id?: number;
  product_id?: number;
  quantity?: number;
  cost_price?: number;
  subtotal?: number;
}
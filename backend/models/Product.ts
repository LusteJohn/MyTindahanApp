/**
 * Model for the `products` table.
 * Products sold by the store.
 */

export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: number;
  category_id: number | null;
  product_name: string;
  barcode: string | null;
  description: string | null;
  cost_price: number;
  selling_price: number;
  unit: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NewProduct {
  category_id?: number | null;
  product_name: string;
  barcode?: string | null;
  description?: string | null;
  cost_price?: number;
  selling_price?: number;
  unit?: string;
  status?: string;
}

export interface UpdateProduct {
  category_id?: number | null;
  product_name?: string;
  barcode?: string | null;
  description?: string | null;
  cost_price?: number;
  selling_price?: number;
  unit?: string;
  status?: string;
}
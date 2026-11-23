/**
 * Model for the `suppliers` table.
 * Product suppliers.
 */

export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  id: number;
  supplier_name: string;
  contact_number: string | null;
  address: string | null;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NewSupplier {
  supplier_name: string;
  contact_number?: string | null;
  address?: string | null;
  email?: string | null;
  status?: string;
}

export interface UpdateSupplier {
  supplier_name?: string;
  contact_number?: string | null;
  address?: string | null;
  email?: string | null;
  status?: string;
}
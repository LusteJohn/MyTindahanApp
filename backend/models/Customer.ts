/**
 * Model for the `customers` table.
 * Customer information.
 */

export type CustomerStatus = 'active' | 'inactive' | 'blacklisted';

export interface Customer {
  id: number;
  customer_code: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  address: string | null;
  credit_limit: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Shape used when creating a new customer. */
export interface NewCustomer {
  customer_code: string;
  first_name: string;
  last_name: string;
  contact_number?: string | null;
  address?: string | null;
  credit_limit?: number;
  status?: string;
}

/** Shape used when updating an existing customer (all fields optional). */
export interface UpdateCustomer {
  customer_code?: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string | null;
  address?: string | null;
  credit_limit?: number;
  status?: string;
}
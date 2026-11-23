/**
 * Model for the `categories` table.
 * Product categories.
 */

export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: number;
  category_name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NewCategory {
  category_name: string;
  description?: string | null;
  status?: string;
}

export interface UpdateCategory {
  category_name?: string;
  description?: string | null;
  status?: string;
}
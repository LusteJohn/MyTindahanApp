import { getDatabase } from '../database';
import { TABLES } from '../config/db';
import type {
  Product,
  NewProduct,
  UpdateProduct,
} from '../models/Product';
import type { Category } from '../models/Category';
import type { Inventory } from '../models/Inventory';
import type { ProductWithDetails } from '../models/relationships';

/**
 * Service layer for the `products` table.
 * Contains all direct SQL access for products, including relationship
 * aware helpers that join category and inventory.
 */

export async function findAll(): Promise<Product[]> {
  const db = await getDatabase();
  return db.getAllAsync<Product>(`SELECT * FROM ${TABLES.products} ORDER BY id ASC`);
}

export async function findById(id: number): Promise<Product | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Product>(`SELECT * FROM ${TABLES.products} WHERE id = ?`, [
    id,
  ]);
}

export async function findByBarcode(barcode: string): Promise<Product | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Product>(
    `SELECT * FROM ${TABLES.products} WHERE barcode = ?`,
    [barcode]
  );
}

export async function create(product: NewProduct): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ${TABLES.products}
       (category_id, product_name, barcode, description, cost_price, selling_price, unit, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.category_id ?? null,
      product.product_name,
      product.barcode ?? null,
      product.description ?? null,
      product.cost_price ?? 0,
      product.selling_price ?? 0,
      product.unit ?? 'pc',
      product.status ?? 'active',
    ]
  );
  return result.lastInsertRowId;
}

export async function update(id: number, product: UpdateProduct): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${TABLES.products}
       SET category_id = ?,
           product_name = ?,
           barcode = ?,
           description = ?,
           cost_price = ?,
           selling_price = ?,
           unit = ?,
           status = ?,
           updated_at = datetime('now')
     WHERE id = ?`,
    [
      product.category_id ?? null,
      product.product_name ?? '',
      product.barcode ?? null,
      product.description ?? null,
      product.cost_price ?? 0,
      product.selling_price ?? 0,
      product.unit ?? 'pc',
      product.status ?? 'active',
      id,
    ]
  );
}

export async function remove(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${TABLES.products} WHERE id = ?`, [id]);
}

/**
 * Relationship-aware: returns a product joined with its category and
 * current inventory row. Computed flags help callers flag low/no stock.
 */
export async function findByIdWithDetails(
  id: number
): Promise<ProductWithDetails | null> {
  const db = await getDatabase();
  const product = await findById(id);
  if (!product) return null;

  const category = product.category_id
    ? await db.getFirstAsync<Category>(
        `SELECT * FROM ${TABLES.categories} WHERE id = ?`,
        [product.category_id]
      )
    : null;

  const inventory = await db.getFirstAsync<Inventory>(
    `SELECT * FROM ${TABLES.inventory} WHERE product_id = ?`,
    [id]
  );

  const quantity = inventory?.quantity ?? 0;
  const reorderLevel = inventory?.reorder_level ?? 0;

  return {
    ...product,
    category,
    inventory,
    in_stock: quantity > 0,
    low_stock: quantity > 0 && quantity <= reorderLevel,
  };
}
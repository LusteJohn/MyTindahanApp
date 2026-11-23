import * as productService from '../services/productService';
import * as inventoryService from '../services/inventoryService';
import type {
  Product,
  NewProduct,
  UpdateProduct,
} from '../models/Product';
import type { ProductWithDetails } from '../models/relationships';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `products` table.
 * On create it also creates a matching inventory row (via the service).
 */

export async function listProducts(): Promise<ControllerResult<Product[]>> {
  return run(() => productService.findAll());
}

export async function getProduct(id: number): Promise<ControllerResult<Product>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid product id');
  }
  return run(async () => {
    const product = await productService.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  });
}

/** Returns a product joined with its category and current inventory. */
export async function getProductDetails(
  id: number
): Promise<ControllerResult<ProductWithDetails>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid product id');
  }
  return run(async () => {
    const product = await productService.findByIdWithDetails(id);
    if (!product) throw new Error('Product not found');
    return product;
  });
}

export async function addProduct(
  input: NewProduct
): Promise<ControllerResult<number>> {
  if (!input.product_name?.trim()) return fail('Product name is required');
  if (input.selling_price != null && input.selling_price < 0) {
    return fail('Selling price cannot be negative');
  }
  return run(async () => {
    const id = await productService.create(input);
    // Every product gets an inventory row so stock can be tracked.
    await inventoryService.ensureForProduct(id);
    return id;
  });
}

export async function editProduct(
  id: number,
  input: UpdateProduct
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid product id');
  }
  return run(async () => {
    const existing = await productService.findById(id);
    if (!existing) throw new Error('Product not found');
    await productService.update(id, input);
  });
}

export async function deleteProduct(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid product id');
  }
  return run(async () => {
    const existing = await productService.findById(id);
    if (!existing) throw new Error('Product not found');
    await productService.remove(id);
  });
}

export type { Product };
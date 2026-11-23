import * as inventoryService from '../services/inventoryService';
import * as productService from '../services/productService';
import type {
  Inventory,
  NewInventory,
  UpdateInventory,
} from '../models/Inventory';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `inventory` table.
 * Validates that the referenced product exists before mutating stock.
 */

export async function listInventory(): Promise<ControllerResult<Inventory[]>> {
  return run(() => inventoryService.findAll());
}

export async function getInventoryByProduct(
  productId: number
): Promise<ControllerResult<Inventory>> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return fail('Invalid product id');
  }
  return run(async () => {
    const inventory = await inventoryService.findByProductId(productId);
    if (!inventory) throw new Error('Inventory not found for this product');
    return inventory;
  });
}

export async function addInventory(
  input: NewInventory
): Promise<ControllerResult<number>> {
  if (!Number.isInteger(input.product_id) || input.product_id <= 0) {
    return fail('Invalid product id');
  }
  return run(async () => {
    const product = await productService.findById(input.product_id);
    if (!product) throw new Error('Product not found');
    const existing = await inventoryService.findByProductId(input.product_id);
    if (existing) throw new Error('Inventory already exists for this product');
    return inventoryService.create(input);
  });
}

export async function editInventory(
  id: number,
  input: UpdateInventory
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid inventory id');
  }
  return run(async () => {
    const existing = await inventoryService.findById(id);
    if (!existing) throw new Error('Inventory not found');
    await inventoryService.update(id, input);
  });
}

export async function deleteInventory(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid inventory id');
  }
  return run(async () => {
    const existing = await inventoryService.findById(id);
    if (!existing) throw new Error('Inventory not found');
    await inventoryService.remove(id);
  });
}

export type { Inventory };
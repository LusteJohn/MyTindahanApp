import * as inventoryMovementService from '../services/inventoryMovementService';
import * as productService from '../services/productService';
import type {
  InventoryMovement,
  NewInventoryMovement,
  MovementType,
} from '../models/InventoryMovement';
import type { Inventory } from '../models/Inventory';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `inventory_movements` table.
 *
 * `recordMovement` is the primary operation: it validates the movement,
 * then records it and applies the stock change atomically (see the
 * service layer). Returned value is the updated inventory row.
 */

const VALID_MOVEMENT_TYPES: MovementType[] = ['IN', 'OUT', 'ADJUSTMENT'];

export async function listMovements(): Promise<
  ControllerResult<InventoryMovement[]>
> {
  return run(() => inventoryMovementService.findAll());
}

export async function listMovementsByProduct(
  productId: number
): Promise<ControllerResult<InventoryMovement[]>> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return fail('Invalid product id');
  }
  return run(() => inventoryMovementService.findByProduct(productId));
}

/**
 * Records a stock movement (IN / OUT / ADJUSTMENT) and applies it to the
 * product's inventory. Returns the updated inventory row.
 */
export async function recordMovement(
  input: NewInventoryMovement
): Promise<ControllerResult<Inventory>> {
  if (!Number.isInteger(input.product_id) || input.product_id <= 0) {
    return fail('Invalid product id');
  }
  if (!VALID_MOVEMENT_TYPES.includes(input.movement_type)) {
    return fail('movement_type must be one of IN, OUT, ADJUSTMENT');
  }
  if (input.quantity == null || input.quantity < 0) {
    return fail('Quantity must be zero or greater');
  }
  if (input.movement_type === 'OUT' && input.quantity === 0) {
    return fail('OUT quantity must be greater than zero');
  }

  return run(async () => {
    const product = await productService.findById(input.product_id);
    if (!product) throw new Error('Product not found');
    return inventoryMovementService.record(input);
  });
}

export async function deleteMovement(
  id: number
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid movement id');
  }
  return run(async () => {
    const existing = await inventoryMovementService.findById(id);
    if (!existing) throw new Error('Movement not found');
    // Note: deleting a movement removes the ledger row but does not
    // reverse its stock effect. Reverse by recording an opposite
    // movement if needed.
    await inventoryMovementService.remove(id);
  });
}

export type { InventoryMovement };
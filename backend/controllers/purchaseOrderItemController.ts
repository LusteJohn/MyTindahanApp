import * as purchaseOrderItemService from '../services/purchaseOrderItemService';
import * as purchaseOrderService from '../services/purchaseOrderService';
import * as productService from '../services/productService';
import type {
  PurchaseOrderItem,
  NewPurchaseOrderItem,
  UpdatePurchaseOrderItem,
} from '../models/PurchaseOrderItem';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `purchase_order_items` table.
 * Validates that the referenced purchase order and product exist.
 */

export async function listItems(): Promise<
  ControllerResult<PurchaseOrderItem[]>
> {
  return run(() => purchaseOrderItemService.findAll());
}

export async function listItemsByOrder(
  purchaseOrderId: number
): Promise<ControllerResult<PurchaseOrderItem[]>> {
  if (!Number.isInteger(purchaseOrderId) || purchaseOrderId <= 0) {
    return fail('Invalid purchase order id');
  }
  return run(() => purchaseOrderItemService.findByOrder(purchaseOrderId));
}

export async function getItem(id: number): Promise<ControllerResult<PurchaseOrderItem>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid item id');
  }
  return run(async () => {
    const item = await purchaseOrderItemService.findById(id);
    if (!item) throw new Error('Purchase order item not found');
    return item;
  });
}

export async function addItem(
  input: NewPurchaseOrderItem
): Promise<ControllerResult<number>> {
  if (!Number.isInteger(input.purchase_order_id) || input.purchase_order_id <= 0) {
    return fail('Invalid purchase order id');
  }
  if (!Number.isInteger(input.product_id) || input.product_id <= 0) {
    return fail('Invalid product id');
  }
  if (input.quantity == null || input.quantity <= 0) {
    return fail('Quantity must be greater than zero');
  }
  return run(async () => {
    const [order, product] = await Promise.all([
      purchaseOrderService.findById(input.purchase_order_id),
      productService.findById(input.product_id),
    ]);
    if (!order) throw new Error('Purchase order not found');
    if (!product) throw new Error('Product not found');
    return purchaseOrderItemService.create(input);
  });
}

export async function editItem(
  id: number,
  input: UpdatePurchaseOrderItem
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid item id');
  }
  return run(async () => {
    const existing = await purchaseOrderItemService.findById(id);
    if (!existing) throw new Error('Purchase order item not found');
    await purchaseOrderItemService.update(id, input);
  });
}

export async function deleteItem(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid item id');
  }
  return run(async () => {
    const existing = await purchaseOrderItemService.findById(id);
    if (!existing) throw new Error('Purchase order item not found');
    await purchaseOrderItemService.remove(id);
  });
}

export type { PurchaseOrderItem };
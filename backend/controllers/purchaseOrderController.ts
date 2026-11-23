import * as purchaseOrderService from '../services/purchaseOrderService';
import * as supplierService from '../services/supplierService';
import type {
  PurchaseOrder,
  NewPurchaseOrder,
  UpdatePurchaseOrder,
} from '../models/PurchaseOrder';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `purchase_orders` table.
 */

export async function listPurchaseOrders(): Promise<
  ControllerResult<PurchaseOrder[]>
> {
  return run(() => purchaseOrderService.findAll());
}

export async function getPurchaseOrder(
  id: number
): Promise<ControllerResult<PurchaseOrder>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid purchase order id');
  }
  return run(async () => {
    const order = await purchaseOrderService.findById(id);
    if (!order) throw new Error('Purchase order not found');
    return order;
  });
}

export async function addPurchaseOrder(
  input: NewPurchaseOrder
): Promise<ControllerResult<number>> {
  if (!input.order_number?.trim()) return fail('Order number is required');
  return run(async () => {
    if (input.supplier_id != null) {
      const supplier = await supplierService.findById(input.supplier_id);
      if (!supplier) throw new Error('Supplier not found');
    }
    const existing = await purchaseOrderService.findByOrderNumber(input.order_number);
    if (existing) throw new Error('Order number already exists');
    return purchaseOrderService.create(input);
  });
}

export async function editPurchaseOrder(
  id: number,
  input: UpdatePurchaseOrder
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid purchase order id');
  }
  return run(async () => {
    const existing = await purchaseOrderService.findById(id);
    if (!existing) throw new Error('Purchase order not found');
    await purchaseOrderService.update(id, input);
  });
}

export async function deletePurchaseOrder(
  id: number
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid purchase order id');
  }
  return run(async () => {
    const existing = await purchaseOrderService.findById(id);
    if (!existing) throw new Error('Purchase order not found');
    await purchaseOrderService.remove(id);
  });
}

export type { PurchaseOrder };
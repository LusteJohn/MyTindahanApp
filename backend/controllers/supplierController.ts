import * as supplierService from '../services/supplierService';
import type {
  Supplier,
  NewSupplier,
  UpdateSupplier,
} from '../models/Supplier';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `suppliers` table.
 */

export async function listSuppliers(): Promise<ControllerResult<Supplier[]>> {
  return run(() => supplierService.findAll());
}

export async function getSupplier(id: number): Promise<ControllerResult<Supplier>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid supplier id');
  }
  return run(async () => {
    const supplier = await supplierService.findById(id);
    if (!supplier) throw new Error('Supplier not found');
    return supplier;
  });
}

export async function addSupplier(
  input: NewSupplier
): Promise<ControllerResult<number>> {
  if (!input.supplier_name?.trim()) return fail('Supplier name is required');
  return run(() => supplierService.create(input));
}

export async function editSupplier(
  id: number,
  input: UpdateSupplier
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid supplier id');
  }
  return run(async () => {
    const existing = await supplierService.findById(id);
    if (!existing) throw new Error('Supplier not found');
    await supplierService.update(id, input);
  });
}

export async function deleteSupplier(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid supplier id');
  }
  return run(async () => {
    const existing = await supplierService.findById(id);
    if (!existing) throw new Error('Supplier not found');
    await supplierService.remove(id);
  });
}

export type { Supplier };
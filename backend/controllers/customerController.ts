import * as customerService from '../services/customerService';
import type {
  Customer,
  NewCustomer,
  UpdateCustomer,
} from '../models/Customer';
import type { CustomerWithGroups } from '../models/relationships';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `customers` table.
 * Coordinates validation and calls into the service layer.
 */

export async function listCustomers(): Promise<ControllerResult<Customer[]>> {
  return run(() => customerService.findAll());
}

export async function getCustomer(id: number): Promise<ControllerResult<Customer>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid customer id');
  }
  return run(async () => {
    const customer = await customerService.findById(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  });
}

/**
 * Relationship-aware: returns a customer together with the groups
 * they belong to (loaded through the `customer_group_members` table).
 */
export async function getCustomerWithGroups(
  id: number
): Promise<ControllerResult<CustomerWithGroups>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid customer id');
  }
  return run(async () => {
    const customer = await customerService.findByIdWithGroups(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  });
}

export async function addCustomer(
  input: NewCustomer
): Promise<ControllerResult<number>> {
  if (!input.customer_code?.trim()) return fail('Customer code is required');
  if (!input.first_name?.trim()) return fail('First name is required');
  if (!input.last_name?.trim()) return fail('Last name is required');

  return run(async () => {
    const existing = await customerService.findByCode(input.customer_code);
    if (existing) throw new Error('Customer code already exists');
    return customerService.create(input);
  });
}

export async function editCustomer(
  id: number,
  input: UpdateCustomer
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid customer id');
  }
  return run(async () => {
    const existing = await customerService.findById(id);
    if (!existing) throw new Error('Customer not found');
    await customerService.update(id, input);
  });
}

export async function deleteCustomer(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid customer id');
  }
  return run(async () => {
    const existing = await customerService.findById(id);
    if (!existing) throw new Error('Customer not found');
    await customerService.remove(id);
  });
}

export type { Customer };
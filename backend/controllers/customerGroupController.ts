import * as customerGroupService from '../services/customerGroupService';
import type {
  CustomerGroup,
  NewCustomerGroup,
  UpdateCustomerGroup,
} from '../models/CustomerGroup';
import type { CustomerGroupWithCustomers } from '../models/relationships';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `customer_groups` table.
 * Coordinates validation and calls into the service layer.
 */

export async function listGroups(): Promise<ControllerResult<CustomerGroup[]>> {
  return run(() => customerGroupService.findAll());
}

export async function getGroup(id: number): Promise<ControllerResult<CustomerGroup>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid group id');
  }
  return run(async () => {
    const group = await customerGroupService.findById(id);
    if (!group) throw new Error('Group not found');
    return group;
  });
}

/**
 * Relationship-aware: returns a group together with its member
 * customers and member count.
 */
export async function getGroupWithCustomers(
  id: number
): Promise<ControllerResult<CustomerGroupWithCustomers>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid group id');
  }
  return run(async () => {
    const group = await customerGroupService.findByIdWithCustomers(id);
    if (!group) throw new Error('Group not found');
    return group;
  });
}

export async function addGroup(
  input: NewCustomerGroup
): Promise<ControllerResult<number>> {
  if (!input.group_name?.trim()) return fail('Group name is required');
  return run(() => customerGroupService.create(input));
}

export async function editGroup(
  id: number,
  input: UpdateCustomerGroup
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid group id');
  }
  return run(async () => {
    const existing = await customerGroupService.findById(id);
    if (!existing) throw new Error('Group not found');
    await customerGroupService.update(id, input);
  });
}

export async function deleteGroup(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid group id');
  }
  return run(async () => {
    const existing = await customerGroupService.findById(id);
    if (!existing) throw new Error('Group not found');
    await customerGroupService.remove(id);
  });
}

export type { CustomerGroup };
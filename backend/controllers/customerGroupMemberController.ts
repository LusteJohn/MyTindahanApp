import * as customerGroupMemberService from '../services/customerGroupMemberService';
import * as customerGroupService from '../services/customerGroupService';
import * as customerService from '../services/customerService';
import type {
  CustomerGroupMember,
  NewCustomerGroupMember,
} from '../models/CustomerGroupMember';
import type { CustomerGroupMemberDetail } from '../models/relationships';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `customer_group_members` table.
 * Connects customers to groups and validates that both exist.
 */

export async function listMembers(): Promise<ControllerResult<CustomerGroupMember[]>> {
  return run(() => customerGroupMemberService.findAll());
}

export async function listMembersByGroup(
  groupId: number
): Promise<ControllerResult<CustomerGroupMember[]>> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return fail('Invalid group id');
  }
  return run(() => customerGroupMemberService.findByGroup(groupId));
}

/**
 * Relationship-aware: returns members of a group joined with their
 * full customer and group records in one call.
 */
export async function listMemberDetailsByGroup(
  groupId: number
): Promise<ControllerResult<CustomerGroupMemberDetail[]>> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return fail('Invalid group id');
  }
  return run(() => customerGroupMemberService.findDetailsByGroup(groupId));
}

export async function listMembersByCustomer(
  customerId: number
): Promise<ControllerResult<CustomerGroupMember[]>> {
  if (!Number.isInteger(customerId) || customerId <= 0) {
    return fail('Invalid customer id');
  }
  return run(() => customerGroupMemberService.findByCustomer(customerId));
}

export async function addMember(
  input: NewCustomerGroupMember
): Promise<ControllerResult<number>> {
  if (!Number.isInteger(input.group_id) || input.group_id <= 0) {
    return fail('Invalid group id');
  }
  if (!Number.isInteger(input.customer_id) || input.customer_id <= 0) {
    return fail('Invalid customer id');
  }

  return run(async () => {
    const [group, customer] = await Promise.all([
      customerGroupService.findById(input.group_id),
      customerService.findById(input.customer_id),
    ]);
    if (!group) throw new Error('Group not found');
    if (!customer) throw new Error('Customer not found');

    const existing = await customerGroupMemberService.findByGroup(input.group_id);
    const alreadyMember = existing.some(
      (member) => member.customer_id === input.customer_id
    );
    if (alreadyMember) throw new Error('Customer is already a member of this group');

    return customerGroupMemberService.create(input);
  });
}

export async function removeMember(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid member id');
  }
  return run(() => customerGroupMemberService.remove(id));
}

export async function removeMemberByGroupAndCustomer(
  groupId: number,
  customerId: number
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return fail('Invalid group id');
  }
  if (!Number.isInteger(customerId) || customerId <= 0) {
    return fail('Invalid customer id');
  }
  return run(() =>
    customerGroupMemberService.removeByGroupAndCustomer(groupId, customerId)
  );
}

export type { CustomerGroupMember };
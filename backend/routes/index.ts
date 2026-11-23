/**
 * Route definitions for the customer management "backend".
 *
 * These are not HTTP endpoints: this Expo app talks to an on-device
 * SQLite database, so "routes" here are a typed, named action map that
 * screens and hooks can call directly. Each entry delegates to a
 * controller and returns a `ControllerResult<T>`.
 */

import * as users from '../controllers/userController';
import * as customers from '../controllers/customerController';
import * as groups from '../controllers/customerGroupController';
import * as members from '../controllers/customerGroupMemberController';

export const userRoutes = {
  list: () => users.listUsers(),
  get: (id: number) => users.getUser(id),
  create: (input: Parameters<typeof users.addUser>[0]) => users.addUser(input),
  update: (id: number, input: Parameters<typeof users.editUser>[1]) =>
    users.editUser(id, input),
  remove: (id: number) => users.deleteUser(id),
};

export const customerRoutes = {
  list: () => customers.listCustomers(),
  get: (id: number) => customers.getCustomer(id),
  getWithGroups: (id: number) => customers.getCustomerWithGroups(id),
  create: (input: Parameters<typeof customers.addCustomer>[0]) =>
    customers.addCustomer(input),
  update: (id: number, input: Parameters<typeof customers.editCustomer>[1]) =>
    customers.editCustomer(id, input),
  remove: (id: number) => customers.deleteCustomer(id),
};

export const customerGroupRoutes = {
  list: () => groups.listGroups(),
  get: (id: number) => groups.getGroup(id),
  getWithCustomers: (id: number) => groups.getGroupWithCustomers(id),
  create: (input: Parameters<typeof groups.addGroup>[0]) => groups.addGroup(input),
  update: (id: number, input: Parameters<typeof groups.editGroup>[1]) =>
    groups.editGroup(id, input),
  remove: (id: number) => groups.deleteGroup(id),
};

export const customerGroupMemberRoutes = {
  list: () => members.listMembers(),
  listByGroup: (groupId: number) => members.listMembersByGroup(groupId),
  listDetailsByGroup: (groupId: number) =>
    members.listMemberDetailsByGroup(groupId),
  listByCustomer: (customerId: number) => members.listMembersByCustomer(customerId),
  create: (input: Parameters<typeof members.addMember>[0]) => members.addMember(input),
  remove: (id: number) => members.removeMember(id),
  removeByGroupAndCustomer: (groupId: number, customerId: number) =>
    members.removeMemberByGroupAndCustomer(groupId, customerId),
};

/**
 * Single entry point grouping every route namespace.
 * Import this to reach the whole backend from one place.
 */
export const routes = {
  users: userRoutes,
  customers: customerRoutes,
  customerGroups: customerGroupRoutes,
  customerGroupMembers: customerGroupMemberRoutes,
} as const;

export type Routes = typeof routes;
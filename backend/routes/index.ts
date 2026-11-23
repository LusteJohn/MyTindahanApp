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
import * as categories from '../controllers/categoryController';
import * as products from '../controllers/productController';
import * as inventory from '../controllers/inventoryController';
import * as movements from '../controllers/inventoryMovementController';
import * as suppliers from '../controllers/supplierController';
import * as purchaseOrders from '../controllers/purchaseOrderController';
import * as purchaseOrderItems from '../controllers/purchaseOrderItemController';

export const userRoutes = {
  list: () => users.listUsers(),
  get: (id: number) => users.getUser(id),
  create: (input: Parameters<typeof users.addUser>[0]) => users.addUser(input),
  update: (id: number, input: Parameters<typeof users.editUser>[1]) =>
    users.editUser(id, input),
  remove: (id: number) => users.deleteUser(id),
  authenticate: (credentials: Parameters<typeof users.authenticate>[0]) =>
    users.authenticate(credentials),
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

export const categoryRoutes = {
  list: () => categories.listCategories(),
  get: (id: number) => categories.getCategory(id),
  create: (input: Parameters<typeof categories.addCategory>[0]) =>
    categories.addCategory(input),
  update: (id: number, input: Parameters<typeof categories.editCategory>[1]) =>
    categories.editCategory(id, input),
  remove: (id: number) => categories.deleteCategory(id),
};

export const productRoutes = {
  list: () => products.listProducts(),
  get: (id: number) => products.getProduct(id),
  getDetails: (id: number) => products.getProductDetails(id),
  create: (input: Parameters<typeof products.addProduct>[0]) =>
    products.addProduct(input),
  update: (id: number, input: Parameters<typeof products.editProduct>[1]) =>
    products.editProduct(id, input),
  remove: (id: number) => products.deleteProduct(id),
};

export const inventoryRoutes = {
  list: () => inventory.listInventory(),
  getByProduct: (productId: number) => inventory.getInventoryByProduct(productId),
  create: (input: Parameters<typeof inventory.addInventory>[0]) =>
    inventory.addInventory(input),
  update: (id: number, input: Parameters<typeof inventory.editInventory>[1]) =>
    inventory.editInventory(id, input),
  remove: (id: number) => inventory.deleteInventory(id),
};

export const inventoryMovementRoutes = {
  list: () => movements.listMovements(),
  listByProduct: (productId: number) => movements.listMovementsByProduct(productId),
  // Records a movement and applies it to stock (returns updated inventory).
  record: (input: Parameters<typeof movements.recordMovement>[0]) =>
    movements.recordMovement(input),
  remove: (id: number) => movements.deleteMovement(id),
};

export const supplierRoutes = {
  list: () => suppliers.listSuppliers(),
  get: (id: number) => suppliers.getSupplier(id),
  create: (input: Parameters<typeof suppliers.addSupplier>[0]) =>
    suppliers.addSupplier(input),
  update: (id: number, input: Parameters<typeof suppliers.editSupplier>[1]) =>
    suppliers.editSupplier(id, input),
  remove: (id: number) => suppliers.deleteSupplier(id),
};

export const purchaseOrderRoutes = {
  list: () => purchaseOrders.listPurchaseOrders(),
  get: (id: number) => purchaseOrders.getPurchaseOrder(id),
  create: (input: Parameters<typeof purchaseOrders.addPurchaseOrder>[0]) =>
    purchaseOrders.addPurchaseOrder(input),
  update: (id: number, input: Parameters<typeof purchaseOrders.editPurchaseOrder>[1]) =>
    purchaseOrders.editPurchaseOrder(id, input),
  remove: (id: number) => purchaseOrders.deletePurchaseOrder(id),
};

export const purchaseOrderItemRoutes = {
  list: () => purchaseOrderItems.listItems(),
  listByOrder: (purchaseOrderId: number) =>
    purchaseOrderItems.listItemsByOrder(purchaseOrderId),
  get: (id: number) => purchaseOrderItems.getItem(id),
  create: (input: Parameters<typeof purchaseOrderItems.addItem>[0]) =>
    purchaseOrderItems.addItem(input),
  update: (id: number, input: Parameters<typeof purchaseOrderItems.editItem>[1]) =>
    purchaseOrderItems.editItem(id, input),
  remove: (id: number) => purchaseOrderItems.deleteItem(id),
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
  categories: categoryRoutes,
  products: productRoutes,
  inventory: inventoryRoutes,
  inventoryMovements: inventoryMovementRoutes,
  suppliers: supplierRoutes,
  purchaseOrders: purchaseOrderRoutes,
  purchaseOrderItems: purchaseOrderItemRoutes,
} as const;

export type Routes = typeof routes;
import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION, dbConfig, openDatabase } from './config/db';

/**
 * Schema for the Customer Management + Products & Stocks modules.
 *
 * Tables:
 *  - users                  Store owner and authorized staff accounts
 *  - customers              Customer information
 *  - customer_groups        Groups of customers (family, neighbors, ...)
 *  - customer_group_members Connect customers to their respective groups
 *  - categories             Product categories
 *  - products               Products sold by the store
 *  - inventory              Current stock levels per product
 *  - inventory_movements    Stock In / Out / Adjustment history
 *  - suppliers              Product suppliers
 *  - purchase_orders        Purchase orders placed to suppliers
 *  - purchase_order_items   Line items belonging to a purchase order
 */

export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'staff',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_CUSTOMERS_TABLE = `
CREATE TABLE IF NOT EXISTS customers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_code  TEXT    NOT NULL UNIQUE,
  first_name     TEXT    NOT NULL,
  last_name      TEXT    NOT NULL,
  contact_number TEXT,
  address        TEXT,
  credit_limit   REAL    NOT NULL DEFAULT 0,
  status         TEXT    NOT NULL DEFAULT 'active',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_CUSTOMER_GROUPS_TABLE = `
CREATE TABLE IF NOT EXISTS customer_groups (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name  TEXT    NOT NULL,
  description TEXT,
  status      TEXT    NOT NULL DEFAULT 'active',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_CUSTOMER_GROUP_MEMBERS_TABLE = `
CREATE TABLE IF NOT EXISTS customer_group_members (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id    INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  joined_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (group_id) REFERENCES customer_groups (id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  UNIQUE (group_id, customer_id)
);
`;

/* ------------------------------------------------------------------ *
 * Products & Stocks module
 * ------------------------------------------------------------------ */

export const CREATE_CATEGORIES_TABLE = `
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT  NOT NULL UNIQUE,
  description TEXT,
  status      TEXT    NOT NULL DEFAULT 'active',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_PRODUCTS_TABLE = `
CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id   INTEGER,
  product_name  TEXT    NOT NULL,
  barcode       TEXT,
  description   TEXT,
  cost_price    REAL    NOT NULL DEFAULT 0,
  selling_price REAL    NOT NULL DEFAULT 0,
  unit          TEXT    NOT NULL DEFAULT 'pc',
  status        TEXT    NOT NULL DEFAULT 'active',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);
`;

export const CREATE_INVENTORY_TABLE = `
CREATE TABLE IF NOT EXISTS inventory (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id    INTEGER NOT NULL UNIQUE,
  quantity      REAL    NOT NULL DEFAULT 0,
  reorder_level REAL    NOT NULL DEFAULT 0,
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
`;

export const CREATE_INVENTORY_MOVEMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS inventory_movements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id     INTEGER NOT NULL,
  movement_type  TEXT    NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity       REAL    NOT NULL,
  reference_type TEXT,
  reference_id   INTEGER,
  remarks        TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
`;

export const CREATE_SUPPLIERS_TABLE = `
CREATE TABLE IF NOT EXISTS suppliers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_name  TEXT    NOT NULL,
  contact_number TEXT,
  address        TEXT,
  email          TEXT,
  status         TEXT    NOT NULL DEFAULT 'active',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_PURCHASE_ORDERS_TABLE = `
CREATE TABLE IF NOT EXISTS purchase_orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id  INTEGER,
  order_number TEXT    NOT NULL UNIQUE,
  order_date   TEXT    NOT NULL DEFAULT (datetime('now')),
  status       TEXT    NOT NULL DEFAULT 'pending',
  total_amount REAL    NOT NULL DEFAULT 0,
  remarks      TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
);
`;

export const CREATE_PURCHASE_ORDER_ITEMS_TABLE = `
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_order_id INTEGER NOT NULL,
  product_id        INTEGER NOT NULL,
  quantity          REAL    NOT NULL,
  cost_price        REAL    NOT NULL DEFAULT 0,
  subtotal          REAL    NOT NULL DEFAULT 0,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
`;

const SCHEMA_STATEMENTS = [
  CREATE_USERS_TABLE,
  CREATE_CUSTOMERS_TABLE,
  CREATE_CUSTOMER_GROUPS_TABLE,
  CREATE_CUSTOMER_GROUP_MEMBERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_PRODUCTS_TABLE,
  CREATE_INVENTORY_TABLE,
  CREATE_INVENTORY_MOVEMENTS_TABLE,
  CREATE_SUPPLIERS_TABLE,
  CREATE_PURCHASE_ORDERS_TABLE,
  CREATE_PURCHASE_ORDER_ITEMS_TABLE,
];

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Returns the shared database connection, creating it if needed.
 * Prefer this over calling `openDatabaseAsync` directly so the schema
 * is guaranteed to exist.
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = initializeDatabase();
  }
  dbInstance = await initPromise;
  return dbInstance;
}

/**
 * Opens the database and ensures every table exists.
 * Safe to call multiple times; the work is memoized.
 */
export async function initializeDatabase(): Promise<SQLiteDatabase> {
  const db = await openDatabase();

  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  for (const statement of SCHEMA_STATEMENTS) {
    await db.execAsync(statement);
  }

  // PRAGMA statements do not support bind parameters, so the (trusted,
  // numeric) version constant is inlined directly.
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);

  dbInstance = db;
  return db;
}

/**
 * Closes the cached connection. Mainly useful for tests or resets.
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
  }
}

export { dbConfig };
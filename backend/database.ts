import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION, dbConfig, openDatabase } from './config/db';

/**
 * Schema for the Customer Management module.
 *
 * Tables:
 *  - users                  Store owner and authorized staff accounts
 *  - customers              Customer information
 *  - customer_groups        Groups of customers (family, neighbors, ...)
 *  - customer_group_members Connect customers to their respective groups
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

const SCHEMA_STATEMENTS = [
  CREATE_USERS_TABLE,
  CREATE_CUSTOMERS_TABLE,
  CREATE_CUSTOMER_GROUPS_TABLE,
  CREATE_CUSTOMER_GROUP_MEMBERS_TABLE,
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

  await db.runAsync('PRAGMA user_version = ?', [DATABASE_VERSION]);

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
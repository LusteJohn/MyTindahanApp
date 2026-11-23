import * as SQLite from 'expo-sqlite';

/**
 * Database configuration for the Customer Management module.
 *
 * This Expo app runs on-device (Android / iOS / Web), so the "backend"
 * is a local SQLite database provided by `expo-sqlite`. The values here
 * are shared by the connection helpers in `backend/database.ts`.
 */

export const DATABASE_NAME = 'mytindahan.db';

export const DATABASE_VERSION = 1;

/**
 * Table names kept in one place so models/services/controllers never
 * hardcode raw strings.
 */
export const TABLES = {
  users: 'users',
  customers: 'customers',
  customerGroups: 'customer_groups',
  customerGroupMembers: 'customer_group_members',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];

export interface DbConfig {
  name: string;
  version: number;
}

export const dbConfig: DbConfig = {
  name: DATABASE_NAME,
  version: DATABASE_VERSION,
};

/**
 * Opens (or creates) the shared SQLite database using the async API.
 * Callers are expected to await `initializeDatabase()` afterwards to
 * ensure the schema exists.
 */
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(dbConfig.name);
}
/**
 * Backend module entry point.
 *
 * Local (on-device) backend for the Customer Management module, backed by
 * `expo-sqlite`. Layers:
 *
 *   config/      -> database name, version, table constants
 *   database.ts  -> connection + schema creation for the 4 tables
 *   models/      -> TypeScript row types
 *   services/    -> direct SQL access (CRUD)
 *   controllers/ -> validation + orchestration, returns ControllerResult
 *   routes/      -> named action map screens/hooks call
 */

export * from './database';
export { initializeBackend, seedDefaultOwner, DEFAULT_OWNER } from './seed';
export { hashPassword, verifyPassword } from './utils/password';
export { routes } from './routes';
export type { Routes } from './routes';
export type * from './models';
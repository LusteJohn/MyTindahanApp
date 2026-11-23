/**
 * Shared result type returned by every controller so that callers
 * (routes / screens) get a consistent, awaitable response shape
 * instead of throwing across layers.
 */

export type ControllerResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): ControllerResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): ControllerResult<T> {
  return { ok: false, error };
}

/**
 * Wraps an async controller action so unexpected errors become
 * a `fail` result instead of an unhandled rejection.
 */
export async function run<T>(
  action: () => Promise<T>
): Promise<ControllerResult<T>> {
  try {
    return ok(await action());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(message);
  }
}
import { ZodType } from 'zod';

import { AppError } from '@/core/errors/app-error';
import { fail, ok, type Result } from '@/core/result/result';

/**
 * Validates an unknown value against a Zod schema, mapping failures
 * into a domain-level Validation AppError. Used at the data boundary
 * so malformed API responses never crash the app or leak into the UI.
 */
export function parseWith<T>(schema: ZodType<T>, data: unknown): Result<T> {
  try {
    return ok(schema.parse(data));
  } catch {
    return fail(new AppError('validation', 'The server returned an invalid response.'));
  }
}

import type { AppError } from '@/core/errors/app-error';

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T>(error: AppError): Result<T> {
  return { ok: false, error };
}

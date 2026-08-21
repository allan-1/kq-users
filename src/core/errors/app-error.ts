export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'server'
  | 'notFound'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'rateLimited'
  | 'unknown';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(kind: AppErrorKind, message: string, options?: { statusCode?: number }) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.statusCode = options?.statusCode;
    this.retryable =
      kind === 'network' ||
      kind === 'timeout' ||
      kind === 'server' ||
      kind === 'rateLimited';
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

export const isRetryable = (error: unknown): boolean =>
  isAppError(error) ? error.retryable : false;

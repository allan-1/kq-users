import type { AppError } from '@/core/errors/app-error';

const MESSAGES: Record<AppError['kind'], string> = {
  network: 'You appear to be offline. Please check your connection and try again.',
  timeout: 'The request timed out. Please try again.',
  server: 'Something went wrong on our end. Please try again shortly.',
  notFound: 'The requested content could not be found.',
  validation: 'The data received was invalid. Please try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: "You don't have permission to view this content.",
  rateLimited: 'Too many requests. Please try again in a moment.',
  unknown: 'Something went wrong. Please try again.',
};

export function toUserMessage(error: AppError): string {
  return MESSAGES[error.kind] ?? MESSAGES.unknown;
}

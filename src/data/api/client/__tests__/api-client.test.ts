import { AxiosError, AxiosHeaders } from 'axios';

import { toAppError } from '@/data/api/client/api-client';

function axiosError(code?: string, status?: number): AxiosError {
  return new AxiosError(
    'message',
    code,
    { headers: new AxiosHeaders() },
    undefined,
    status
      ? {
          status,
          statusText: 'status',
          headers: {},
          config: { headers: new AxiosHeaders() },
          data: {},
        }
      : undefined,
  );
}

describe('toAppError', () => {
  it('maps 404 to notFound', () => {
    expect(toAppError(axiosError('ERR_BAD_REQUEST', 404)).kind).toBe('notFound');
  });

  it('maps 400 to validation', () => {
    expect(toAppError(axiosError('ERR_BAD_REQUEST', 400)).kind).toBe('validation');
  });

  it('maps 401 to unauthorized', () => {
    expect(toAppError(axiosError('ERR_BAD_REQUEST', 401)).kind).toBe('unauthorized');
  });

  it('maps 403 to forbidden', () => {
    expect(toAppError(axiosError('ERR_BAD_REQUEST', 403)).kind).toBe('forbidden');
  });

  it('maps 408 to timeout', () => {
    expect(toAppError(axiosError('ECONNABORTED', 408)).kind).toBe('timeout');
  });

  it('maps 429 to rateLimited', () => {
    expect(toAppError(axiosError('ERR_BAD_RESPONSE', 429)).kind).toBe('rateLimited');
  });

  it('maps 500 to server', () => {
    expect(toAppError(axiosError('ERR_BAD_RESPONSE', 500)).kind).toBe('server');
  });

  it('maps 502/503/504 to server', () => {
    expect(toAppError(axiosError('ERR_BAD_RESPONSE', 502)).kind).toBe('server');
    expect(toAppError(axiosError('ERR_BAD_RESPONSE', 503)).kind).toBe('server');
    expect(toAppError(axiosError('ERR_BAD_RESPONSE', 504)).kind).toBe('server');
  });

  it('maps ECONNABORTED to timeout', () => {
    expect(toAppError(axiosError('ECONNABORTED')).kind).toBe('timeout');
  });

  it('maps network codes to network', () => {
    expect(toAppError(axiosError('ERR_NETWORK')).kind).toBe('network');
    expect(toAppError(axiosError('ENOTFOUND')).kind).toBe('network');
    expect(toAppError(axiosError('ECONNREFUSED')).kind).toBe('network');
  });

  it('maps unknown errors to unknown', () => {
    expect(toAppError(new Error('whatever')).kind).toBe('unknown');
  });

  it('marks retryable errors as retryable', () => {
    expect(toAppError(axiosError('ERR_NETWORK')).retryable).toBe(true);
    expect(toAppError(axiosError('ERR_BAD_REQUEST', 404)).retryable).toBe(false);
  });
});
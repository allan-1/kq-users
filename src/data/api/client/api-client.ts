import { AxiosError, AxiosInstance, AxiosRequestConfig, create, isAxiosError, isCancel } from 'axios';

import { API_CONFIG } from '@/config/api';
import { AppError } from '@/core/errors/app-error';
import { logger } from '@/core/logger/logger';
import { fail, ok, type Result } from '@/core/result/result';

export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T>>;
}

export function createApiClient(baseUrl = API_CONFIG.baseUrl, timeoutMs = API_CONFIG.timeoutMs): ApiClient {
  const instance: AxiosInstance = create({
    baseURL: baseUrl,
    timeout: timeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    logger.debug('api-request-started', { url: config.url, method: config.method });
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      logger.debug('api-request-succeeded', { url: response.config.url, status: response.status });
      return response;
    },
    (error: AxiosError) => {
      logger.debug('api-request-failed', { url: error.config?.url, code: error.code, status: error.response?.status });
      return Promise.reject(error);
    },
  );

  return {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
      try {
        const response = await instance.get<T>(url, config);
        return ok(response.data);
      } catch (error) {
        return fail(toAppError(error));
      }
    },
  };
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isCancel(error)) {
    return new AppError('network', 'Request was cancelled.');
  }

  if (isAxiosError(error)) {
    const code = error.code;
    const status = error.response?.status;

    if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
      return new AppError('timeout', 'The request timed out.', { statusCode: status });
    }

    if (
      code === 'ERR_NETWORK' ||
      code === 'ENOTFOUND' ||
      code === 'ECONNREFUSED' ||
      code === 'EAI_AGAIN' ||
      code === 'ERR_HTTP2' ||
      code === 'UND_ERR_CONNECT_TIMEOUT'
    ) {
      return new AppError('network', 'A network error occurred.', { statusCode: status });
    }

    switch (status) {
      case 400:
        return new AppError('validation', 'The request was invalid.', { statusCode: status });
      case 401:
        return new AppError('unauthorized', 'Authentication failed.', { statusCode: status });
      case 403:
        return new AppError('forbidden', 'Access forbidden.', { statusCode: status });
      case 404:
        return new AppError('notFound', 'Not found.', { statusCode: status });
      case 408:
        return new AppError('timeout', 'The request timed out.', { statusCode: status });
      case 429:
        return new AppError('rateLimited', 'Too many requests.', { statusCode: status });
      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError('server', 'Server error.', { statusCode: status });
      default:
        return new AppError('unknown', 'An unexpected error occurred.', { statusCode: status });
    }
  }

  return new AppError('unknown', 'An unexpected error occurred.');
}

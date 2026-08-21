import { Platform } from 'react-native';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = __DEV__;

function write(level: LogLevel, message: string, data?: unknown) {
  if (!isDev) return;

  const entry: Record<string, unknown> = {
    level,
    message,
    time: new Date().toISOString(),
    platform: Platform.OS,
  };

  if (data !== undefined) {
    entry.data = data;
  }

  switch (level) {
    case 'debug':
      console.debug('[kq]', message, data ?? '');
      break;
    case 'info':
      console.log('[kq]', message, data ?? '');
      break;
    case 'warn':
      console.warn('[kq]', message, data ?? '');
      break;
    case 'error':
      console.error('[kq]', message, data ?? '');
      break;
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => write('debug', message, data),
  info: (message: string, data?: unknown) => write('info', message, data),
  warn: (message: string, data?: unknown) => write('warn', message, data),
  error: (message: string, data?: unknown) => write('error', message, data),
};

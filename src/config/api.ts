export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
  timeoutMs: 10000,
} as const;

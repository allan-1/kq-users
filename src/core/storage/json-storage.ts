import type { Storage } from '@/core/storage/storage';

export interface JsonStorage {
  getJson<T>(key: string): Promise<T | null>;
  setJson<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createJsonStorage(storage: Storage): JsonStorage {
  return {
    async getJson<T>(key: string): Promise<T | null> {
      const raw = await storage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    async setJson<T>(key: string, value: T): Promise<void> {
      await storage.setItem(key, JSON.stringify(value));
    },
    async remove(key: string): Promise<void> {
      await storage.removeItem(key);
    },
  };
}

import { createJsonStorage, type JsonStorage } from '@/core/storage/json-storage';
import type { Storage } from '@/core/storage/storage';

export interface CacheEntry<T> {
  data: T;
  updatedAt: number;
}

export const NEVER_SYNCED = 0;

/**
 * A typed, timestamped cache built on top of the injected Storage.
 * All values are stored as domain models; nothing here knows about
 * the API wire format.
 */
export class TimestampedCache {
  private readonly json: JsonStorage;

  constructor(storage: Storage) {
    this.json = createJsonStorage(storage);
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    return this.json.getJson<CacheEntry<T>>(key);
  }

  async set<T>(key: string, data: T, updatedAt: number = Date.now()): Promise<void> {
    const entry: CacheEntry<T> = { data, updatedAt };
    await this.json.setJson(key, entry);
  }

  async getUpdatedAt(key: string): Promise<number> {
    const entry = await this.json.getJson<CacheEntry<unknown>>(key);
    return entry?.updatedAt ?? NEVER_SYNCED;
  }

  async remove(key: string): Promise<void> {
    await this.json.remove(key);
  }
}

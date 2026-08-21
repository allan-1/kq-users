import type { Storage } from '@/core/storage/storage';

export class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.map.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.map.delete(key);
  }

  async multiGet(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const key of keys) {
      const value = this.map.get(key);
      if (value !== undefined) result[key] = value;
    }
    return result;
  }

  async multiRemove(keys: string[]): Promise<void> {
    for (const key of keys) this.map.delete(key);
  }
}
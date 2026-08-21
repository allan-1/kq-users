import type { CacheEntry, TimestampedCache } from '@/data/local/cache/timestamped-cache';
import type { User } from '@/domain/models/user';

const USERS_KEY = 'cache:users';

export interface UserLocalDataSource {
  getUsers(): Promise<CacheEntry<User[]> | null>;
  setUsers(users: User[]): Promise<void>;
  getUsersUpdatedAt(): Promise<number>;
  getUserById(id: number): Promise<{ entry: CacheEntry<User>; updatedAt: number } | null>;
}

export function createUserLocalDataSource(cache: TimestampedCache): UserLocalDataSource {
  return {
    async getUsers() {
      return cache.get<User[]>(USERS_KEY);
    },

    async setUsers(users) {
      await cache.set(USERS_KEY, users);
    },

    async getUsersUpdatedAt() {
      return cache.getUpdatedAt(USERS_KEY);
    },

    async getUserById(id) {
      const entry = await cache.get<User[]>(USERS_KEY);
      if (!entry) return null;
      const user = entry.data.find((u) => u.id === id);
      if (!user) return null;
      return { entry: { data: user, updatedAt: entry.updatedAt }, updatedAt: entry.updatedAt };
    },
  };
}

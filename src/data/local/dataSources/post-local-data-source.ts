import type { CacheEntry, TimestampedCache } from '@/data/local/cache/timestamped-cache';
import type { Post } from '@/domain/models/post';

function postsKey(userId: number) {
  return `cache:posts:${userId}`;
}

export interface PostLocalDataSource {
  getPostsByUser(userId: number): Promise<CacheEntry<Post[]> | null>;
  setPosts(userId: number, posts: Post[]): Promise<void>;
  getPostById(userId: number, id: number): Promise<Post | null>;
  getPostsUpdatedAt(userId: number): Promise<number>;
}

export function createPostLocalDataSource(cache: TimestampedCache): PostLocalDataSource {
  return {
    async getPostsByUser(userId) {
      return cache.get<Post[]>(postsKey(userId));
    },

    async setPosts(userId, posts) {
      await cache.set(postsKey(userId), posts);
    },

    async getPostById(userId, id) {
      const entry = await cache.get<Post[]>(postsKey(userId));
      return entry?.data.find((p) => p.id === id) ?? null;
    },

    async getPostsUpdatedAt(userId) {
      return cache.getUpdatedAt(postsKey(userId));
    },
  };
}

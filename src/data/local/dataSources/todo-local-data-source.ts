import type { CacheEntry, TimestampedCache } from '@/data/local/cache/timestamped-cache';
import type { Todo } from '@/domain/models/todo';

function todosKey(userId: number) {
  return `cache:todos:${userId}`;
}

export interface TodoLocalDataSource {
  getTodosByUser(userId: number): Promise<CacheEntry<Todo[]> | null>;
  setTodos(userId: number, todos: Todo[]): Promise<void>;
  getTodosUpdatedAt(userId: number): Promise<number>;
}

export function createTodoLocalDataSource(cache: TimestampedCache): TodoLocalDataSource {
  return {
    async getTodosByUser(userId) {
      return cache.get<Todo[]>(todosKey(userId));
    },

    async setTodos(userId, todos) {
      await cache.set(todosKey(userId), todos);
    },

    async getTodosUpdatedAt(userId) {
      return cache.getUpdatedAt(todosKey(userId));
    },
  };
}

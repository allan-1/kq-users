import type { NetworkMonitor } from '@/core/network/network-monitor';
import { AppError } from '@/core/errors/app-error';
import { fail } from '@/core/result/result';
import { isStaleTimestamp } from '@/core/utils/time';
import type { UserRemoteDataSource } from '@/data/api/dataSources/user-remote-data-source';
import type { PostRemoteDataSource } from '@/data/api/dataSources/post-remote-data-source';
import type { TodoRemoteDataSource } from '@/data/api/dataSources/todo-remote-data-source';
import type { UserLocalDataSource } from '@/data/local/dataSources/user-local-data-source';
import type { PostLocalDataSource } from '@/data/local/dataSources/post-local-data-source';
import type { TodoLocalDataSource } from '@/data/local/dataSources/todo-local-data-source';
import { ReactiveStore } from '@/data/repositories/reactive-store';
import { RefreshCoordinator } from '@/data/repositories/refresh-coordinator';
import type { DataSource, LoadResult } from '@/domain/models/load-result';
import type { Post } from '@/domain/models/post';
import type { Todo } from '@/domain/models/todo';
import type { User } from '@/domain/models/user';
import type { UserRepository } from '@/domain/repositories/user-repository';

const USERS_KEY = 'users';

function loaded<T>(data: T, source: DataSource, updatedAt: number): LoadResult<T> {
  return { ok: true, data: { data, source, updatedAt } };
}

export class RestUserRepository implements UserRepository {
  private readonly store = new ReactiveStore();
  private readonly coordinator = new RefreshCoordinator();

  constructor(
    private readonly remote: UserRemoteDataSource,
    private readonly postRemote: PostRemoteDataSource,
    private readonly todoRemote: TodoRemoteDataSource,
    private readonly local: UserLocalDataSource,
    private readonly postLocal: PostLocalDataSource,
    private readonly todoLocal: TodoLocalDataSource,
    private readonly network: NetworkMonitor,
  ) {}

  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }

  getSnapshot<T>(key: string): LoadResult<T> | undefined {
    return this.store.get<T>(key);
  }

  private offlineError(): LoadResult<never> {
    return fail(new AppError('network', 'You are offline.'));
  }

  async getUsers(): Promise<LoadResult<User[]>> {
    const cached = await this.local.getUsers();

    if (this.network.isOnline()) {
      if (cached) {
        const result = loaded(cached.data, 'cached', cached.updatedAt);
        this.store.set(USERS_KEY, result);
        if (isStaleTimestamp(cached.updatedAt)) {
          void this.refreshUsers();
        }
        return result;
      }

      return this.fetchAndCacheUsers();
    }

    if (cached) {
      const result = loaded(cached.data, 'cached', cached.updatedAt);
      this.store.set(USERS_KEY, result);
      return result;
    }

    return this.offlineError();
  }

  async refreshUsers(): Promise<LoadResult<User[]>> {
    return this.coordinator.run('refresh:users', () => this.fetchAndCacheUsers());
  }

  private async fetchAndCacheUsers(): Promise<LoadResult<User[]>> {
    const remote = await this.remote.fetchUsers();
    if (!remote.ok) {
      const cached = await this.local.getUsers();
      if (cached) {
        const result = loaded(cached.data, 'cached', cached.updatedAt);
        this.store.set(USERS_KEY, result);
        return result;
      }
      this.store.set(USERS_KEY, remote);
      return remote;
    }

    await this.local.setUsers(remote.data);
    const updatedAt = await this.local.getUsersUpdatedAt();
    const result = loaded(remote.data, 'fresh', updatedAt);
    this.store.set(USERS_KEY, result);
    return result;
  }

  async getUserById(id: number): Promise<LoadResult<User>> {
    const key = `user:${id}`;

    if (this.network.isOnline()) {
      const remote = await this.remote.fetchUserById(id);
      if (remote.ok) {
        const users = await this.local.getUsers();
        if (users) {
          const merged = upsert(users.data, remote.data);
          await this.local.setUsers(merged);
        }
        const result = loaded(remote.data, 'fresh', Date.now());
        this.store.set(key, result);
        return result;
      }
      const found = await this.local.getUserById(id);
      if (found) {
        return loaded(found.entry.data, 'cached', found.updatedAt);
      }
      return remote;
    }

    const found = await this.local.getUserById(id);
    if (found) {
      return loaded(found.entry.data, 'cached', found.updatedAt);
    }
    return this.offlineError();
  }

  async getUserPosts(userId: number): Promise<LoadResult<Post[]>> {
    const key = `posts:${userId}`;
    const cached = await this.postLocal.getPostsByUser(userId);

    if (this.network.isOnline()) {
      if (cached) {
        const result = loaded(cached.data, 'cached', cached.updatedAt);
        this.store.set(key, result);
        if (isStaleTimestamp(cached.updatedAt)) {
          void this.refreshUserPosts(userId);
        }
        return result;
      }
      return this.fetchAndCachePosts(userId);
    }

    if (cached) {
      const result = loaded(cached.data, 'cached', cached.updatedAt);
      this.store.set(key, result);
      return result;
    }
    return this.offlineError();
  }

  async refreshUserPosts(userId: number): Promise<LoadResult<Post[]>> {
    return this.coordinator.run(`refresh:posts:${userId}`, () => this.fetchAndCachePosts(userId));
  }

  private async fetchAndCachePosts(userId: number): Promise<LoadResult<Post[]>> {
    const key = `posts:${userId}`;
    const remote = await this.postRemote.fetchPostsByUser(userId);
    if (!remote.ok) {
      const cached = await this.postLocal.getPostsByUser(userId);
      if (cached) {
        const result = loaded(cached.data, 'cached', cached.updatedAt);
        this.store.set(key, result);
        return result;
      }
      this.store.set(key, remote);
      return remote;
    }

    await this.postLocal.setPosts(userId, remote.data);
    const updatedAt = await this.postLocal.getPostsUpdatedAt(userId);
    const result = loaded(remote.data, 'fresh', updatedAt);
    this.store.set(key, result);
    return result;
  }

  async getUserTodos(userId: number): Promise<LoadResult<Todo[]>> {
    const key = `todos:${userId}`;
    const cached = await this.todoLocal.getTodosByUser(userId);

    if (this.network.isOnline()) {
      if (cached) {
        const result = loaded(cached.data, 'cached', cached.updatedAt);
        this.store.set(key, result);
        if (isStaleTimestamp(cached.updatedAt)) {
          void this.refreshUserTodos(userId);
        }
        return result;
      }
      return this.fetchAndCacheTodos(userId);
    }

    if (cached) {
      const result = loaded(cached.data, 'cached', cached.updatedAt);
      this.store.set(key, result);
      return result;
    }
    return this.offlineError();
  }

  async refreshUserTodos(userId: number): Promise<LoadResult<Todo[]>> {
    return this.coordinator.run(`refresh:todos:${userId}`, () => this.fetchAndCacheTodos(userId));
  }

  private async fetchAndCacheTodos(userId: number): Promise<LoadResult<Todo[]>> {
    const key = `todos:${userId}`;
    const remote = await this.todoRemote.fetchTodosByUser(userId);
    if (!remote.ok) {
      const cached = await this.todoLocal.getTodosByUser(userId);
      if (cached) {
        const result = loaded(cached.data, 'cached', cached.updatedAt);
        this.store.set(key, result);
        return result;
      }
      this.store.set(key, remote);
      return remote;
    }

    await this.todoLocal.setTodos(userId, remote.data);
    const updatedAt = await this.todoLocal.getTodosUpdatedAt(userId);
    const result = loaded(remote.data, 'fresh', updatedAt);
    this.store.set(key, result);
    return result;
  }
}

function upsert(users: User[], user: User): User[] {
  const index = users.findIndex((u) => u.id === user.id);
  if (index === -1) return [...users, user];
  const copy = [...users];
  copy[index] = user;
  return copy;
}
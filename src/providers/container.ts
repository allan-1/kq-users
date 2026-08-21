import { asyncStorageAdapter } from '@/core/storage/async-storage';
import { TimestampedCache } from '@/data/local/cache/timestamped-cache';
import { createUserLocalDataSource } from '@/data/local/dataSources/user-local-data-source';
import { createPostLocalDataSource } from '@/data/local/dataSources/post-local-data-source';
import { createTodoLocalDataSource } from '@/data/local/dataSources/todo-local-data-source';
import { createApiClient, type ApiClient } from '@/data/api/client/api-client';
import { createUserRemoteDataSource } from '@/data/api/dataSources/user-remote-data-source';
import { createPostRemoteDataSource } from '@/data/api/dataSources/post-remote-data-source';
import { createTodoRemoteDataSource } from '@/data/api/dataSources/todo-remote-data-source';
import { RestUserRepository } from '@/data/repositories/rest-user-repository';
import { RestPostRepository } from '@/data/repositories/rest-post-repository';
import type { UserRepository } from '@/domain/repositories/user-repository';
import type { PostRepository } from '@/domain/repositories/post-repository';
import type { LoadResult } from '@/domain/models/load-result';
import type { Post } from '@/domain/models/post';
import type { Todo } from '@/domain/models/todo';
import type { User } from '@/domain/models/user';
import type { NetworkMonitor } from '@/core/network/network-monitor';

export interface UserRepositoryFacade extends UserRepository {
  subscribe(listener: () => void): () => void;
  getSnapshot<T>(key: string): LoadResult<T> | undefined;
  refreshUsers(): Promise<LoadResult<User[]>>;
  refreshUserPosts(userId: number): Promise<LoadResult<Post[]>>;
  refreshUserTodos(userId: number): Promise<LoadResult<Todo[]>>;
}

export interface Container {
  api: ApiClient;
  network: NetworkMonitor;
  userRepository: UserRepositoryFacade;
  postRepository: PostRepository;
}

export function createContainer(network: NetworkMonitor): Container {
  const api = createApiClient();
  const cache = new TimestampedCache(asyncStorageAdapter);

  const userLocal = createUserLocalDataSource(cache);
  const postLocal = createPostLocalDataSource(cache);
  const todoLocal = createTodoLocalDataSource(cache);

  const userRemote = createUserRemoteDataSource(api);
  const postRemote = createPostRemoteDataSource(api);
  const todoRemote = createTodoRemoteDataSource(api);

  const userRepository = new RestUserRepository(
    userRemote,
    postRemote,
    todoRemote,
    userLocal,
    postLocal,
    todoLocal,
    network,
  );

  const postRepository = new RestPostRepository(postRemote, postLocal, network);

  return { api, network, userRepository, postRepository };
}

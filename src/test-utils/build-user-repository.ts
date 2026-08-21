import { TimestampedCache } from '@/data/local/cache/timestamped-cache';
import { createUserLocalDataSource } from '@/data/local/dataSources/user-local-data-source';
import { createPostLocalDataSource } from '@/data/local/dataSources/post-local-data-source';
import { createTodoLocalDataSource } from '@/data/local/dataSources/todo-local-data-source';
import { RestUserRepository } from '@/data/repositories/rest-user-repository';
import type { MemoryStorage } from '@/test-utils/memory-storage';
import { FakeNetworkMonitor } from '@/test-utils/fake-network-monitor';

export interface UserRepositoryHarness {
  repo: RestUserRepository;
  remote: {
    fetchUsers: jest.Mock;
    fetchUserById: jest.Mock;
  };
  postRemote: {
    fetchPostById: jest.Mock;
    fetchPostsByUser: jest.Mock;
  };
  todoRemote: {
    fetchTodosByUser: jest.Mock;
  };
  network: FakeNetworkMonitor;
  storage: MemoryStorage;
}

export function buildUserRepository(storage: MemoryStorage): UserRepositoryHarness {
  const network = new FakeNetworkMonitor();
  const cache = new TimestampedCache(storage);

  const remote = {
    fetchUsers: jest.fn(),
    fetchUserById: jest.fn(),
  };
  const postRemote = {
    fetchPostById: jest.fn(),
    fetchPostsByUser: jest.fn(),
  };
  const todoRemote = {
    fetchTodosByUser: jest.fn(),
  };

  const repo = new RestUserRepository(
    remote,
    postRemote,
    todoRemote,
    createUserLocalDataSource(cache),
    createPostLocalDataSource(cache),
    createTodoLocalDataSource(cache),
    network,
  );

  return { repo, remote, postRemote, todoRemote, network, storage };
}
import { AppError } from '@/core/errors/app-error';
import { fail, ok } from '@/core/result/result';
import { MemoryStorage } from '@/test-utils/memory-storage';
import { buildUserRepository } from '@/test-utils/build-user-repository';
import type { User } from '@/domain/models/user';
import type { Post } from '@/domain/models/post';
import type { Todo } from '@/domain/models/todo';

const user: User = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'sincere@april.biz',
  phone: '1-770-736-8031',
  website: 'hildegard.org',
  address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998', geo: { lat: '1', lng: '2' } },
  company: { name: 'Romaguera-Crona', catchPhrase: 'c', bs: 'b' },
};

const posts: Post[] = [{ id: 1, userId: 1, title: 'Hello', body: 'World' }];
const todos: Todo[] = [{ id: 1, userId: 1, title: 'Task', completed: false }];

function seedUsers(storage: MemoryStorage, users: User[], updatedAt = 123456789) {
  storage.setItem('cache:users', JSON.stringify({ data: users, updatedAt }));
}

function seedPosts(storage: MemoryStorage, userId: number, list: Post[], updatedAt = 100000) {
  storage.setItem(`cache:posts:${userId}`, JSON.stringify({ data: list, updatedAt }));
}

function flush() {
  return new Promise((resolve) => setImmediate(() => resolve(undefined)));
}

describe('RestUserRepository — getUsers', () => {
  it('returns fresh data and updates the cache when online and the API succeeds', async () => {
    const storage = new MemoryStorage();
    const { repo, remote } = buildUserRepository(storage);
    remote.fetchUsers.mockResolvedValue(ok([user]));

    const result = await repo.getUsers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.source).toBe('fresh');
      expect(result.data.data).toEqual([user]);
    }
    const cached = JSON.parse((await storage.getItem('cache:users'))!);
    expect(cached.data).toEqual([user]);
  });

  it('returns cached data when online but the API fails and cache exists', async () => {
    const storage = new MemoryStorage();
    const { repo, remote } = buildUserRepository(storage);
    seedUsers(storage, [user]);
    remote.fetchUsers.mockResolvedValue(fail(new AppError('server', 'boom')));

    const result = await repo.getUsers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.source).toBe('cached');
      expect(result.data.data).toEqual([user]);
    }
  });

  it('returns the error when online, API fails, and no cache exists', async () => {
    const storage = new MemoryStorage();
    const { repo, remote } = buildUserRepository(storage);
    remote.fetchUsers.mockResolvedValue(fail(new AppError('server', 'boom')));

    const result = await repo.getUsers();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('server');
  });

  it('returns cached data when offline and cache exists', async () => {
    const storage = new MemoryStorage();
    const { repo, network } = buildUserRepository(storage);
    seedUsers(storage, [user], 999);
    network.setOnline(false);

    const result = await repo.getUsers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.source).toBe('cached');
      expect(result.data.updatedAt).toBe(999);
      expect(result.data.data).toEqual([user]);
    }
  });

  it('returns a network error when offline and no cache exists', async () => {
    const storage = new MemoryStorage();
    const { repo, network } = buildUserRepository(storage);
    network.setOnline(false);

    const result = await repo.getUsers();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('network');
  });

  it('serves cached data immediately and revalidates in the background when online', async () => {
    const storage = new MemoryStorage();
    const { repo, remote } = buildUserRepository(storage);
    seedUsers(storage, [user], 111);
    remote.fetchUsers.mockResolvedValue(ok([{ ...user, name: 'Updated' }]));

    const result = await repo.getUsers();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe('cached');

    // background revalidation runs
    await flush();
    expect(remote.fetchUsers).toHaveBeenCalledTimes(1);
    const cached = JSON.parse((await storage.getItem('cache:users'))!);
    expect(cached.data[0].name).toBe('Updated');
  });

  it('does not revalidate when the cached data is still fresh', async () => {
    const storage = new MemoryStorage();
    const { repo, remote } = buildUserRepository(storage);
    seedUsers(storage, [user], Date.now());
    remote.fetchUsers.mockResolvedValue(ok([user]));

    const result = await repo.getUsers();

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe('cached');
    await flush();
    expect(remote.fetchUsers).not.toHaveBeenCalled();
  });
});

describe('RestUserRepository — getUserById', () => {
  it('returns the user from cache when offline', async () => {
    const storage = new MemoryStorage();
    const { repo, network } = buildUserRepository(storage);
    seedUsers(storage, [user]);
    network.setOnline(false);

    const result = await repo.getUserById(1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.source).toBe('cached');
      expect(result.data.data.id).toBe(1);
    }
  });

  it('returns a network error when offline and no cache', async () => {
    const storage = new MemoryStorage();
    const { repo, network } = buildUserRepository(storage);
    network.setOnline(false);

    const result = await repo.getUserById(1);
    expect(result.ok).toBe(false);
  });
});

describe('RestUserRepository — getUserPosts / getUserTodos', () => {
  it('fetches posts and todos independently (partial failure)', async () => {
    const storage = new MemoryStorage();
    const { repo, postRemote, todoRemote } = buildUserRepository(storage);

    postRemote.fetchPostsByUser.mockResolvedValue(fail(new AppError('server', 'posts down')));
    todoRemote.fetchTodosByUser.mockResolvedValue(ok(todos));

    const [postsResult, todosResult] = await Promise.all([
      repo.getUserPosts(1),
      repo.getUserTodos(1),
    ]);

    expect(postsResult.ok).toBe(false);
    if (!postsResult.ok) expect(postsResult.error.kind).toBe('server');

    expect(todosResult.ok).toBe(true);
    if (todosResult.ok) expect(todosResult.data.data).toEqual(todos);
  });

  it('serves cached posts offline even when todos have no cache', async () => {
    const storage = new MemoryStorage();
    const { repo, network } = buildUserRepository(storage);
    seedPosts(storage, 1, posts);
    network.setOnline(false);

    const postsResult = await repo.getUserPosts(1);
    expect(postsResult.ok).toBe(true);
    if (postsResult.ok) {
      expect(postsResult.data.source).toBe('cached');
      expect(postsResult.data.data).toEqual(posts);
    }

    const todosResult = await repo.getUserTodos(1);
    expect(todosResult.ok).toBe(false);
  });

  it('stores fresh posts in the cache when the API succeeds', async () => {
    const storage = new MemoryStorage();
    const { repo, postRemote } = buildUserRepository(storage);
    postRemote.fetchPostsByUser.mockResolvedValue(ok(posts));

    const result = await repo.getUserPosts(1);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe('fresh');
    const cached = JSON.parse((await storage.getItem('cache:posts:1'))!);
    expect(cached.data).toEqual(posts);
  });

  it('does not revalidate fresh cached posts', async () => {
    const storage = new MemoryStorage();
    const { repo, postRemote } = buildUserRepository(storage);
    seedPosts(storage, 1, posts, Date.now());
    postRemote.fetchPostsByUser.mockResolvedValue(ok(posts));

    const result = await repo.getUserPosts(1);

    expect(result.ok).toBe(true);
    await flush();
    expect(postRemote.fetchPostsByUser).not.toHaveBeenCalled();
  });

  it('revalidates stale cached posts in the background', async () => {
    const storage = new MemoryStorage();
    const { repo, postRemote } = buildUserRepository(storage);
    seedPosts(storage, 1, posts, 1);
    postRemote.fetchPostsByUser.mockResolvedValue(ok([{ ...posts[0], title: 'Fresh' }]));

    const result = await repo.getUserPosts(1);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe('cached');
    await flush();
    expect(postRemote.fetchPostsByUser).toHaveBeenCalledTimes(1);
    const cached = JSON.parse((await storage.getItem('cache:posts:1'))!);
    expect(cached.data[0].title).toBe('Fresh');
  });

  it('revalidates stale cached todos in the background', async () => {
    const storage = new MemoryStorage();
    const { repo, todoRemote } = buildUserRepository(storage);
    storage.setItem(
      'cache:todos:1',
      JSON.stringify({
        data: [{ id: 1, userId: 1, title: 'Old', completed: false }],
        updatedAt: 1,
      }),
    );
    todoRemote.fetchTodosByUser.mockResolvedValue(
      ok([{ id: 1, userId: 1, title: 'Fresh', completed: true }]),
    );

    const result = await repo.getUserTodos(1);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe('cached');
    await flush();
    expect(todoRemote.fetchTodosByUser).toHaveBeenCalledTimes(1);
    const cached = JSON.parse((await storage.getItem('cache:todos:1'))!);
    expect(cached.data[0].title).toBe('Fresh');
  });

  it('deduplicates concurrent refreshes for the same key', async () => {
    const storage = new MemoryStorage();
    const { repo, postRemote } = buildUserRepository(storage);
    postRemote.fetchPostsByUser.mockResolvedValue(ok(posts));

    await Promise.all([repo.refreshUserPosts(1), repo.refreshUserPosts(1)]);

    expect(postRemote.fetchPostsByUser).toHaveBeenCalledTimes(1);
  });
});
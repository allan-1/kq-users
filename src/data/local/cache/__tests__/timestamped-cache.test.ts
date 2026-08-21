import { TimestampedCache } from '@/data/local/cache/timestamped-cache';
import { MemoryStorage } from '@/test-utils/memory-storage';
import { createUserLocalDataSource } from '@/data/local/dataSources/user-local-data-source';
import type { User } from '@/domain/models/user';

const user: User = {
  id: 1,
  name: 'Leanne',
  username: 'Bret',
  email: 'a@b.c',
  phone: '',
  website: '',
  address: { street: 's', suite: '', city: 'c', zipcode: 'z', geo: { lat: '', lng: '' } },
  company: { name: '', catchPhrase: '', bs: '' },
};

describe('TimestampedCache', () => {
  it('stores and retrieves entries with a timestamp', async () => {
    const storage = new MemoryStorage();
    const cache = new TimestampedCache(storage);

    await cache.set('cache:users', [user], 111);
    const entry = await cache.get<User[]>('cache:users');

    expect(entry).not.toBeNull();
    expect(entry?.data).toEqual([user]);
    expect(entry?.updatedAt).toBe(111);
  });

  it('returns NEVER_SYNCED for missing keys', async () => {
    const cache = new TimestampedCache(new MemoryStorage());
    expect(await cache.getUpdatedAt('missing')).toBe(0);
  });

  it('persists across cache instances (app restart)', async () => {
    const storage = new MemoryStorage();
    const first = new TimestampedCache(storage);
    await first.set('cache:users', [user], 222);

    const second = new TimestampedCache(storage);
    const entry = await second.get<User[]>('cache:users');
    expect(entry?.data).toEqual([user]);
    expect(entry?.updatedAt).toBe(222);
  });

  it('local data source finds a user by id within the cached list', async () => {
    const storage = new MemoryStorage();
    const cache = new TimestampedCache(storage);
    const local = createUserLocalDataSource(cache);
    await local.setUsers([user, { ...user, id: 2 }]);

    const found = await local.getUserById(2);
    expect(found?.entry.data.id).toBe(2);
    expect(await local.getUserById(99)).toBeNull();
  });
});
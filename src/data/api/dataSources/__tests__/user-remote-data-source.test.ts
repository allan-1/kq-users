import { createUserRemoteDataSource } from '@/data/api/dataSources/user-remote-data-source';
import { AppError } from '@/core/errors/app-error';
import { ok } from '@/core/result/result';

describe('UserRemoteDataSource', () => {
  function apiReturning(data: unknown) {
    return { get: jest.fn().mockResolvedValue(ok(data)) };
  }

  it('maps a valid user list into domain models', async () => {
    const api = apiReturning([
      { id: 1, name: 'Leanne', username: 'Bret', email: 'a@b.c' },
    ]);
    const ds = createUserRemoteDataSource(api);

    const result = await ds.fetchUsers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data[0].name).toBe('Leanne');
      expect(result.data[0]).not.toHaveProperty('geo');
    }
  });

  it('returns a validation error for malformed payloads', async () => {
    const api = apiReturning([{ id: 'nope', name: 42 }]);
    const ds = createUserRemoteDataSource(api);

    const result = await ds.fetchUsers();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('validation');
  });

  it('returns a validation error when the payload is not an array', async () => {
    const api = apiReturning({ user: { id: 1 } });
    const ds = createUserRemoteDataSource(api);

    const result = await ds.fetchUsers();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('validation');
  });

  it('propagates upstream errors unchanged', async () => {
    const api = { get: jest.fn().mockResolvedValue({ ok: false, error: new AppError('notFound', 'x', { statusCode: 404 }) }) };
    const ds = createUserRemoteDataSource(api);

    const result = await ds.fetchUsers();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('notFound');
  });

  it('normalizes the user DTO geo into a domain Address', async () => {
    const api = apiReturning([
      {
        id: 1,
        name: 'Leanne',
        username: 'Bret',
        email: 'a@b.c',
        address: { street: 'Kulas', city: 'Gwenborough', geo: { lat: '1', lng: '2' } },
      },
    ]);
    const ds = createUserRemoteDataSource(api);

    const result = await ds.fetchUsers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data[0].address.geo.lat).toBe('1');
      expect(result.data[0].address.suite).toBe('');
    }
  });
});
import { mapUser, mapUsers } from '@/data/mappers/user-mapper';
import type { UserDto } from '@/data/api/dto/user-dto';

describe('user-mapper', () => {
  const dto: UserDto = {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' },
    },
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
  };

  it('maps a DTO into a domain model', () => {
    const user = mapUser(dto);

    expect(user).toEqual({
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org',
      address: {
        street: 'Kulas Light',
        suite: 'Apt. 556',
        city: 'Gwenborough',
        zipcode: '92998-3874',
        geo: { lat: '-37.3159', lng: '81.1496' },
      },
      company: {
        name: 'Romaguera-Crona',
        catchPhrase: 'Multi-layered client-server neural-net',
        bs: 'harness real-time e-markets',
      },
    });
  });

  it('maps a list of DTOs', () => {
    const users = mapUsers([dto]);
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe(1);
  });

  it('never exposes raw DTO shape (geo.lat) at the top level', () => {
    const user = mapUser(dto);
    expect((user as { lat?: string }).lat).toBeUndefined();
    expect(user.address.geo.lat).toBe('-37.3159');
  });
});
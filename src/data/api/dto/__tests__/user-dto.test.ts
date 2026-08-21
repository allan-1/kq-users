import { UserDtoSchema } from '@/data/api/dto/user-dto';

const validUser = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
};

describe('UserDtoSchema', () => {
  it('accepts a valid user', () => {
    const result = UserDtoSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('fills missing optional fields with defaults', () => {
    const result = UserDtoSchema.safeParse(validUser);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('');
      expect(result.data.address.city).toBe('');
      expect(result.data.address.geo.lat).toBe('');
      expect(result.data.company.name).toBe('');
    }
  });

  it('treats a null address as an empty default', () => {
    const result = UserDtoSchema.safeParse({ ...validUser, address: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address.city).toBe('');
    }
  });

  it('rejects when a required field is missing', () => {
    const result = UserDtoSchema.safeParse({ id: 1, username: 'Bret', email: 'a@b.c' });
    expect(result.success).toBe(false);
  });

  it('rejects when id is the wrong type', () => {
    const result = UserDtoSchema.safeParse({ ...validUser, id: 'not-a-number' });
    expect(result.success).toBe(false);
  });

  it('rejects malformed arrays via the array schema', () => {
    const arraySchema = UserDtoSchema.array();
    expect(arraySchema.safeParse([validUser, { bad: true }]).success).toBe(false);
  });
});
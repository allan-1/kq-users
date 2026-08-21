import type { ApiClient } from '@/data/api/client/api-client';
import { UserDtoSchema, type UserDto } from '@/data/api/dto/user-dto';
import { logger } from '@/core/logger/logger';
import { ok, type Result } from '@/core/result/result';
import { parseWith } from '@/core/utils/parse-with';
import { mapUser, mapUsers } from '@/data/mappers/user-mapper';
import type { User } from '@/domain/models/user';

export interface UserRemoteDataSource {
  fetchUsers(): Promise<Result<User[]>>;
  fetchUserById(id: number): Promise<Result<User>>;
}

export function createUserRemoteDataSource(api: ApiClient): UserRemoteDataSource {
  return {
    async fetchUsers() {
      const response = await api.get<UserDto[]>(`/users`);
      if (!response.ok) return response;

      const parsed = parseWith(UserDtoSchema.array(), response.data);
      if (!parsed.ok) return parsed;

      logger.debug('users-mapped', { count: parsed.data.length });
      return ok(mapUsers(parsed.data));
    },

    async fetchUserById(id) {
      const response = await api.get<UserDto>(`/users/${id}`);
      if (!response.ok) return response;

      const parsed = parseWith(UserDtoSchema, response.data);
      if (!parsed.ok) return parsed;

      return ok(mapUser(parsed.data));
    },
  };
}

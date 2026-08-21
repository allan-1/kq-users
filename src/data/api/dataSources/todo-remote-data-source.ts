import type { ApiClient } from '@/data/api/client/api-client';
import { TodoDtoSchema, type TodoDto } from '@/data/api/dto/todo-dto';
import { ok, type Result } from '@/core/result/result';
import { parseWith } from '@/core/utils/parse-with';
import { mapTodos } from '@/data/mappers/todo-mapper';
import type { Todo } from '@/domain/models/todo';

export interface TodoRemoteDataSource {
  fetchTodosByUser(userId: number): Promise<Result<Todo[]>>;
}

export function createTodoRemoteDataSource(api: ApiClient): TodoRemoteDataSource {
  return {
    async fetchTodosByUser(userId) {
      const response = await api.get<TodoDto[]>(`/users/${userId}/todos`);
      if (!response.ok) return response;
      const parsed = parseWith(TodoDtoSchema.array(), response.data);
      if (!parsed.ok) return parsed;
      return ok(mapTodos(parsed.data));
    },
  };
}

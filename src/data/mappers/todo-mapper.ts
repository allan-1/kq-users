import type { TodoDto } from '@/data/api/dto/todo-dto';
import type { Todo } from '@/domain/models/todo';

export function mapTodo(dto: TodoDto): Todo {
  return {
    id: dto.id,
    userId: dto.userId,
    title: dto.title,
    completed: dto.completed,
  };
}

export function mapTodos(dtos: TodoDto[]): Todo[] {
  return dtos.map(mapTodo);
}

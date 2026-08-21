import type { LoadResult } from '@/domain/models/load-result';
import type { Post } from '@/domain/models/post';
import type { Todo } from '@/domain/models/todo';
import type { User } from '@/domain/models/user';

export interface UserRepository {
  getUsers(): Promise<LoadResult<User[]>>;
  getUserById(id: number): Promise<LoadResult<User>>;
  getUserPosts(userId: number): Promise<LoadResult<Post[]>>;
  getUserTodos(userId: number): Promise<LoadResult<Todo[]>>;
}

import type { LoadResult } from '@/domain/models/load-result';
import type { Post } from '@/domain/models/post';

export interface PostRepository {
  getPostById(userId: number, id: number): Promise<LoadResult<Post>>;
  getPostsByUser(userId: number): Promise<LoadResult<Post[]>>;
}

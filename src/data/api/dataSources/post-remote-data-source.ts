import type { ApiClient } from '@/data/api/client/api-client';
import { PostDtoSchema, type PostDto } from '@/data/api/dto/post-dto';
import { ok, type Result } from '@/core/result/result';
import { parseWith } from '@/core/utils/parse-with';
import { mapPost, mapPosts } from '@/data/mappers/post-mapper';
import type { Post } from '@/domain/models/post';

export interface PostRemoteDataSource {
  fetchPostById(id: number): Promise<Result<Post>>;
  fetchPostsByUser(userId: number): Promise<Result<Post[]>>;
}

export function createPostRemoteDataSource(api: ApiClient): PostRemoteDataSource {
  return {
    async fetchPostById(id) {
      const response = await api.get<PostDto>(`/posts/${id}`);
      if (!response.ok) return response;
      const parsed = parseWith(PostDtoSchema, response.data);
      if (!parsed.ok) return parsed;
      return ok(mapPost(parsed.data));
    },

    async fetchPostsByUser(userId) {
      const response = await api.get<PostDto[]>(`/users/${userId}/posts`);
      if (!response.ok) return response;
      const parsed = parseWith(PostDtoSchema.array(), response.data);
      if (!parsed.ok) return parsed;
      return ok(mapPosts(parsed.data));
    },
  };
}

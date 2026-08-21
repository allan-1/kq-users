import type { PostDto } from '@/data/api/dto/post-dto';
import type { Post } from '@/domain/models/post';

export function mapPost(dto: PostDto): Post {
  return {
    id: dto.id,
    userId: dto.userId,
    title: dto.title,
    body: dto.body,
  };
}

export function mapPosts(dtos: PostDto[]): Post[] {
  return dtos.map(mapPost);
}

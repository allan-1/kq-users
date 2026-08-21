import { useContainer } from '@/providers/app-provider';
import { useLoadResult } from '@/shared/hooks/use-load-result';
import type { Post } from '@/domain/models/post';

export function usePostDetails(userId: number, postId: number) {
  const { postRepository } = useContainer();
  return useLoadResult<Post>(
    () => postRepository.getPostById(userId, postId),
    () => postRepository.getPostById(userId, postId),
    { refreshOnReconnect: true },
  );
}

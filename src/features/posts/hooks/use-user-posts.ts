import { useContainer } from '@/providers/app-provider';
import { useLoadResult } from '@/shared/hooks/use-load-result';
import type { Post } from '@/domain/models/post';

export function useUserPosts(userId: number) {
  const { userRepository } = useContainer();
  return useLoadResult<Post[]>(
    () => userRepository.getUserPosts(userId),
    () => userRepository.refreshUserPosts(userId),
    {
      subscribe: (listener) => userRepository.subscribe(listener),
      getSnapshot: () => userRepository.getSnapshot<Post[]>(`posts:${userId}`),
      refreshOnReconnect: true,
    },
  );
}

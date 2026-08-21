import { useContainer } from '@/providers/app-provider';
import { useLoadResult } from '@/shared/hooks/use-load-result';
import type { Todo } from '@/domain/models/todo';

export function useUserTodos(userId: number) {
  const { userRepository } = useContainer();
  return useLoadResult<Todo[]>(
    () => userRepository.getUserTodos(userId),
    () => userRepository.refreshUserTodos(userId),
    {
      subscribe: (listener) => userRepository.subscribe(listener),
      getSnapshot: () => userRepository.getSnapshot<Todo[]>(`todos:${userId}`),
      refreshOnReconnect: true,
    },
  );
}

import { useContainer } from '@/providers/app-provider';
import { useLoadResult } from '@/shared/hooks/use-load-result';
import type { User } from '@/domain/models/user';

export function useUserDetails(id: number) {
  const { userRepository } = useContainer();
  return useLoadResult<User>(
    () => userRepository.getUserById(id),
    () => userRepository.getUserById(id),
    {
      subscribe: (listener) => userRepository.subscribe(listener),
      getSnapshot: () => userRepository.getSnapshot<User>(`user:${id}`),
      refreshOnReconnect: true,
    },
  );
}

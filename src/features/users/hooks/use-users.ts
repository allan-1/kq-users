import { useContainer } from '@/providers/app-provider';
import { useLoadResult } from '@/shared/hooks/use-load-result';
import type { User } from '@/domain/models/user';

export function useUsers() {
  const { userRepository } = useContainer();
  return useLoadResult<User[]>(
    () => userRepository.getUsers(),
    () => userRepository.refreshUsers(),
    {
      subscribe: (listener) => userRepository.subscribe(listener),
      getSnapshot: () => userRepository.getSnapshot<User[]>('users'),
      refreshOnReconnect: true,
    },
  );
}

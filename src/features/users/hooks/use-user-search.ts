import { useMemo, useState } from 'react';

import type { User } from '@/domain/models/user';

export function useUserSearch(users: User[] | null) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  return { query, setQuery, filtered };
}

import { useDeferredValue } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUsers } from '@/features/users/hooks/use-users';
import { useUserSearch } from '@/features/users/hooks/use-user-search';
import { useNetworkStatusValue } from '@/providers/app-provider';
import { SkeletonRow } from '@/shared/components/skeleton';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { OfflineBanner } from '@/shared/components/offline-banner';
import { StaleBanner } from '@/shared/components/stale-banner';
import { LastUpdated } from '@/shared/components/last-updated';
import type { User } from '@/domain/models/user';

export default function UsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const networkStatus = useNetworkStatusValue();
  const { state, refresh } = useUsers();
  const { query, setQuery, filtered } = useUserSearch(state.data);
  const deferredQuery = useDeferredValue(query);

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Users
        </ThemedText>
        {networkStatus === 'offline' ? <OfflineBanner /> : null}
        {state.isStale ? <StaleBanner /> : null}
        <LastUpdated updatedAt={state.updatedAt} />
      </View>

      {state.status === 'loading' && state.data === null ? (
        <SkeletonList />
      ) : state.status === 'error' && state.data === null ? (
        <ErrorState message={state.error ? state.error.message : undefined} onRetry={() => refresh()} />
      ) : (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, username, or email"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.search,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
          />
          <FlatList
            data={deferredQuery.trim() ? filtered : state.data}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={state.isRefreshing} onRefresh={() => refresh()} />
            }
            ListEmptyComponent={
              query.trim() ? (
                <EmptyState title="No results" message={`No users match "${query}".`} />
              ) : (
                <EmptyState title="No users available" />
              )
            }
            renderItem={({ item }) => (
              <UserListItem user={item} onPress={() => router.push(`/user/${item.id}`)} />
            )}
          />
        </>
      )}
    </ThemedView>
  );
}

function UserListItem({ user, onPress }: { user: User; onPress: () => void }) {
  const theme = useTheme();
  const initial = user.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
        <ThemedText type="subtitle" style={styles.avatarText}>
          {initial}
        </ThemedText>
      </View>
      <View style={styles.cardBody}>
        <ThemedText type="smallBold">{user.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          @{user.username}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {user.email}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function SkeletonList() {
  return (
    <View style={styles.listContent}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 34,
    lineHeight: 40,
  },
  search: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    fontSize: 16,
    maxWidth: MaxContentWidth,
    width: 'auto',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.7,
  },
});

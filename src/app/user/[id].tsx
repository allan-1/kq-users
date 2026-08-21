import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUserDetails } from '@/features/users/hooks/use-user-details';
import { useUserPosts } from '@/features/posts/hooks/use-user-posts';
import { useUserTodos } from '@/features/todos/hooks/use-user-todos';
import { useNetworkStatusValue } from '@/providers/app-provider';
import { OfflineBanner } from '@/shared/components/offline-banner';
import { StaleBanner } from '@/shared/components/stale-banner';
import { LastUpdated } from '@/shared/components/last-updated';
import { ErrorState } from '@/shared/components/error-state';
import { LoadableSection } from '@/shared/components/loadable-section';
import { toUserMessage } from '@/core/errors/user-message';
import type { Post } from '@/domain/models/post';
import type { Todo } from '@/domain/models/todo';
import type { User } from '@/domain/models/user';

export default function UserDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatusValue();

  const user = useUserDetails(userId);
  const posts = useUserPosts(userId);
  const todos = useUserTodos(userId);

  const refreshing = user.state.isRefreshing || posts.state.isRefreshing || todos.state.isRefreshing;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      user.refresh(),
      posts.refresh(),
      todos.refresh(),
    ]);
  }, [user, posts, todos]);

  const data = user.state.data;

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      {user.state.status === 'loading' && data === null ? (
        <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
          <ThemedText type="subtitle">Loading…</ThemedText>
        </ScrollView>
      ) : user.state.status === 'error' && data === null ? (
        <ErrorState message={user.state.error ? toUserMessage(user.state.error) : undefined} onRetry={() => user.refresh()} />
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshAll} />
          }>
          {networkStatus === 'offline' ? <OfflineBanner /> : null}
          {user.state.isStale || posts.state.isStale || todos.state.isStale ? <StaleBanner /> : null}
          <LastUpdated updatedAt={user.state.updatedAt} />
          <UserInfo user={data} />
          <LoadableSection
            title="Posts"
            state={posts.state}
            onRetry={() => posts.refresh()}
            renderContent={(list) => <PostList posts={list} onPress={(p) => router.push(`/post/${p.id}?userId=${userId}`)} />}
          />
          <LoadableSection
            title="Todos"
            state={todos.state}
            onRetry={() => todos.refresh()}
            renderContent={(list) => <TodoList todos={list} />}
          />
        </ScrollView>
      ) : null}
    </ThemedView>
  );
}

function UserInfo({ user }: { user: User }) {
  const rows: [string, string][] = [
    ['Email', user.email],
    ['Phone', user.phone],
    ['Website', user.website],
    ['Company', user.company.name],
    ['Address', `${user.address.street}, ${user.address.city}, ${user.address.zipcode}`],
  ];

  return (
    <View style={styles.userCard}>
      <ThemedText type="title" style={styles.userName}>
        {user.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        @{user.username}
      </ThemedText>
      <View style={styles.divider} />
      {rows.map(([label, value]) => (
        <View key={label} style={styles.infoRow}>
          <ThemedText type="smallBold" style={styles.infoLabel}>
            {label}
          </ThemedText>
          <ThemedText type="small" style={styles.infoValue}>
            {value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function PostList({ posts, onPress }: { posts: Post[]; onPress: (post: Post) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {posts.map((post) => (
        <Pressable
          key={post.id}
          accessibilityRole="button"
          onPress={() => onPress(post)}
          style={({ pressed }) => [
            styles.item,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {post.title}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {todos.map((todo) => (
        <View
          key={todo.id}
          style={[styles.item, styles.todoItem, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.checkbox,
              { borderColor: theme.textSecondary, backgroundColor: todo.completed ? theme.text : 'transparent' },
            ]}
          />
          <ThemedText
            type="small"
            style={[styles.todoText, todo.completed && styles.todoCompleted]}
            numberOfLines={2}>
            {todo.title}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  userCard: {
    gap: Spacing.one,
  },
  userName: {
    fontSize: 28,
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: '#cccccc55',
    marginVertical: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  infoLabel: {
    flexShrink: 0,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  list: {
    gap: Spacing.two,
  },
  item: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    marginTop: 2,
  },
  todoText: {
    flex: 1,
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
});

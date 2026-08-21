import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePostDetails } from '@/features/posts/hooks/use-post-details';
import { useNetworkStatusValue } from '@/providers/app-provider';
import { OfflineBanner } from '@/shared/components/offline-banner';
import { StaleBanner } from '@/shared/components/stale-banner';
import { LastUpdated } from '@/shared/components/last-updated';
import { ErrorState } from '@/shared/components/error-state';
import { Skeleton } from '@/shared/components/skeleton';
import { toUserMessage } from '@/core/errors/user-message';

export default function PostDetailsScreen() {
  const { id, userId } = useLocalSearchParams<{ id: string; userId?: string }>();
  const postId = Number(id);
  const ownerId = Number(userId ?? 0);
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatusValue();
  const { state, refresh } = usePostDetails(ownerId, postId);

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={state.isRefreshing} onRefresh={() => refresh()} />}>
        {networkStatus === 'offline' ? <OfflineBanner /> : null}
        {state.isStale ? <StaleBanner /> : null}
        <LastUpdated updatedAt={state.updatedAt} />

        {state.status === 'loading' && state.data === null ? (
          <View style={styles.loading}>
            <Skeleton width="90%" height={24} />
            <Skeleton width="100%" height={60} />
            <Skeleton width="100%" height={60} />
          </View>
        ) : state.status === 'error' && state.data === null ? (
          <ErrorState message={state.error ? toUserMessage(state.error) : undefined} onRetry={() => refresh()} />
        ) : state.data ? (
          <View style={styles.body}>
            <ThemedText type="title" style={styles.title}>
              {state.data.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Post #{state.data.id}
            </ThemedText>
            <ThemedText style={styles.bodyText}>{state.data.body}</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
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
    gap: Spacing.three,
  },
  body: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  bodyText: {
    marginTop: Spacing.three,
  },
  loading: {
    gap: Spacing.three,
  },
});

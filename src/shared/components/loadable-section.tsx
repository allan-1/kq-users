import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import type { LoadState } from '@/shared/hooks/use-load-result';
import { SkeletonRow } from '@/shared/components/skeleton';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { toUserMessage } from '@/core/errors/user-message';

interface LoadableSectionProps<T> {
  title: string;
  state: LoadState<T>;
  emptyTitle?: string;
  onRetry?: () => void;
  renderContent: (data: T) => ReactNode;
  rows?: number;
}

/**
 * Renders a titled section that can succeed, fail, or be empty
 * independently of surrounding content (partial failure support).
 */
export function LoadableSection<T>({
  title,
  state,
  emptyTitle,
  onRetry,
  renderContent,
  rows = 3,
}: LoadableSectionProps<T>) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {state.status === 'loading' && state.data === null ? (
        <SkeletonList rows={rows} />
      ) : state.status === 'empty' ? (
        <EmptyState title={emptyTitle ?? `No ${title.toLowerCase()} available`} />
      ) : state.status === 'error' && state.data === null ? (
        <ErrorState message={state.error ? toUserMessage(state.error) : undefined} onRetry={onRetry} />
      ) : state.data !== null ? (
        renderContent(state.data)
      ) : null}
    </View>
  );
}

function SkeletonList({ rows }: { rows: number }) {
  return (
    <View>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
});

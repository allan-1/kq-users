import { StyleSheet } from 'react-native';

import { formatRelativeTime } from '@/core/utils/time';
import { ThemedText } from '@/components/themed-text';

interface LastUpdatedProps {
  updatedAt: number | null;
}

export function LastUpdated({ updatedAt }: LastUpdatedProps) {
  if (updatedAt === null || updatedAt === 0) return null;
  return (
    <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
      Last updated {formatRelativeTime(updatedAt)}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
  },
});

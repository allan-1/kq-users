import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText style={styles.message} themeColor="textSecondary">
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});

import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
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
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
          <ThemedText type="smallBold">Retry</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});

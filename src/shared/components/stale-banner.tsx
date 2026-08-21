import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

interface StaleBannerProps {
  message?: string;
}

export function StaleBanner({ message = 'Showing cached data — it may be out of date' }: StaleBannerProps) {
  const theme = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold" style={styles.text}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
  },
});
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.base,
        { width, height, backgroundColor: theme.backgroundElement },
        style,
      ]}
    />
  );
}

export function SkeletonRow() {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.background }]}>
      <Skeleton height={40} width={40} style={styles.avatar} />
      <View style={styles.rowText}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} style={styles.rowTextSub} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  avatar: {
    borderRadius: Spacing.five,
  },
  rowText: {
    flex: 1,
    gap: Spacing.two,
  },
  rowTextSub: {
    opacity: 0.6,
  },
});

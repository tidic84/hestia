import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';
import type { BadgeWithStatus } from '../hooks/useBadges';

type Props = {
  badge: BadgeWithStatus;
};

export default function BadgeCard({ badge }: Props) {
  return (
    <View style={[styles.container, !badge.unlocked && styles.locked]}>
      <Ionicons
        name={badge.icon as keyof typeof Ionicons.glyphMap}
        size={28}
        color={badge.unlocked ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.name, !badge.unlocked && styles.lockedText]} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {badge.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    flexBasis: '47%',
    flexGrow: 1,
  },
  locked: {
    opacity: 0.35,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  lockedText: {
    color: colors.textMuted,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

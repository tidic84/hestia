import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';

type Props = {
  currentStreak: number;
  longestStreak: number;
};

export default function StreakBadge({ currentStreak, longestStreak }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.currentStreak}>
        <Ionicons
          name="flame"
          size={44}
          color={currentStreak > 0 ? colors.primary : colors.textMuted}
        />
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>jours</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.longestStreak}>
        <Ionicons name="trophy" size={22} color={colors.accent} />
        <Text style={styles.longestNumber}>{longestStreak}</Text>
        <Text style={styles.longestLabel}>record</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  currentStreak: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakNumber: {
    fontSize: fontSize.hero,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.surfaceLight,
  },
  longestStreak: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  longestNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '300',
    color: colors.textSecondary,
  },
  longestLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

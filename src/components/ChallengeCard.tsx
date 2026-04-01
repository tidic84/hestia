import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';
import type { Challenge } from '../types';

type Props = {
  challenge: Challenge;
  onComplete: () => void;
};

export default function ChallengeCard({ challenge, onComplete }: Props) {
  const isCompleted = challenge.completed === 1;

  return (
    <View style={[styles.container, isCompleted && styles.completed]}>
      <View style={[styles.iconContainer, isCompleted && styles.iconCompleted]}>
        <Ionicons
          name={isCompleted ? 'checkmark-circle' : 'flash'}
          size={22}
          color={isCompleted ? colors.accent : colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Defi du jour</Text>
        <Text style={[styles.prompt, isCompleted && styles.promptCompleted]}>
          {challenge.prompt}
        </Text>
      </View>
      {!isCompleted && (
        <TouchableOpacity onPress={onComplete} style={styles.completeButton}>
          <Ionicons name="checkmark" size={18} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    width: '100%',
  },
  completed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCompleted: {
    backgroundColor: colors.accentDark,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prompt: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  promptCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

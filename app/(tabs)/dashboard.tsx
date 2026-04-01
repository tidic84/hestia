import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import StreakBadge from '../../src/components/StreakBadge';
import BadgeCard from '../../src/components/BadgeCard';
import { useStreak } from '../../src/hooks/useStreak';
import { useBadges } from '../../src/hooks/useBadges';
import { useTodayPhoto } from '../../src/hooks/usePhoto';
import { getPhotoUri } from '../../src/services/photo.service';
import { colors, fontSize, spacing, borderRadius } from '../../src/constants/theme';

export default function DashboardScreen() {
  const { currentStreak, longestStreak, refresh: refreshStreak } = useStreak();
  const { badges, refresh: refreshBadges } = useBadges();
  const { photo: todayPhoto, refresh: refreshPhoto } = useTodayPhoto();

  useFocusEffect(
    useCallback(() => {
      refreshStreak();
      refreshBadges();
      refreshPhoto();
    }, [refreshStreak, refreshBadges, refreshPhoto])
  );

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mes Progres</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {todayPhoto && (
          <TouchableOpacity
            style={styles.todayCard}
            onPress={() => router.push(`/photo/${todayPhoto.date}`)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: getPhotoUri(todayPhoto) }}
              style={styles.todayImage}
              contentFit="cover"
            />
            <View style={styles.todayOverlay}>
              <Text style={styles.todayLabel}>Photo du jour</Text>
            </View>
          </TouchableOpacity>
        )}

        <StreakBadge currentStreak={currentStreak} longestStreak={longestStreak} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>badges</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{badges.length}</Text>
            <Text style={styles.statLabel}>total</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  todayCard: {
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  todayImage: {
    flex: 1,
  },
  todayOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(28, 24, 22, 0.5)',
  },
  todayLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: '300',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: 0.3,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../src/hooks/useDatabase';
import { getPhotoCount, getGeolocatedPhotos } from '../src/db/queries/photos';
import { getCurrentStreak, getLongestStreak, getWeekendPhotoCount } from '../src/db/queries/streaks';
import { getCompletedChallengeCount } from '../src/db/queries/challenges';
import { getUnlockedBadges } from '../src/db/queries/badges';
import { colors, fontSize, spacing, borderRadius } from '../src/constants/theme';

interface RecapStats {
  totalPhotos: number;
  currentStreak: number;
  longestStreak: number;
  weekendPhotos: number;
  geolocatedPhotos: number;
  challengesCompleted: number;
  badgesUnlocked: number;
}

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function RecapScreen() {
  const db = useDatabase();
  const [stats, setStats] = useState<RecapStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [totalPhotos, currentStreak, longestStreak, weekendPhotos, geoPhotos, challengesCompleted, badges] =
          await Promise.all([
            getPhotoCount(db),
            getCurrentStreak(db),
            getLongestStreak(db),
            getWeekendPhotoCount(db),
            getGeolocatedPhotos(db),
            getCompletedChallengeCount(db),
            getUnlockedBadges(db),
          ]);

        setStats({
          totalPhotos,
          currentStreak,
          longestStreak,
          weekendPhotos,
          geolocatedPhotos: geoPhotos.length,
          challengesCompleted,
          badgesUnlocked: badges.length,
        });
      } catch {
        // Stats failed to load
      }
    }
    load();
  }, [db]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mon recap</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!stats ? (
          <Text style={styles.emptyText}>Chargement...</Text>
        ) : stats.totalPhotos === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              Pas encore de photos. Commence a capturer tes journees !
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroNumber}>{stats.totalPhotos}</Text>
              <Text style={styles.heroLabel}>
                {stats.totalPhotos === 1 ? 'jour capture' : 'jours captures'}
              </Text>
            </View>

            <View style={styles.grid}>
              <StatCard icon="flame" value={stats.currentStreak} label="Serie actuelle" />
              <StatCard icon="trophy" value={stats.longestStreak} label="Meilleure serie" />
              <StatCard icon="ribbon" value={stats.badgesUnlocked} label="Badges" />
              <StatCard icon="checkmark-circle" value={stats.challengesCompleted} label="Defis reussis" />
              <StatCard icon="location" value={stats.geolocatedPhotos} label="Geolocalisees" />
              <StatCard icon="sunny" value={stats.weekendPhotos} label="Week-ends" />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroNumber: {
    fontSize: fontSize.hero,
    fontWeight: '200',
    color: colors.primary,
  },
  heroLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '300',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

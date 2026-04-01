import type { SQLiteDatabase } from 'expo-sqlite';
import { getCurrentStreak, getLongestStreak, getWeekendPhotoCount } from '../db/queries/streaks';
import { getPhotoCount, getGeolocatedPhotos } from '../db/queries/photos';
import { getUnlockedBadgeIds, unlockBadge } from '../db/queries/badges';
import { getCompletedChallengeCount } from '../db/queries/challenges';
import { BADGE_DEFINITIONS } from '../constants/badges';
import type { GamificationContext, BadgeDef } from '../types';

function countUniqueLocations(photos: { latitude: number | null; longitude: number | null }[]): number {
  // Group by approximate location (rounded to 2 decimal places ~ 1km)
  const locations = new Set<string>();
  for (const p of photos) {
    if (p.latitude != null && p.longitude != null) {
      const key = `${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`;
      locations.add(key);
    }
  }
  return locations.size;
}

export async function buildGamificationContext(
  db: SQLiteDatabase,
  photoHour: number | null = null
): Promise<GamificationContext> {
  const [currentStreak, longestStreak, totalPhotos, challengesCompleted, weekendPhotos, geoPhotos] =
    await Promise.all([
      getCurrentStreak(db),
      getLongestStreak(db),
      getPhotoCount(db),
      getCompletedChallengeCount(db),
      getWeekendPhotoCount(db),
      getGeolocatedPhotos(db),
    ]);

  return {
    currentStreak,
    longestStreak,
    totalPhotos,
    photoHour,
    challengesCompleted,
    weekendPhotos,
    geolocatedPhotos: geoPhotos.length,
    uniqueLocations: countUniqueLocations(geoPhotos),
  };
}

export async function checkAndUnlockBadges(
  db: SQLiteDatabase,
  ctx: GamificationContext
): Promise<BadgeDef[]> {
  const alreadyUnlocked = await getUnlockedBadgeIds(db);
  const newlyUnlocked: BadgeDef[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (alreadyUnlocked.has(badge.id)) continue;
    if (badge.condition(ctx)) {
      await unlockBadge(db, badge.id);
      newlyUnlocked.push(badge);
    }
  }

  return newlyUnlocked;
}

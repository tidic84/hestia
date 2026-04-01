import type { SQLiteDatabase } from 'expo-sqlite';
import type { Badge } from '../../types';

export async function getUnlockedBadges(db: SQLiteDatabase): Promise<Badge[]> {
  return db.getAllAsync<Badge>('SELECT * FROM badges ORDER BY unlocked_at DESC');
}

export async function getUnlockedBadgeIds(db: SQLiteDatabase): Promise<Set<string>> {
  const badges = await db.getAllAsync<{ id: string }>('SELECT id FROM badges');
  return new Set(badges.map((b) => b.id));
}

export async function unlockBadge(db: SQLiteDatabase, badgeId: string): Promise<void> {
  await db.runAsync(
    'INSERT OR IGNORE INTO badges (id, unlocked_at) VALUES (?, ?)',
    badgeId,
    new Date().toISOString()
  );
}

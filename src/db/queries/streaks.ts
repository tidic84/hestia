import type { SQLiteDatabase } from 'expo-sqlite';
import { format, subDays, parseISO } from 'date-fns';

export async function getCurrentStreak(db: SQLiteDatabase): Promise<number> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM photos ORDER BY date DESC'
  );
  if (rows.length === 0) return 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Streak must include today or yesterday to be "current"
  if (rows[0].date !== today && rows[0].date !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < rows.length; i++) {
    const prevDate = parseISO(rows[i - 1].date);
    const expectedDate = format(subDays(prevDate, 1), 'yyyy-MM-dd');
    if (rows[i].date === expectedDate) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getLongestStreak(db: SQLiteDatabase): Promise<number> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM photos ORDER BY date ASC'
  );
  if (rows.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < rows.length; i++) {
    const prevDate = parseISO(rows[i - 1].date);
    const expectedNext = format(subDays(prevDate, -1), 'yyyy-MM-dd');
    if (rows[i].date === expectedNext) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export async function getWeekendPhotoCount(db: SQLiteDatabase): Promise<number> {
  // SQLite strftime %w: 0=Sunday, 6=Saturday
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM photos WHERE CAST(strftime('%w', date) AS INTEGER) IN (0, 6)"
  );
  return row?.count ?? 0;
}

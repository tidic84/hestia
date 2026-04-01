import type { SQLiteDatabase } from 'expo-sqlite';
import type { Challenge } from '../../types';

export async function getChallengeByDate(
  db: SQLiteDatabase,
  date: string
): Promise<Challenge | null> {
  return db.getFirstAsync<Challenge>('SELECT * FROM challenges WHERE date = ?', date);
}

export async function insertChallenge(
  db: SQLiteDatabase,
  challenge: Challenge
): Promise<void> {
  await db.runAsync(
    'INSERT OR IGNORE INTO challenges (id, date, prompt, category, completed) VALUES (?, ?, ?, ?, ?)',
    challenge.id,
    challenge.date,
    challenge.prompt,
    challenge.category,
    challenge.completed
  );
}

export async function markChallengeCompleted(
  db: SQLiteDatabase,
  date: string
): Promise<void> {
  await db.runAsync(
    'UPDATE challenges SET completed = 1 WHERE date = ?',
    date
  );
}

export async function getCompletedChallengeCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM challenges WHERE completed = 1'
  );
  return row?.count ?? 0;
}

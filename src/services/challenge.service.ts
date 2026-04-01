import * as Crypto from 'expo-crypto';
import { format } from 'date-fns';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getChallengeByDate, insertChallenge, markChallengeCompleted } from '../db/queries/challenges';
import { CHALLENGE_POOL } from '../constants/challenges';
import type { Challenge } from '../types';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function pickChallenge(date: string) {
  const seed = hashCode(date);
  const index = Math.abs(seed) % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[index];
}

export async function getTodayChallenge(db: SQLiteDatabase): Promise<Challenge> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const existing = await getChallengeByDate(db, today);
  if (existing) return existing;

  const def = pickChallenge(today);
  const challenge: Challenge = {
    id: Crypto.randomUUID(),
    date: today,
    prompt: def.prompt,
    category: def.category,
    completed: 0,
  };

  await insertChallenge(db, challenge);
  return challenge;
}

export async function completeChallenge(db: SQLiteDatabase): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd');
  await markChallengeCompleted(db, today);
}

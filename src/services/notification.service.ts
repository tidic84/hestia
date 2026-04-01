// Notification service — stubbed for Expo Go compatibility.
// expo-notifications is not supported in Expo Go since SDK 53.
// Install it and uncomment the real implementation when using a development build.

import type { SQLiteDatabase } from 'expo-sqlite';

const DEFAULT_WINDOW_START = 9;
const DEFAULT_WINDOW_END = 21;

export async function setupNotifications(): Promise<boolean> {
  console.log('[notifications] Stubbed — install expo-notifications for dev build');
  return false;
}

export async function scheduleNextNotification(
  _db: SQLiteDatabase,
  _windowStart: number = DEFAULT_WINDOW_START,
  _windowEnd: number = DEFAULT_WINDOW_END
): Promise<void> {
  // no-op in Expo Go
}

export async function getNotificationSettings(
  db: SQLiteDatabase
): Promise<{ windowStart: number; windowEnd: number; nextNotification: string | null }> {
  const startRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = 'notification_window_start'"
  );
  const endRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = 'notification_window_end'"
  );
  const nextRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = 'next_notification'"
  );

  return {
    windowStart: startRow ? parseInt(startRow.value, 10) : DEFAULT_WINDOW_START,
    windowEnd: endRow ? parseInt(endRow.value, 10) : DEFAULT_WINDOW_END,
    nextNotification: nextRow?.value ?? null,
  };
}

export async function saveNotificationWindow(
  db: SQLiteDatabase,
  windowStart: number,
  windowEnd: number
): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO app_state (key, value) VALUES ('notification_window_start', ?)",
    windowStart.toString()
  );
  await db.runAsync(
    "INSERT OR REPLACE INTO app_state (key, value) VALUES ('notification_window_end', ?)",
    windowEnd.toString()
  );
}

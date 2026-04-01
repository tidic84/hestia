import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

const DEFAULT_WINDOW_START = 9;
const DEFAULT_WINDOW_END = 21;

const NOTIFICATION_MESSAGES = [
  "C'est l'heure de capturer ton moment !",
  "Quel sera ton souvenir du jour ?",
  "Un instant a immortaliser t'attend.",
  "Prends ta photo du jour !",
  "Ton futur toi te remerciera pour cette photo.",
  "Chaque jour compte, capture le tien !",
];

function pickRandomMessage(): string {
  return NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)];
}

function randomHourInWindow(start: number, end: number): { hour: number; minute: number } {
  const totalMinutes = (end - start) * 60;
  const randomMinutes = Math.floor(Math.random() * totalMinutes);
  return {
    hour: start + Math.floor(randomMinutes / 60),
    minute: randomMinutes % 60,
  };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Rappel quotidien',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleNextNotification(
  db: SQLiteDatabase,
  windowStart: number = DEFAULT_WINDOW_START,
  windowEnd: number = DEFAULT_WINDOW_END
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const { hour, minute } = randomHourInWindow(windowStart, windowEnd);

  const scheduledDate = new Date(now);
  scheduledDate.setHours(hour, minute, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (scheduledDate <= now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hestia',
      body: pickRandomMessage(),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledDate,
      channelId: Platform.OS === 'android' ? 'daily-reminder' : undefined,
    },
  });

  // Save next notification time in DB
  await db.runAsync(
    "INSERT OR REPLACE INTO app_state (key, value) VALUES ('next_notification', ?)",
    scheduledDate.toISOString()
  );

  return;
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

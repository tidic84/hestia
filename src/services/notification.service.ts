import { Platform } from 'react-native';
import Constants from 'expo-constants';
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

// expo-notifications crashes on import in Expo Go since SDK 53.
// We lazy-load it so the app still works in Expo Go (without notifications).
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

async function getNotificationsModule() {
  if (isExpoGo()) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

export async function setupNotifications(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

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
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const { hour, minute } = randomHourInWindow(windowStart, windowEnd);

  const scheduledDate = new Date(now);
  scheduledDate.setHours(hour, minute, 0, 0);

  if (scheduledDate <= now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
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

  await db.runAsync(
    "INSERT OR REPLACE INTO app_state (key, value) VALUES ('next_notification', ?)",
    scheduledDate.toISOString()
  );
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

import type { SQLiteDatabase } from 'expo-sqlite';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

export const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL UNIQUE,
          file_path TEXT NOT NULL,
          width INTEGER NOT NULL DEFAULT 0,
          height INTEGER NOT NULL DEFAULT 0,
          latitude REAL,
          longitude REAL,
          challenge_id TEXT,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date);

        CREATE TABLE IF NOT EXISTS badges (
          id TEXT PRIMARY KEY NOT NULL,
          unlocked_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS challenges (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL UNIQUE,
          prompt TEXT NOT NULL,
          category TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(date);

        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
    },
  },
];

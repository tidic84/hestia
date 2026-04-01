import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrations } from './migrations';

const DB_NAME = 'hestia.db';

let dbInstance: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  dbInstance = db;
  return db;
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)'
  );

  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_state WHERE key = 'schema_version'"
  );
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await migration.up(db);
      await db.runAsync(
        "INSERT OR REPLACE INTO app_state (key, value) VALUES ('schema_version', ?)",
        migration.version.toString()
      );
    }
  }
}

import { Paths, Directory, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Photo, Badge, Challenge, AppState } from '../types';

const BACKUP_DIR = 'backups';

interface BackupData {
  version: 1;
  exportedAt: string;
  photos: Photo[];
  badges: Badge[];
  challenges: Challenge[];
  appState: AppState[];
}

function getBackupDir(): Directory {
  const dir = new Directory(Paths.cache, BACKUP_DIR);
  if (!dir.exists) dir.create();
  return dir;
}

export async function exportData(db: SQLiteDatabase): Promise<void> {
  // Gather all data
  const photos = await db.getAllAsync<Photo>('SELECT * FROM photos ORDER BY date ASC');
  const badges = await db.getAllAsync<Badge>('SELECT * FROM badges');
  const challenges = await db.getAllAsync<Challenge>('SELECT * FROM challenges');
  const appState = await db.getAllAsync<AppState>('SELECT * FROM app_state');

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    photos,
    badges,
    challenges,
    appState,
  };

  // Write JSON manifest
  const backupDir = getBackupDir();
  const manifestFile = new File(backupDir, 'hestia-backup.json');
  manifestFile.write(JSON.stringify(backup, null, 2));

  // Copy photos to backup dir
  const photosBackupDir = new Directory(backupDir, 'photos');
  if (!photosBackupDir.exists) photosBackupDir.create();

  for (const photo of photos) {
    const sourceFile = new File(Paths.document, photo.file_path);
    if (sourceFile.exists) {
      const destFile = new File(photosBackupDir, photo.file_path.replace('photos/', ''));
      sourceFile.copy(destFile);
    }
  }

  // Share the manifest (user can find photos in backup dir)
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(manifestFile.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Exporter les donnees Hestia',
    });
  }
}

export async function importData(
  db: SQLiteDatabase,
  jsonUri: string
): Promise<{ photosImported: number; badgesImported: number }> {
  const file = new File(jsonUri);
  const content = await file.text();
  const backup: BackupData = JSON.parse(content);

  if (backup.version !== 1) {
    throw new Error('Version de sauvegarde non supportee');
  }

  let photosImported = 0;
  let badgesImported = 0;

  // Import photos
  for (const photo of backup.photos) {
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM photos WHERE date = ?',
      photo.date
    );
    if (!existing) {
      await db.runAsync(
        `INSERT INTO photos (id, date, file_path, width, height, latitude, longitude, challenge_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        photo.id, photo.date, photo.file_path, photo.width, photo.height,
        photo.latitude, photo.longitude, photo.challenge_id, photo.created_at
      );
      photosImported++;
    }
  }

  // Import badges
  for (const badge of backup.badges) {
    await db.runAsync(
      'INSERT OR IGNORE INTO badges (id, unlocked_at) VALUES (?, ?)',
      badge.id, badge.unlocked_at
    );
    badgesImported++;
  }

  // Import challenges
  for (const challenge of backup.challenges) {
    await db.runAsync(
      'INSERT OR IGNORE INTO challenges (id, date, prompt, category, completed) VALUES (?, ?, ?, ?, ?)',
      challenge.id, challenge.date, challenge.prompt, challenge.category, challenge.completed
    );
  }

  return { photosImported, badgesImported };
}

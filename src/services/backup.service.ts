import { Paths, Directory, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Photo, Badge, Challenge, AppState } from '../types';

interface PhotoWithData extends Photo {
  imageBase64?: string;
}

interface BackupData {
  version: 1;
  exportedAt: string;
  photos: PhotoWithData[];
  badges: Badge[];
  challenges: Challenge[];
  appState: AppState[];
}

function getBackupDir(): Directory {
  const dir = new Directory(Paths.cache, 'hestia-backup');
  if (!dir.exists) dir.create();
  return dir;
}

function cleanBackupDir(): void {
  const dir = new Directory(Paths.cache, 'hestia-backup');
  if (dir.exists) dir.delete();
}

export async function exportData(db: SQLiteDatabase): Promise<void> {
  cleanBackupDir();
  const backupDir = getBackupDir();

  // Gather all data
  const photos = await db.getAllAsync<Photo>('SELECT * FROM photos ORDER BY date ASC');
  const badges = await db.getAllAsync<Badge>('SELECT * FROM badges');
  const challenges = await db.getAllAsync<Challenge>('SELECT * FROM challenges');
  const appState = await db.getAllAsync<AppState>('SELECT * FROM app_state');

  // Embed photo files as base64
  const photosWithData: PhotoWithData[] = photos.map((photo) => {
    try {
      const file = new File(Paths.document, photo.file_path);
      if (file.exists) {
        return { ...photo, imageBase64: file.base64Sync() };
      }
    } catch {
      // Photo file missing — export metadata only
    }
    return photo;
  });

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    photos: photosWithData,
    badges,
    challenges,
    appState,
  };

  // Write JSON manifest
  const manifestFile = new File(backupDir, 'hestia-backup.json');
  manifestFile.write(JSON.stringify(backup, null, 2));

  // Share the manifest
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(manifestFile.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Exporter les donnees Hestia',
    });
  }
}

export async function exportPhotosToGallery(db: SQLiteDatabase): Promise<number> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission galerie refusee');
  }

  const photos = await db.getAllAsync<Photo>('SELECT * FROM photos ORDER BY date ASC');
  let saved = 0;

  for (const photo of photos) {
    try {
      const file = new File(Paths.document, photo.file_path);
      if (file.exists) {
        await MediaLibrary.saveToLibraryAsync(file.uri);
        saved++;
      }
    } catch {
      // Skip individual photo errors
    }
  }

  return saved;
}

export async function pickAndImportData(
  db: SQLiteDatabase
): Promise<{ photosImported: number; badgesImported: number } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const file = new File(result.assets[0].uri);
  const content = await file.text();
  const backup: BackupData = JSON.parse(content);

  if (backup.version !== 1) {
    throw new Error('Version de sauvegarde non supportee');
  }

  let photosImported = 0;
  let badgesImported = 0;

  // Import photos (DB records + restore photo files from base64)
  const photosDir = new Directory(Paths.document, 'photos');
  if (!photosDir.exists) photosDir.create();

  for (const photo of backup.photos) {
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM photos WHERE date = ?',
      photo.date
    );
    if (!existing) {
      // Restore photo file if base64 data is included
      if (photo.imageBase64) {
        const destFile = new File(Paths.document, photo.file_path);
        destFile.write(photo.imageBase64, { encoding: 'base64' });
      }

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
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM badges WHERE id = ?',
      badge.id
    );
    if (!existing) {
      await db.runAsync(
        'INSERT INTO badges (id, unlocked_at) VALUES (?, ?)',
        badge.id, badge.unlocked_at
      );
      badgesImported++;
    }
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

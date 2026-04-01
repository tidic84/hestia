import type { SQLiteDatabase } from 'expo-sqlite';
import type { Photo } from '../../types';

export async function getPhotoByDate(
  db: SQLiteDatabase,
  date: string
): Promise<Photo | null> {
  return db.getFirstAsync<Photo>('SELECT * FROM photos WHERE date = ?', date);
}

export async function getPhotosForMonth(
  db: SQLiteDatabase,
  year: number,
  month: number
): Promise<Photo[]> {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return db.getAllAsync<Photo>(
    "SELECT * FROM photos WHERE date LIKE ? ORDER BY date ASC",
    `${prefix}%`
  );
}

export async function getAllPhotoDates(
  db: SQLiteDatabase
): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM photos ORDER BY date DESC'
  );
  return rows.map((r) => r.date);
}

export async function insertPhoto(
  db: SQLiteDatabase,
  photo: Photo
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO photos (id, date, file_path, width, height, latitude, longitude, challenge_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    photo.id,
    photo.date,
    photo.file_path,
    photo.width,
    photo.height,
    photo.latitude,
    photo.longitude,
    photo.challenge_id,
    photo.created_at
  );
}

export async function deletePhoto(
  db: SQLiteDatabase,
  date: string
): Promise<void> {
  await db.runAsync('DELETE FROM photos WHERE date = ?', date);
}

export async function getPhotoCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM photos'
  );
  return row?.count ?? 0;
}

export async function getGeolocatedPhotos(
  db: SQLiteDatabase
): Promise<Photo[]> {
  return db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE latitude IS NOT NULL AND longitude IS NOT NULL ORDER BY date DESC'
  );
}

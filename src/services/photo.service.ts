import { Paths, Directory, File } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import * as Location from 'expo-location';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { CameraCapturedPicture } from 'expo-camera';
import { format } from 'date-fns';
import { insertPhoto, getPhotoByDate, deletePhoto } from '../db/queries/photos';
import type { Photo } from '../types';

function getPhotosDir(): Directory {
  return new Directory(Paths.document, 'photos');
}

function ensurePhotosDir(): void {
  const dir = getPhotosDir();
  if (!dir.exists) {
    dir.create();
  }
}

async function getLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function savePhoto(
  db: SQLiteDatabase,
  picture: CameraCapturedPicture,
  challengeId: string | null = null
): Promise<Photo> {
  ensurePhotosDir();

  const today = format(new Date(), 'yyyy-MM-dd');
  const uuid = Crypto.randomUUID().slice(0, 8);
  const filename = `${today}_${uuid}.jpg`;

  // Delete existing photo for today if any
  const existing = await getPhotoByDate(db, today);
  if (existing) {
    try {
      const existingFile = new File(Paths.document, existing.file_path);
      if (existingFile.exists) {
        existingFile.delete();
      }
    } catch {
      // Old file cleanup failed — not critical, continue
    }
    await deletePhoto(db, today);
  }

  // Move photo from cache to permanent storage
  const sourceFile = new File(picture.uri);
  const destFile = new File(getPhotosDir(), filename);
  sourceFile.move(destFile);

  // Get location
  const coords = await getLocation();

  const photo: Photo = {
    id: Crypto.randomUUID(),
    date: today,
    file_path: `photos/${filename}`,
    width: picture.width,
    height: picture.height,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    challenge_id: challengeId,
    created_at: new Date().toISOString(),
  };

  await insertPhoto(db, photo);
  return photo;
}

export function getPhotoUri(photo: Photo): string {
  const file = new File(Paths.document, photo.file_path);
  return file.uri;
}

import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { getPhotosForMonth } from '../db/queries/photos';
import type { Photo } from '../types';

export function useCalendarPhotos(year: number, month: number) {
  const db = useDatabase();
  const [photos, setPhotos] = useState<Map<string, Photo>>(new Map());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getPhotosForMonth(db, year, month);
      const map = new Map<string, Photo>();
      for (const photo of results) {
        map.set(photo.date, photo);
      }
      setPhotos(map);
    } catch {
      setPhotos(new Map());
    } finally {
      setLoading(false);
    }
  }, [db, year, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { photos, loading, refresh };
}

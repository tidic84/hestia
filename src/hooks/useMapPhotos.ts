import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { getGeolocatedPhotos } from '../db/queries/photos';
import type { Photo } from '../types';

export function useMapPhotos() {
  const db = useDatabase();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const results = await getGeolocatedPhotos(db);
    setPhotos(results);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { photos, loading, refresh };
}

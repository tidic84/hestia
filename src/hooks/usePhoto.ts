import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useDatabase } from './useDatabase';
import { getPhotoByDate } from '../db/queries/photos';
import type { Photo } from '../types';

export function useTodayPhoto() {
  const db = useDatabase();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await getPhotoByDate(db, today);
      setPhoto(result);
    } catch {
      setPhoto(null);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { photo, loading, refresh };
}

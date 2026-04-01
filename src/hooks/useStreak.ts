import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { getCurrentStreak, getLongestStreak } from '../db/queries/streaks';

export function useStreak() {
  const db = useDatabase();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [current, longest] = await Promise.all([
        getCurrentStreak(db),
        getLongestStreak(db),
      ]);
      setCurrentStreak(current);
      setLongestStreak(longest);
    } catch {
      // Keep previous values on error
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { currentStreak, longestStreak, loading, refresh };
}

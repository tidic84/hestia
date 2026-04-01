import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { getUnlockedBadges } from '../db/queries/badges';
import { BADGE_DEFINITIONS } from '../constants/badges';
import type { Badge, BadgeDef } from '../types';

export type BadgeWithStatus = BadgeDef & {
  unlocked: boolean;
  unlocked_at: string | null;
};

export function useBadges() {
  const db = useDatabase();
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const unlocked = await getUnlockedBadges(db);
      const unlockedMap = new Map(unlocked.map((b) => [b.id, b]));

      const all = BADGE_DEFINITIONS.map((def) => {
        const badge = unlockedMap.get(def.id);
        return {
          ...def,
          unlocked: !!badge,
          unlocked_at: badge?.unlocked_at ?? null,
        };
      });

      setBadges(all);
    } catch {
      // Keep previous values on error
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { badges, loading, refresh };
}

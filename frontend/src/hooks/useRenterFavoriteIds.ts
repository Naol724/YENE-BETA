import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getFavoriteHouseIds } from '../services/favoriteService';

/** Loads renter saved listing IDs once; keeps list in sync when toggling from cards. */
export function useRenterFavoriteIds() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isRenter = isAuthenticated && user?.role === 'RENTER';

  useEffect(() => {
    if (!isRenter) {
      setIds([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getFavoriteHouseIds()
      .then((list) => {
        if (!cancelled) setIds(list);
      })
      .catch(() => {
        if (!cancelled) setIds([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isRenter, user?.id]);

  const toggleId = useCallback((houseId: string, nowSaved: boolean) => {
    setIds((prev) => (nowSaved ? [...new Set([...prev, houseId])] : prev.filter((id) => id !== houseId)));
  }, []);

  return { favoriteIds: ids, toggleFavoriteId: toggleId, favoritesLoading: loading, isRenter };
}

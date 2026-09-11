import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api';

export function useDrawStatus() {
  const [canDraw, setCanDraw] = useState(true);
  const [extraDraws, setExtraDraws] = useState(0);
  const [todayFortune, setTodayFortune] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userApi.getStatus();
      setCanDraw(data.canDraw);
      setExtraDraws(data.extraDraws || 0);
      setTodayFortune(data.fortune || null);
      setRemainingTime(data.remainingTime || null);
      return data;
    } catch (err) {
      console.error('[useDrawStatus] Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const claimBonus = useCallback(async () => {
    try {
      const res = await userApi.claimInviteBonus();
      await refreshStatus();
      return res;
    } catch (err) {
      console.error('[useDrawStatus] Failed to claim bonus:', err);
    }
  }, [refreshStatus]);

  const resetLimit = useCallback(async () => {
    try {
      await userApi.resetLimit();
      await refreshStatus();
    } catch (err) {
      console.error('[useDrawStatus] Failed to reset limit:', err);
    }
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatus();

    const handleFocus = () => {
      refreshStatus();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshStatus]);

  return {
    canDraw,
    extraDraws,
    todayFortune,
    remainingTime,
    loading,
    refreshStatus,
    claimBonus,
    resetLimit
  };
}

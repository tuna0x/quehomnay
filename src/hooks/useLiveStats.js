import { useState, useEffect, useCallback } from 'react';
import { statsApi } from '../api';

const BASE_TOTAL = 128450;
const BASE_TODAY = 3842;

export function useLiveStats() {
  const [totalDraws, setTotalDraws] = useState(BASE_TOTAL);
  const [todayDraws, setTodayDraws] = useState(BASE_TODAY);
  const [activeUsers, setActiveUsers] = useState(218);

  const fetchStats = useCallback(async () => {
    try {
      const data = await statsApi.getLiveStats();
      if (data.totalDraws) setTotalDraws(data.totalDraws);
      if (data.todayDraws) setTodayDraws(data.todayDraws);
      if (data.activeUsers) setActiveUsers(data.activeUsers);
    } catch (err) {
      console.warn('[useLiveStats] Sync error:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const incrementOptimistic = useCallback(() => {
    setTotalDraws(prev => prev + 1);
    setTodayDraws(prev => prev + 1);
    fetchStats();
  }, [fetchStats]);

  return {
    totalDraws,
    todayDraws,
    activeUsers,
    fetchStats,
    incrementOptimistic
  };
}

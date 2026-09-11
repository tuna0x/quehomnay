import { useState, useEffect, useCallback } from 'react';
import { drawApi } from '../api';

export function useDrawHistory() {
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const items = await drawApi.getHistory();
      setHistory(items);
    } catch (err) {
      console.error('[useDrawHistory] Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await drawApi.clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('[useDrawHistory] Error clearing history:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isOpen,
    loading,
    openHistory: () => setIsOpen(true),
    closeHistory: () => setIsOpen(false),
    fetchHistory,
    clearHistory
  };
}

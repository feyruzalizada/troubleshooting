import { useState, useEffect, useCallback } from 'react';
import { getErrorStats } from '../services/errorTracking';
import { getMetrics } from '../utils/metrics';

export const useErrorTracking = () => {
  const [stats, setStats] = useState({
    total: 0, last60s: 0, last5m: 0, byMinute: {}, bySeverity: {}, byContext: {},
  });
  const [recentErrors, setRecentErrors] = useState([]);

  const refresh = useCallback(() => {
    setStats(getErrorStats());
    const errors = getMetrics().errors;
    setRecentErrors([...errors].reverse().slice(0, 10));
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    window.addEventListener('enterprise:error', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('enterprise:error', refresh);
    };
  }, [refresh]);

  return { stats, recentErrors, refresh };
};

import { useState, useEffect, useCallback } from 'react';
import { getMetrics } from '../utils/metrics';

export const useErrorTracking = () => {
  const [recentErrors, setRecentErrors] = useState([]);
  const refresh = useCallback(() => {
    setRecentErrors([...( getMetrics().errors || [])].reverse().slice(0, 10));
  }, []);
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    window.addEventListener('enterprise:error', refresh);
    return () => { clearInterval(id); window.removeEventListener('enterprise:error', refresh); };
  }, [refresh]);
  return { recentErrors, stats: {}, refresh };
};

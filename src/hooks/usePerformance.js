import { useState, useEffect, useCallback } from 'react';
import { getMetricHistory, getLatestMetric } from '../services/analytics';

const NAMES = ['active_users', 'response_time_ms', 'error_rate_pct', 'availability_pct'];

export const usePerformance = () => {
  const [latest, setLatest]   = useState({});
  const [history, setHistory] = useState({});
  const refresh = useCallback(() => {
    const l = {}, h = {};
    NAMES.forEach((n) => {
      const e = getLatestMetric(n);
      l[n] = e ? e.value : null;
      h[n] = getMetricHistory(n, 20).map((e) => ({ time: new Date(e.timestamp).toLocaleTimeString(), value: e.value }));
    });
    setLatest(l); setHistory(h);
  }, []);
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);
  return { latest, history, refresh };
};

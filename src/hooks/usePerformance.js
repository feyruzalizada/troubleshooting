import { useState, useEffect, useCallback } from 'react';
import { getMetricHistory, getLatestMetric } from '../services/analytics';

const METRIC_NAMES = [
  'active_users',
  'response_time_ms',
  'throughput_rps',
  'error_rate_pct',
  'availability_pct',
  'revenue_impact_usd',
  'cpu_usage_pct',
  'memory_usage_pct',
  'saturation_pct',
];

export const usePerformance = (historyLimit = 20) => {
  const [latest, setLatest] = useState({});
  const [history, setHistory] = useState({});

  const refresh = useCallback(() => {
    const newLatest = {};
    const newHistory = {};
    METRIC_NAMES.forEach((name) => {
      const entry = getLatestMetric(name);
      newLatest[name] = entry ? entry.value : null;
      newHistory[name] = getMetricHistory(name, historyLimit).map((e) => ({
        time: new Date(e.timestamp).toLocaleTimeString(),
        value: e.value,
      }));
    });
    setLatest(newLatest);
    setHistory(newHistory);
  }, [historyLimit]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    window.addEventListener('enterprise:business', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('enterprise:business', refresh);
    };
  }, [refresh]);

  return { latest, history, refresh };
};

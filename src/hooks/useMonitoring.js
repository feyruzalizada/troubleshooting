import { useState, useEffect, useCallback } from 'react';
import { getMetrics } from '../utils/metrics';

export const useMonitoring = () => {
  const [metrics, setMetrics] = useState({ errors: [], performance: [], business: [], alerts: [] });
  const refresh = useCallback(() => setMetrics({ ...getMetrics() }), []);
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);
  return { metrics, refresh };
};

import { useState, useEffect, useCallback } from 'react';
import { getMetrics } from '../utils/metrics';

export const useMonitoring = (refreshMs = 3000) => {
  const [metrics, setMetrics] = useState({ errors: [], performance: [], business: [], alerts: [] });

  const refresh = useCallback(() => {
    setMetrics({ ...getMetrics() });
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshMs);

    const handlers = ['enterprise:error', 'enterprise:performance', 'enterprise:business', 'enterprise:alert'];
    handlers.forEach((ev) => window.addEventListener(ev, refresh));

    return () => {
      clearInterval(interval);
      handlers.forEach((ev) => window.removeEventListener(ev, refresh));
    };
  }, [refresh, refreshMs]);

  return { metrics, refresh };
};

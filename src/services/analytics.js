// Analytics service -- v1: basic metric simulation
import { recordBusinessMetric } from '../utils/metrics';
import { logger } from '../utils/logger';

const CTX = 'AnalyticsService';
let simulationInterval = null;

const tick = () => {
  const metrics = [
    { name: 'active_users',      value: Math.floor(Math.random() * 800 + 1200) },
    { name: 'response_time_ms',  value: Math.floor(Math.random() * 80 + 60)   },
    { name: 'error_rate_pct',    value: parseFloat((Math.random() * 0.5).toFixed(2)) },
    { name: 'availability_pct',  value: parseFloat((99 + Math.random()).toFixed(3)) },
  ];
  metrics.forEach(({ name, value }) => recordBusinessMetric(name, value));
};

export const startBusinessMetricSimulation = (intervalMs = 4000) => {
  if (simulationInterval) return;
  tick();
  simulationInterval = setInterval(tick, intervalMs);
  logger.info(CTX, `Simulation started (${intervalMs}ms interval)`);
};

export const stopBusinessMetricSimulation = () => {
  if (simulationInterval) { clearInterval(simulationInterval); simulationInterval = null; }
};

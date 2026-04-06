import { recordBusinessMetric, createAlert } from '../utils/metrics';
import { logger } from '../utils/logger';

const CTX = 'AnalyticsService';
let simulationInterval = null;

const generateActiveUsers = () => Math.floor(Math.random() * 800 + 1200);
const generateResponseTime = () => Math.floor(Math.random() * 200 + 80);
const generateThroughput = () => Math.floor(Math.random() * 500 + 2000);
const generateErrorRate = () => parseFloat((Math.random() * 2).toFixed(2));
const generateAvailability = () => parseFloat((99 + Math.random() * 0.99).toFixed(3));
const generateRevenueImpact = () => parseFloat((Math.random() * 50000 + 150000).toFixed(2));
const generateCPU = () => parseFloat((Math.random() * 40 + 20).toFixed(1));
const generateMemory = () => parseFloat((Math.random() * 30 + 45).toFixed(1));
const generateSaturation = () => parseFloat((Math.random() * 30 + 30).toFixed(1));

export const startBusinessMetricSimulation = (intervalMs = 5000) => {
  if (simulationInterval) return;

  const tick = () => {
    const errorRate = generateErrorRate();
    const availability = generateAvailability();
    const cpu = generateCPU();

    recordBusinessMetric('active_users', generateActiveUsers());
    recordBusinessMetric('response_time_ms', generateResponseTime());
    recordBusinessMetric('throughput_rps', generateThroughput());
    recordBusinessMetric('error_rate_pct', errorRate);
    recordBusinessMetric('availability_pct', availability);
    recordBusinessMetric('revenue_impact_usd', generateRevenueImpact());
    recordBusinessMetric('cpu_usage_pct', cpu);
    recordBusinessMetric('memory_usage_pct', generateMemory());
    recordBusinessMetric('saturation_pct', generateSaturation());

    if (errorRate > 1.5) {
      createAlert('High Error Rate', `Error rate at ${errorRate}% exceeds SLO threshold of 1%`, 'HIGH', 'analytics');
    }
    if (availability < 99.5) {
      createAlert('SLA Breach Risk', `Availability ${availability}% below 99.5% SLO target`, 'CRITICAL', 'sla-monitor');
    }
    if (cpu > 55) {
      createAlert('High CPU Utilization', `CPU at ${cpu}% - approaching saturation limit`, 'MEDIUM', 'infrastructure');
    }

    logger.debug(CTX, 'Business metrics tick recorded', { errorRate, availability, cpu });
  };

  tick();
  simulationInterval = setInterval(tick, intervalMs);
  logger.info(CTX, 'Business metric simulation started', { intervalMs });
};

export const stopBusinessMetricSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    logger.info(CTX, 'Business metric simulation stopped');
  }
};

export const getLatestMetric = (name) => {
  const all = window.__METRICS_STORE__?.business || [];
  const filtered = all.filter((m) => m.name === name);
  return filtered[filtered.length - 1] || null;
};

export const getMetricHistory = (name, limit = 20) => {
  const all = window.__METRICS_STORE__?.business || [];
  return all.filter((m) => m.name === name).slice(-limit);
};

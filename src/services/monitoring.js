// Monitoring service -- v1: Web Vitals collection only
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { recordPerformance, createAlert } from '../utils/metrics';
import { logger } from '../utils/logger';

const CTX = 'MonitoringService';

export const startVitalsCollection = () => {
  const handle = ({ name, value, rating }) => {
    recordPerformance(name, value, rating);
    logger.info(CTX, `${name}: ${value.toFixed(2)} (${rating})`);
    if (rating === 'poor') {
      createAlert(`${name} degraded`, `${name} is ${value.toFixed(0)} ms -- poor`, 'HIGH', CTX);
    }
  };
  onLCP(handle); onFCP(handle); onCLS(handle); onINP(handle); onTTFB(handle);
  logger.info(CTX, 'Web Vitals collection started');
};

export const startAllMonitoring = () => {
  startVitalsCollection();
};

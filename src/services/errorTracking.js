import { recordError, getMetrics } from '../utils/metrics';
import { logger } from '../utils/logger';

const CTX = 'ErrorTrackingService';

export const trackError = (error, context = 'unknown', severity = 'ERROR') => {
  const recorded = recordError(error, context, severity);
  logger.error(CTX, `Error tracked in [${context}]`, {
    message: recorded.message,
    severity,
    id: recorded.id,
  });
  return recorded;
};

export const trackPlatformError = (error, platform, component) => {
  return trackError(error, `platform:${platform}:${component}`, 'ERROR');
};

export const trackRenderError = (error, componentStack, component) => {
  const msg = error?.message || String(error);
  logger.critical(CTX, `React render error in <${component}>`, { msg, componentStack });
  return recordError({ message: msg, stack: componentStack }, `render:${component}`, 'CRITICAL');
};

export const getErrorStats = () => {
  const errors = getMetrics().errors;
  const now = Date.now();
  const bySeverity = errors.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    return acc;
  }, {});
  const byContext = errors.reduce((acc, e) => {
    acc[e.context] = (acc[e.context] || 0) + 1;
    return acc;
  }, {});
  return {
    total: errors.length,
    last60s: errors.filter((e) => now - e.timestamp < 60000).length,
    last5m: errors.filter((e) => now - e.timestamp < 300000).length,
    bySeverity,
    byContext,
  };
};

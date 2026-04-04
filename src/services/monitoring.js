import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from 'web-vitals';
import { recordPerformance, createAlert } from '../utils/metrics';
import { logger } from '../utils/logger';

const CTX = 'MonitoringService';
let vitalsCollected = false;

export const startVitalsCollection = () => {
  if (vitalsCollected) return;
  vitalsCollected = true;

  const handle = (metric) => {
    const recorded = recordPerformance(metric.name, metric.value);
    logger.info(CTX, `Web Vital collected: ${metric.name}`, { value: metric.value, rating: recorded.rating });
    if (recorded.rating === 'poor') {
      createAlert(`Poor ${metric.name} Detected`, `${metric.name} value of ${metric.value.toFixed(2)} exceeds threshold`, 'HIGH', 'web-vitals');
    }
  };

  onLCP(handle);
  onFCP(handle);
  onCLS(handle);
  onTTFB(handle);
  onINP(handle);
  try { onFID(handle); } catch {}
  logger.info(CTX, 'Web Vitals collection started');
};

export const startGlobalErrorCapture = () => {
  window.addEventListener('error', (event) => {
    logger.critical(CTX, 'Uncaught global error', { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno });
  });
  window.addEventListener('unhandledrejection', (event) => {
    logger.critical(CTX, 'Unhandled Promise rejection', { reason: String(event.reason) });
  });
  logger.info(CTX, 'Global error capture active');
};

export const startResourceMonitoring = () => {
  if (!window.PerformanceObserver) return;
  try {
    const observer = new window.PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 2000) {
          logger.warn(CTX, `Slow resource: ${entry.name}`, { duration: entry.duration });
          createAlert('Slow Resource Load', `Resource "${entry.name.split('/').pop()}" took ${entry.duration.toFixed(0)}ms`, 'MEDIUM', 'resource-monitor');
        }
      }
    });
    observer.observe({ entryTypes: ['resource'] });
    logger.info(CTX, 'Resource monitoring active');
  } catch (e) {
    logger.warn(CTX, 'Resource monitoring unavailable', { error: e.message });
  }
};

export const startLongTaskMonitoring = () => {
  if (!window.PerformanceObserver) return;
  try {
    const observer = new window.PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.warn(CTX, `Long task: ${entry.duration.toFixed(0)}ms`, { startTime: entry.startTime, duration: entry.duration });
        if (entry.duration > 500) {
          createAlert('Long Task Blocking UI', `Main thread blocked for ${entry.duration.toFixed(0)}ms`, 'HIGH', 'long-task-monitor');
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
    logger.info(CTX, 'Long task monitoring active');
  } catch (e) {
    logger.warn(CTX, 'Long task monitoring unavailable', { error: e.message });
  }
};

export const startAllMonitoring = () => {
  startVitalsCollection();
  startGlobalErrorCapture();
  startResourceMonitoring();
  startLongTaskMonitoring();
  logger.info(CTX, 'All monitoring services started');
};

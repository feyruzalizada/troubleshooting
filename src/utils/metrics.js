// Metrics store -- v2: session + error/perf recording
import { v4 as uuidv4 } from 'uuid';

export const initSession = () => {
  window.__METRICS_STORE__ = {
    errors: [], performance: [], business: [], alerts: [],
    session: { id: uuidv4(), startTime: Date.now() },
  };
};

export const getMetrics = () => window.__METRICS_STORE__ || {};

export const recordError = (error, context = 'unknown', severity = 'ERROR') => {
  const store = window.__METRICS_STORE__;
  if (!store) return;
  store.errors.push({
    id: uuidv4(), message: error?.message || String(error),
    stack: error?.stack || null, context, severity, timestamp: Date.now(),
  });
  if (store.errors.length > 200) store.errors.shift();
  window.dispatchEvent(new CustomEvent('enterprise:error'));
};

export const recordPerformance = (name, value, rating = 'unknown') => {
  const store = window.__METRICS_STORE__;
  if (!store) return;
  store.performance.push({ id: uuidv4(), name, value, rating, timestamp: Date.now() });
  if (store.performance.length > 200) store.performance.shift();
  window.dispatchEvent(new CustomEvent('enterprise:performance'));
};

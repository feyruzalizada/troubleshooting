import { v4 as uuidv4 } from 'uuid';

export const initSession = () => {
  if (!window.__SESSION_ID__) {
    window.__SESSION_ID__ = uuidv4();
    window.__SESSION_START__ = Date.now();
    window.__METRICS_STORE__ = {
      errors: [],
      performance: [],
      business: [],
      alerts: [],
    };
  }
};

export const recordError = (error, context, severity = 'ERROR') => {
  const entry = {
    id: uuidv4(),
    timestamp: Date.now(),
    message: error?.message || String(error),
    stack: error?.stack || null,
    context,
    severity,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  window.__METRICS_STORE__.errors.push(entry);
  if (window.__METRICS_STORE__.errors.length > 200) window.__METRICS_STORE__.errors.shift();
  window.dispatchEvent(new CustomEvent('enterprise:error', { detail: entry }));
  return entry;
};

export const recordPerformance = (name, value, unit = 'ms') => {
  const entry = { id: uuidv4(), timestamp: Date.now(), name, value, unit, rating: getRating(name, value) };
  window.__METRICS_STORE__.performance.push(entry);
  window.dispatchEvent(new CustomEvent('enterprise:performance', { detail: entry }));
  return entry;
};

export const recordBusinessMetric = (name, value, meta = {}) => {
  const entry = { id: uuidv4(), timestamp: Date.now(), name, value, ...meta };
  window.__METRICS_STORE__.business.push(entry);
  window.dispatchEvent(new CustomEvent('enterprise:business', { detail: entry }));
  return entry;
};

export const createAlert = (title, message, severity = 'WARNING', service = 'system') => {
  const entry = {
    id: uuidv4(),
    timestamp: Date.now(),
    title, message, severity, service,
    acknowledged: false,
    resolved: false,
  };
  window.__METRICS_STORE__.alerts.push(entry);
  window.dispatchEvent(new CustomEvent('enterprise:alert', { detail: entry }));
  return entry;
};

export const acknowledgeAlert = (id) => {
  const alert = window.__METRICS_STORE__.alerts.find((a) => a.id === id);
  if (alert) alert.acknowledged = true;
  window.dispatchEvent(new CustomEvent('enterprise:alert:ack', { detail: { id } }));
};

export const resolveAlert = (id) => {
  const alert = window.__METRICS_STORE__.alerts.find((a) => a.id === id);
  if (alert) { alert.resolved = true; alert.resolvedAt = Date.now(); }
  window.dispatchEvent(new CustomEvent('enterprise:alert:resolve', { detail: { id } }));
};

export const getMetrics = () => window.__METRICS_STORE__ || { errors: [], performance: [], business: [], alerts: [] };

const getRating = (name, value) => {
  const thresholds = {
    LCP: [2500, 4000], FCP: [1800, 3000], CLS: [0.1, 0.25],
    FID: [100, 300], TTFB: [800, 1800], INP: [200, 500],
  };
  const t = thresholds[name];
  if (!t) return 'unknown';
  if (value <= t[0]) return 'good';
  if (value <= t[1]) return 'needs-improvement';
  return 'poor';
};

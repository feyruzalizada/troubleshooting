// Metrics store -- v1: bare store initialisation
export const initStore = () => {
  window.__METRICS_STORE__ = {
    errors:      [],
    performance: [],
    business:    [],
    alerts:      [],
    session:     null,
  };
};

export const getMetrics = () => window.__METRICS_STORE__ || {};

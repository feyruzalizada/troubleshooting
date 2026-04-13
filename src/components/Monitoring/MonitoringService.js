import React, { useEffect, useState } from 'react';
import { startAllMonitoring } from '../../services/monitoring';
import { startBusinessMetricSimulation, stopBusinessMetricSimulation } from '../../services/analytics';
import { logger } from '../../utils/logger';

const styles = {
  card: { background: '#1e293b', borderRadius: '8px', padding: '20px' },
  title: { color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f172a' },
  label: { color: '#e2e8f0', fontSize: '13px' },
  desc: { color: '#475569', fontSize: '11px', marginTop: '2px' },
  statusBadge: (active) => ({
    background: active ? '#14532d' : '#1e293b',
    color: active ? '#86efac' : '#64748b',
    border: `1px solid ${active ? '#22c55e' : '#334155'}`,
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: 700,
  }),
  toggleBtn: (active) => ({
    background: active ? '#7f1d1d' : '#1e3a5f',
    color: active ? '#fca5a5' : '#93c5fd',
    border: `1px solid ${active ? '#ef4444' : '#3b82f6'}`,
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    marginLeft: '8px',
    fontFamily: 'monospace',
  }),
  actions: { display: 'flex', alignItems: 'center', gap: '0' },
};

const SERVICES = [
  { id: 'web-vitals', label: 'Web Vitals Collector', desc: 'LCP, FCP, CLS, INP, TTFB — Core Web Vitals via web-vitals library', toggleable: false },
  { id: 'global-errors', label: 'Global Error Capture', desc: 'window.onerror + unhandledrejection handler', toggleable: false },
  { id: 'resource-monitor', label: 'Resource Observer', desc: 'PerformanceObserver tracking slow resource loads (>2s)', toggleable: false },
  { id: 'longtask-monitor', label: 'Long Task Monitor', desc: 'PerformanceObserver for main thread blocks (>500ms)', toggleable: false },
  { id: 'business-sim', label: 'Business Metric Simulation', desc: 'Generates KPI data every 4s: users, RPS, error rate, revenue', toggleable: true },
];

const MonitoringServicePanel = () => {
  const [statuses, setStatuses] = useState({
    'web-vitals': true,
    'global-errors': true,
    'resource-monitor': true,
    'longtask-monitor': true,
    'business-sim': true,
  });

  useEffect(() => {
    startAllMonitoring();
    startBusinessMetricSimulation(4000);
    logger.info('MonitoringServicePanel', 'All services initialized on mount');
  }, []);

  const toggle = (id) => {
    setStatuses((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === 'business-sim') {
        if (next[id]) {
          startBusinessMetricSimulation(4000);
          logger.info('MonitoringServicePanel', 'Business simulation resumed');
        } else {
          stopBusinessMetricSimulation();
          logger.warn('MonitoringServicePanel', 'Business simulation paused by user');
        }
      }
      return next;
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.title}>Monitoring Services Registry</p>
      {SERVICES.map((svc) => (
        <div key={svc.id} style={styles.row}>
          <div>
            <div style={styles.label}>{svc.label}</div>
            <div style={styles.desc}>{svc.desc}</div>
          </div>
          <div style={styles.actions}>
            <span style={styles.statusBadge(statuses[svc.id])}>
              {statuses[svc.id] ? 'ACTIVE' : 'PAUSED'}
            </span>
            {svc.toggleable && (
              <button style={styles.toggleBtn(statuses[svc.id])} onClick={() => toggle(svc.id)}>
                {statuses[svc.id] ? 'PAUSE' : 'RESUME'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonitoringServicePanel;

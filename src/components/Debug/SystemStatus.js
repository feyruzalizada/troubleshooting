import React, { useState, useEffect } from 'react';
import { useMonitoring } from '../../hooks/useMonitoring';

const styles = {
  bar: {
    position: 'fixed',
    bottom: '280px',
    left: 0,
    right: 0,
    background: '#0f172a',
    borderTop: '1px solid #1e293b',
    padding: '4px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    fontFamily: 'monospace',
    fontSize: '11px',
    zIndex: 9998,
  },
  section: { display: 'flex', alignItems: 'center', gap: '8px' },
  label: { color: '#475569' },
  val: (ok) => ({ color: ok ? '#22c55e' : '#ef4444', fontWeight: 700 }),
  sep: { color: '#1e293b' },
  uptime: { color: '#334155', marginLeft: 'auto' },
};

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
};

const SystemStatus = () => {
  const { metrics } = useMonitoring(2000);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.__SESSION_START__) {
        setUptime(Math.floor((Date.now() - window.__SESSION_START__) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = metrics.alerts.filter((a) => !a.resolved).length;
  const criticalAlerts = metrics.alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length;
  const errorCount = metrics.errors.length;
  const vitals = metrics.performance;
  const lastLCP = [...vitals].filter((v) => v.name === 'LCP').pop();
  const lastFCP = [...vitals].filter((v) => v.name === 'FCP').pop();

  return (
    <div style={styles.bar}>
      <div style={styles.section}>
        <span style={styles.label}>ERRORS:</span>
        <span style={styles.val(errorCount === 0)}>{errorCount}</span>
      </div>
      <span style={styles.sep}>|</span>
      <div style={styles.section}>
        <span style={styles.label}>ALERTS:</span>
        <span style={styles.val(activeAlerts === 0)}>{activeAlerts}</span>
        {criticalAlerts > 0 && <span style={{ color: '#ef4444', fontWeight: 800 }}>({criticalAlerts} CRIT)</span>}
      </div>
      <span style={styles.sep}>|</span>
      <div style={styles.section}>
        <span style={styles.label}>LCP:</span>
        <span style={{ color: lastLCP?.rating === 'good' ? '#22c55e' : lastLCP?.rating === 'poor' ? '#ef4444' : '#eab308' }}>
          {lastLCP ? `${lastLCP.value.toFixed(0)}ms` : 'pending'}
        </span>
      </div>
      <span style={styles.sep}>|</span>
      <div style={styles.section}>
        <span style={styles.label}>FCP:</span>
        <span style={{ color: lastFCP?.rating === 'good' ? '#22c55e' : lastFCP?.rating === 'poor' ? '#ef4444' : '#eab308' }}>
          {lastFCP ? `${lastFCP.value.toFixed(0)}ms` : 'pending'}
        </span>
      </div>
      <span style={styles.sep}>|</span>
      <div style={styles.section}>
        <span style={styles.label}>SESSION:</span>
        <span style={{ color: '#38bdf8' }}>{window.__SESSION_ID__?.slice(0, 8) || '—'}</span>
      </div>
      <div style={styles.uptime}>UPTIME: {fmt(uptime)}</div>
    </div>
  );
};

export default SystemStatus;

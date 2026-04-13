import React, { useState, useEffect, useCallback } from 'react';
import { getMetrics } from '../../utils/metrics';

const RATING_COLOR = { good: '#22c55e', 'needs-improvement': '#eab308', poor: '#ef4444', unknown: '#475569' };

const VITAL_INFO = {
  LCP: { label: 'Largest Contentful Paint', unit: 'ms', good: 2500, poor: 4000 },
  FCP: { label: 'First Contentful Paint', unit: 'ms', good: 1800, poor: 3000 },
  CLS: { label: 'Cumulative Layout Shift', unit: '', good: 0.1, poor: 0.25 },
  INP: { label: 'Interaction to Next Paint', unit: 'ms', good: 200, poor: 500 },
  TTFB: { label: 'Time to First Byte', unit: 'ms', good: 800, poor: 1800 },
  FID: { label: 'First Input Delay', unit: 'ms', good: 100, poor: 300 },
};

const styles = {
  card: { background: '#1e293b', borderRadius: '8px', padding: '20px' },
  title: { color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  vitalCard: (rating) => ({
    background: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    borderTop: `3px solid ${RATING_COLOR[rating] || '#475569'}`,
  }),
  vitalName: { color: '#e2e8f0', fontSize: '13px', fontWeight: 700, marginBottom: '4px' },
  vitalLabel: { color: '#475569', fontSize: '11px', marginBottom: '12px' },
  vitalValue: (rating) => ({
    color: RATING_COLOR[rating] || '#64748b',
    fontSize: '26px',
    fontWeight: 700,
    fontFamily: 'monospace',
    marginBottom: '8px',
  }),
  ratingBadge: (rating) => ({
    display: 'inline-block',
    background: RATING_COLOR[rating] + '22',
    color: RATING_COLOR[rating] || '#475569',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase',
    marginBottom: '8px',
  }),
  thresholds: { color: '#334155', fontSize: '10px' },
  pending: { color: '#334155', fontSize: '20px', fontFamily: 'monospace' },
  note: { color: '#475569', fontSize: '11px', marginTop: '16px', lineHeight: '1.6' },
};

const PerformanceObserverPanel = () => {
  const [vitals, setVitals] = useState({});

  const refresh = useCallback(() => {
    const perf = getMetrics().performance;
    const latest = {};
    perf.forEach((entry) => {
      latest[entry.name] = entry;
    });
    setVitals(latest);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('enterprise:performance', refresh);
    return () => window.removeEventListener('enterprise:performance', refresh);
  }, [refresh]);

  return (
    <div style={styles.card}>
      <p style={styles.title}>Core Web Vitals — PerformanceObserver Results</p>

      <div style={styles.grid}>
        {Object.entries(VITAL_INFO).map(([name, info]) => {
          const entry = vitals[name];
          const rating = entry?.rating || 'unknown';
          return (
            <div key={name} style={styles.vitalCard(rating)}>
              <div style={styles.vitalName}>{name}</div>
              <div style={styles.vitalLabel}>{info.label}</div>
              {entry ? (
                <>
                  <div style={styles.vitalValue(rating)}>
                    {entry.value.toFixed(name === 'CLS' ? 4 : 0)}{info.unit}
                  </div>
                  <div style={styles.ratingBadge(rating)}>{rating}</div>
                  <div style={styles.thresholds}>
                    Good: ≤{info.good}{info.unit} &nbsp;|&nbsp; Poor: &gt;{info.poor}{info.unit}
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.pending}>—</div>
                  <div style={styles.ratingBadge('unknown')}>PENDING</div>
                  <div style={styles.thresholds}>
                    Good: ≤{info.good}{info.unit} &nbsp;|&nbsp; Poor: &gt;{info.poor}{info.unit}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p style={styles.note}>
        Web Vitals are collected automatically after page load via the web-vitals library.
        LCP and FCP fire after the first meaningful paint. CLS accumulates over the page lifetime.
        INP fires after the first user interaction. TTFB is available immediately after navigation.
        FID requires a real user interaction and may not appear in automated environments.
      </p>
    </div>
  );
};

export default PerformanceObserverPanel;

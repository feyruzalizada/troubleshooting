import React, { useState, useEffect, useCallback } from 'react';
import { getMetrics, acknowledgeAlert, resolveAlert } from '../../utils/metrics';

const SEVERITY_COLORS = {
  CRITICAL: { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5', dot: '#ef4444' },
  HIGH: { bg: '#7c2d12', border: '#f97316', text: '#fdba74', dot: '#f97316' },
  MEDIUM: { bg: '#713f12', border: '#eab308', text: '#fde047', dot: '#eab308' },
  LOW: { bg: '#14532d', border: '#22c55e', text: '#86efac', dot: '#22c55e' },
  WARNING: { bg: '#713f12', border: '#eab308', text: '#fde047', dot: '#eab308' },
};

const styles = {
  panel: { background: '#1e293b', borderRadius: '8px', overflow: 'hidden' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
  },
  title: { color: '#e2e8f0', fontWeight: 700, fontSize: '15px' },
  badge: {
    background: '#ef4444',
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '12px',
    fontWeight: 700,
  },
  list: { maxHeight: '380px', overflowY: 'auto' },
  empty: { padding: '32px', textAlign: 'center', color: '#475569', fontSize: '13px' },
  item: (sev, ack) => ({
    padding: '14px 20px',
    borderBottom: '1px solid #1e293b',
    background: ack ? '#0f172a' : SEVERITY_COLORS[sev]?.bg || '#1e293b',
    opacity: ack ? 0.6 : 1,
  }),
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  itemTitle: (sev) => ({
    color: SEVERITY_COLORS[sev]?.text || '#e2e8f0',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  dot: (sev) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: SEVERITY_COLORS[sev]?.dot || '#64748b',
    flexShrink: 0,
  }),
  sevBadge: (sev) => ({
    background: SEVERITY_COLORS[sev]?.border || '#64748b',
    color: '#0f172a',
    borderRadius: '3px',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: 800,
  }),
  message: { color: '#94a3b8', fontSize: '12px', marginBottom: '8px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: '#475569', fontSize: '11px' },
  actions: { display: 'flex', gap: '8px' },
  btn: (color) => ({
    background: 'transparent',
    color: color,
    border: `1px solid ${color}`,
    borderRadius: '4px',
    padding: '2px 10px',
    cursor: 'pointer',
    fontSize: '11px',
  }),
};

const AlertPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('active');

  const refresh = useCallback(() => {
    setAlerts([...getMetrics().alerts].reverse());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('enterprise:alert', refresh);
    window.addEventListener('enterprise:alert:ack', refresh);
    window.addEventListener('enterprise:alert:resolve', refresh);
    return () => {
      window.removeEventListener('enterprise:alert', refresh);
      window.removeEventListener('enterprise:alert:ack', refresh);
      window.removeEventListener('enterprise:alert:resolve', refresh);
    };
  }, [refresh]);

  const displayed = alerts.filter((a) => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'critical') return a.severity === 'CRITICAL' && !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>Active Alerts</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['active', 'critical', 'resolved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#3b82f6' : 'transparent',
                color: filter === f ? '#fff' : '#64748b',
                border: `1px solid ${filter === f ? '#3b82f6' : '#334155'}`,
                borderRadius: '4px',
                padding: '3px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
          {activeCount > 0 && <span style={styles.badge}>{activeCount}</span>}
        </div>
      </div>

      <div style={styles.list}>
        {displayed.length === 0 ? (
          <div style={styles.empty}>No alerts matching filter "{filter}"</div>
        ) : (
          displayed.map((alert) => (
            <div key={alert.id} style={styles.item(alert.severity, alert.acknowledged)}>
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle(alert.severity)}>
                  <span style={styles.dot(alert.severity)} />
                  {alert.title}
                </div>
                <span style={styles.sevBadge(alert.severity)}>{alert.severity}</span>
              </div>
              <div style={styles.message}>{alert.message}</div>
              <div style={styles.footer}>
                <span style={styles.time}>
                  {new Date(alert.timestamp).toLocaleTimeString()} — {alert.service}
                  {alert.resolved && ' — RESOLVED'}
                  {alert.acknowledged && !alert.resolved && ' — ACK'}
                </span>
                {!alert.resolved && (
                  <div style={styles.actions}>
                    {!alert.acknowledged && (
                      <button style={styles.btn('#94a3b8')} onClick={() => { acknowledgeAlert(alert.id); refresh(); }}>
                        ACK
                      </button>
                    )}
                    <button style={styles.btn('#22c55e')} onClick={() => { resolveAlert(alert.id); refresh(); }}>
                      RESOLVE
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPanel;

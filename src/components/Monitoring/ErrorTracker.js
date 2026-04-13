import React, { useState } from 'react';
import { useErrorTracking } from '../../hooks/useErrorTracking';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const styles = {
  card: { background: '#1e293b', borderRadius: '8px', padding: '20px' },
  title: { color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' },
  statCard: (color) => ({
    background: '#0f172a',
    borderRadius: '6px',
    padding: '14px',
    borderLeft: `3px solid ${color}`,
  }),
  statLabel: { color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' },
  statVal: (color) => ({ color, fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' }),
  section: { marginTop: '16px' },
  sectionTitle: { color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '10px' },
  ctxRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f172a', fontSize: '12px' },
  ctxKey: { color: '#94a3b8' },
  ctxVal: { color: '#38bdf8', fontFamily: 'monospace' },
  tooltip: { background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#e2e8f0' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={styles.tooltip}>
      <div style={{ color: '#64748b', marginBottom: '4px' }}>{label}</div>
      <div>{payload[0]?.value} errors</div>
    </div>
  );
};

const ErrorTracker = () => {
  const { stats } = useErrorTracking();

  const severityData = Object.entries(stats.bySeverity || {}).map(([name, value]) => ({ name, value }));
  const contextData = Object.entries(stats.byContext || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div style={styles.card}>
      <p style={styles.title}>Error Tracker — Aggregated Statistics</p>

      <div style={styles.grid}>
        <div style={styles.statCard('#ef4444')}>
          <div style={styles.statLabel}>Total</div>
          <div style={styles.statVal('#e2e8f0')}>{stats.total}</div>
        </div>
        <div style={styles.statCard(stats.last60s > 3 ? '#ef4444' : '#22c55e')}>
          <div style={styles.statLabel}>Last 60s</div>
          <div style={styles.statVal(stats.last60s > 3 ? '#ef4444' : '#22c55e')}>{stats.last60s}</div>
        </div>
        <div style={styles.statCard('#f97316')}>
          <div style={styles.statLabel}>Last 5 min</div>
          <div style={styles.statVal('#f97316')}>{stats.last5m}</div>
        </div>
        <div style={styles.statCard('#a78bfa')}>
          <div style={styles.statLabel}>Critical</div>
          <div style={styles.statVal('#a78bfa')}>{stats.bySeverity?.CRITICAL || 0}</div>
        </div>
      </div>

      {severityData.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Errors by Severity</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={severityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {contextData.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Top Error Sources</p>
          {contextData.map(([ctx, count]) => (
            <div key={ctx} style={styles.ctxRow}>
              <span style={styles.ctxKey}>{ctx}</span>
              <span style={styles.ctxVal}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {stats.total === 0 && (
        <div style={{ color: '#334155', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
          No errors recorded. Navigate to Error Tracking tab to trigger test errors.
        </div>
      )}
    </div>
  );
};

export default ErrorTracker;

import React, { useState, useEffect, useCallback } from 'react';
import { getMetrics } from '../../utils/metrics';

const styles = {
  root: { background: '#1e293b', borderRadius: '8px', overflow: 'hidden' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid #0f172a',
  },
  title: { color: '#e2e8f0', fontSize: '13px', fontWeight: 700 },
  toggleBtn: (active) => ({
    background: active ? '#14532d' : 'transparent',
    color: active ? '#86efac' : '#475569',
    border: `1px solid ${active ? '#22c55e' : '#334155'}`,
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  }),
  refreshBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    color: '#38bdf8',
    border: '1px solid #1e3a5f',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  },
  body: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
  section: { borderRight: '1px solid #0f172a', borderBottom: '1px solid #0f172a' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#0f172a',
    cursor: 'pointer',
    userSelect: 'none',
  },
  sectionTitle: { color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' },
  sectionCount: { color: '#475569', fontSize: '11px', fontFamily: 'monospace' },
  sectionBody: { padding: '12px 14px', maxHeight: '260px', overflowY: 'auto' },
  entryCard: (selected) => ({
    background: selected ? '#1e3a5f' : '#0f172a',
    borderRadius: '4px',
    padding: '8px 10px',
    marginBottom: '6px',
    cursor: 'pointer',
    border: `1px solid ${selected ? '#3b82f6' : 'transparent'}`,
  }),
  entryTime: { color: '#334155', fontSize: '10px' },
  entryMain: { color: '#e2e8f0', fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  entryBadge: (color) => ({
    display: 'inline-block',
    background: color + '22',
    color,
    borderRadius: '3px',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: 700,
    marginRight: '6px',
  }),
  detail: {
    padding: '16px',
    background: '#020617',
    borderTop: '1px solid #0f172a',
    gridColumn: '1 / -1',
  },
  detailTitle: { color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' },
  json: {
    background: '#0f172a',
    borderRadius: '6px',
    padding: '14px',
    color: '#94a3b8',
    fontSize: '11px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    maxHeight: '200px',
    overflowY: 'auto',
    lineHeight: '1.6',
  },
  empty: { color: '#334155', fontSize: '11px', padding: '12px 0' },
};

const SEV_COLORS = { CRITICAL: '#ef4444', ERROR: '#f97316', WARN: '#eab308', INFO: '#38bdf8' };
const RATING_COLORS = { good: '#22c55e', 'needs-improvement': '#eab308', poor: '#ef4444' };

const EntryCard = ({ entry, section, selected, onSelect }) => {
  const renderMain = () => {
    if (section === 'errors') return entry.message || 'Unknown error';
    if (section === 'performance') return `${entry.name}: ${entry.value?.toFixed ? entry.value.toFixed(2) : entry.value}`;
    if (section === 'business') return `${entry.name}: ${entry.value}`;
    if (section === 'alerts') return entry.title || 'Alert';
    return JSON.stringify(entry).slice(0, 60);
  };

  const renderBadge = () => {
    if (section === 'errors') return <span style={styles.entryBadge(SEV_COLORS[entry.severity] || '#64748b')}>{entry.severity}</span>;
    if (section === 'performance') return <span style={styles.entryBadge(RATING_COLORS[entry.rating] || '#64748b')}>{entry.rating}</span>;
    if (section === 'alerts') return <span style={styles.entryBadge(SEV_COLORS[entry.severity] || '#64748b')}>{entry.severity}</span>;
    return null;
  };

  return (
    <div style={styles.entryCard(selected)} onClick={() => onSelect(entry)}>
      <div style={styles.entryTime}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
      <div style={styles.entryMain}>{renderBadge()}{renderMain()}</div>
    </div>
  );
};

const Section = ({ title, items, section, selectedId, onSelect }) => {
  const [open, setOpen] = useState(true);

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader} onClick={() => setOpen((v) => !v)}>
        <span style={styles.sectionTitle}>{title}</span>
        <span style={styles.sectionCount}>{items.length} {open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={styles.sectionBody}>
          {items.length === 0
            ? <div style={styles.empty}>No entries</div>
            : [...items].reverse().slice(0, 30).map((entry) => (
              <EntryCard
                key={entry.id || entry.timestamp}
                entry={entry}
                section={section}
                selected={selectedId === (entry.id || entry.timestamp)}
                onSelect={onSelect}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const colorizeJson = (json) => json
  .replace(/"([^"]+)":/g, '<span style="color:#93c5fd">\"$1\"</span>:')
  .replace(/: "([^"]+)"/g, ': <span style="color:#86efac">\"$1\"</span>')
  .replace(/: (\d+\.?\d*)/g, ': <span style="color:#fbbf24">$1</span>')
  .replace(/: (true|false|null)/g, ': <span style="color:#f472b6">$1</span>');

const StateInspector = () => {
  const [metrics, setMetrics] = useState({ errors: [], performance: [], business: [], alerts: [] });
  const [selected, setSelected] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(() => setMetrics({ ...getMetrics() }), []);

  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const interval = setInterval(refresh, 2000);
    const events = ['enterprise:error', 'enterprise:performance', 'enterprise:business', 'enterprise:alert'];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => {
      clearInterval(interval);
      events.forEach((e) => window.removeEventListener(e, refresh));
    };
  }, [refresh, autoRefresh]);

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <span style={styles.title}>State Inspector — window.__METRICS_STORE__</span>
        <button style={styles.toggleBtn(autoRefresh)} onClick={() => setAutoRefresh((v) => !v)}>
          LIVE {autoRefresh ? 'ON' : 'OFF'}
        </button>
        <button style={styles.refreshBtn} onClick={refresh}>REFRESH</button>
      </div>

      <div style={styles.body}>
        <Section title="Errors" items={metrics.errors} section="errors" selectedId={selected?.id || selected?.timestamp} onSelect={setSelected} />
        <Section title="Performance" items={metrics.performance} section="performance" selectedId={selected?.id} onSelect={setSelected} />
        <Section title="Business Metrics" items={metrics.business} section="business" selectedId={selected?.id} onSelect={setSelected} />
        <Section title="Alerts" items={metrics.alerts} section="alerts" selectedId={selected?.id} onSelect={setSelected} />

        {selected && (
          <div style={styles.detail}>
            <div style={styles.detailTitle}>Selected Entry — Raw State</div>
            <div
              style={styles.json}
              dangerouslySetInnerHTML={{ __html: colorizeJson(JSON.stringify(selected, null, 2)) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StateInspector;

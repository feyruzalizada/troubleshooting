import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getNetworkLog, clearNetworkLog } from '../../services/networkInterceptor';

const STATUS_COLOR = {
  success: '#22c55e',
  redirect: '#38bdf8',
  'client-error': '#eab308',
  'server-error': '#ef4444',
  pending: '#64748b',
};

const METHOD_COLOR = {
  GET: '#38bdf8',
  POST: '#a78bfa',
  PUT: '#fbbf24',
  PATCH: '#fb923c',
  DELETE: '#ef4444',
  OPTIONS: '#64748b',
};

const styles = {
  root: { background: '#1e293b', borderRadius: '8px', overflow: 'hidden' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: '1px solid #0f172a',
    flexWrap: 'wrap',
  },
  title: { color: '#e2e8f0', fontSize: '13px', fontWeight: 700, marginRight: '4px' },
  filterBtn: (active, color = '#38bdf8') => ({
    background: active ? color + '22' : 'transparent',
    color: active ? color : '#475569',
    border: `1px solid ${active ? color : '#334155'}`,
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  }),
  clearBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    color: '#475569',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px 12px', color: '#475569', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #0f172a', background: '#0f172a' },
  td: { padding: '8px 12px', fontSize: '11px', borderBottom: '1px solid #0f172a', fontFamily: 'monospace', verticalAlign: 'middle' },
  methodBadge: (method) => ({
    display: 'inline-block',
    background: (METHOD_COLOR[method] || '#64748b') + '22',
    color: METHOD_COLOR[method] || '#64748b',
    borderRadius: '3px',
    padding: '1px 6px',
    fontWeight: 800,
    fontSize: '10px',
  }),
  statusBadge: (cat) => ({
    display: 'inline-block',
    background: (STATUS_COLOR[cat] || '#475569') + '22',
    color: STATUS_COLOR[cat] || '#475569',
    borderRadius: '3px',
    padding: '1px 7px',
    fontWeight: 700,
    fontSize: '11px',
  }),
  url: { color: '#94a3b8', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  duration: (ms) => ({ color: ms > 1000 ? '#ef4444' : ms > 500 ? '#eab308' : '#22c55e' }),
  empty: { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '12px' },
  scroll: { maxHeight: '380px', overflowY: 'auto' },
  count: { color: '#475569', fontSize: '11px', marginLeft: '4px' },
};

const FILTERS = ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'ERRORS'];

const NetworkMonitor = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const scrollRef = useRef(null);

  const refresh = useCallback(() => {
    setRequests([...getNetworkLog()].reverse());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('enterprise:network', refresh);
    return () => window.removeEventListener('enterprise:network', refresh);
  }, [refresh]);

  const displayed = requests.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'ERRORS') return r.category === 'server-error' || r.category === 'client-error';
    return r.method === filter;
  });

  const deduplicated = displayed.filter((r, idx, arr) => {
    if (r.status !== null) return true;
    return !arr.find((other, oi) => oi < idx && other.id === r.id && other.status !== null);
  });

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <span style={styles.title}>Network Monitor</span>
        {FILTERS.map((f) => (
          <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
        <span style={styles.count}>{deduplicated.length} requests</span>
        <button style={styles.clearBtn} onClick={() => { clearNetworkLog(); setRequests([]); }}>
          CLEAR
        </button>
      </div>

      <div style={styles.scroll} ref={scrollRef}>
        {deduplicated.length === 0 ? (
          <div style={styles.empty}>
            No network requests captured yet.<br />
            Requests made via fetch() or XMLHttpRequest will appear here.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>URL</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Size</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {deduplicated.map((r) => (
                <tr key={r.id + (r.status || 'pending')} style={{ background: r.category === 'server-error' ? '#1c0a0a' : 'transparent' }}>
                  <td style={styles.td}><span style={styles.methodBadge(r.method)}>{r.method}</span></td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(r.category)}>
                      {r.status !== null ? r.status : '…'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.url} title={r.url}>{r.shortUrl || r.url}</span>
                  </td>
                  <td style={styles.td}>
                    {r.duration !== null
                      ? <span style={styles.duration(r.duration)}>{r.duration}ms</span>
                      : <span style={{ color: '#334155' }}>…</span>}
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: '#64748b' }}>
                      {r.size ? `${(r.size / 1024).toFixed(1)}kb` : '—'}
                    </span>
                  </td>
                  <td style={styles.td}><span style={{ color: '#475569' }}>{r.type}</span></td>
                  <td style={styles.td}><span style={{ color: '#334155' }}>{new Date(r.timestamp).toLocaleTimeString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NetworkMonitor;

import React, { useState, useEffect, useCallback } from 'react';
import { getLogs, clearLogs } from '../../utils/logger';

const LEVEL_COLORS = {
  DEBUG: '#64748b',
  INFO: '#38bdf8',
  WARN: '#eab308',
  ERROR: '#f97316',
  CRITICAL: '#ef4444',
};

const styles = {
  panel: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '280px',
    background: '#020617',
    borderTop: '1px solid #1e3a5f',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'monospace',
    zIndex: 9999,
    transform: 'translateY(0)',
  },
  panelHidden: { transform: 'translateY(100%)' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: '#0f172a',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  title: { color: '#38bdf8', fontSize: '12px', fontWeight: 700, marginRight: '8px' },
  filterBtn: (active, color) => ({
    background: active ? color + '22' : 'transparent',
    color: active ? color : '#475569',
    border: `1px solid ${active ? color : '#334155'}`,
    borderRadius: '3px',
    padding: '2px 8px',
    fontSize: '10px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  }),
  clearBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    color: '#475569',
    border: '1px solid #334155',
    borderRadius: '3px',
    padding: '2px 8px',
    fontSize: '10px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  },
  logList: { flex: 1, overflowY: 'auto', padding: '4px 0' },
  logLine: (level) => ({
    display: 'grid',
    gridTemplateColumns: '160px 70px 120px 1fr',
    padding: '2px 12px',
    fontSize: '11px',
    lineHeight: '1.6',
    gap: '8px',
    borderBottom: '1px solid #0a0a0a',
  }),
  ts: { color: '#334155' },
  level: (level) => ({ color: LEVEL_COLORS[level] || '#64748b', fontWeight: 700 }),
  ctx: { color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  msg: { color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

const DebugPanel = ({ visible = true }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = React.useRef(null);

  const refresh = useCallback(() => {
    setLogs([...getLogs()]);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('enterprise:log', refresh);
    return () => window.removeEventListener('enterprise:log', refresh);
  }, [refresh]);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter);

  return (
    <div style={{ ...styles.panel, ...(visible ? {} : styles.panelHidden) }}>
      <div style={styles.toolbar}>
        <span style={styles.title}>DEBUG CONSOLE</span>
        {['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].map((lvl) => (
          <button
            key={lvl}
            style={styles.filterBtn(filter === lvl, LEVEL_COLORS[lvl] || '#38bdf8')}
            onClick={() => setFilter(lvl)}
          >
            {lvl}
          </button>
        ))}
        <button
          style={{ ...styles.filterBtn(autoScroll, '#a78bfa'), marginLeft: '4px' }}
          onClick={() => setAutoScroll((v) => !v)}
        >
          AUTO-SCROLL {autoScroll ? 'ON' : 'OFF'}
        </button>
        <span style={{ color: '#334155', fontSize: '11px', marginLeft: '4px' }}>
          {filtered.length} entries
        </span>
        <button style={styles.clearBtn} onClick={() => { clearLogs(); setLogs([]); }}>
          CLEAR
        </button>
      </div>
      <div style={styles.logList} ref={listRef}>
        {filtered.map((log, i) => (
          <div key={i} style={styles.logLine(log.level)}>
            <span style={styles.ts}>{log.timestamp?.split('T')[1]?.replace('Z', '') || ''}</span>
            <span style={styles.level(log.level)}>{log.level}</span>
            <span style={styles.ctx}>{log.context}</span>
            <span style={styles.msg}>{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: '#334155', fontSize: '11px', padding: '12px 16px' }}>
            No log entries for filter: {filter}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;

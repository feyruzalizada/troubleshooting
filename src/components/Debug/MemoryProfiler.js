import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { createAlert } from '../../utils/metrics';
import { logger } from '../../utils/logger';

const CTX = 'MemoryProfiler';
const MB = 1048576;
const toMB = (bytes) => parseFloat((bytes / MB).toFixed(1));

const styles = {
  root: { background: '#1e293b', borderRadius: '8px', padding: '20px' },
  title: { color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' },
  stat: (color) => ({
    background: '#0f172a',
    borderRadius: '6px',
    padding: '14px',
    borderLeft: `3px solid ${color}`,
  }),
  statLabel: { color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' },
  statVal: (color) => ({ color, fontSize: '24px', fontWeight: 700, fontFamily: 'monospace' }),
  statUnit: { color: '#475569', fontSize: '12px' },
  bar: { height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px', position: 'relative' },
  barFill: (pct) => ({
    height: '100%',
    width: `${Math.min(pct, 100)}%`,
    background: pct > 80 ? '#ef4444' : pct > 60 ? '#eab308' : '#22c55e',
    borderRadius: '5px',
    transition: 'width 0.5s ease',
  }),
  barLabel: { display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '11px', marginBottom: '4px' },
  noSupport: {
    background: '#0f172a',
    borderRadius: '6px',
    padding: '24px',
    color: '#334155',
    fontSize: '12px',
    textAlign: 'center',
    lineHeight: '1.8',
  },
  controls: { display: 'flex', gap: '8px', marginBottom: '16px' },
  btn: (active) => ({
    background: active ? '#1e3a5f' : 'transparent',
    color: active ? '#38bdf8' : '#475569',
    border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  }),
  tooltip: { background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px', fontSize: '11px' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={styles.tooltip}>
      <div style={{ color: '#64748b', marginBottom: '4px' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke, marginTop: '2px' }}>
          {p.name}: {p.value} MB
        </div>
      ))}
    </div>
  );
};

const MemoryProfiler = () => {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [recording, setRecording] = useState(true);
  const alertedRef = useRef(false);

  const supported = typeof performance !== 'undefined' && !!performance.memory;

  const sample = useCallback(() => {
    if (!supported || !recording) return;
    const mem = performance.memory;
    const used = toMB(mem.usedJSHeapSize);
    const total = toMB(mem.totalJSHeapSize);
    const limit = toMB(mem.jsHeapSizeLimit);
    const pct = parseFloat(((used / limit) * 100).toFixed(1));

    const entry = {
      time: new Date().toLocaleTimeString(),
      used,
      total,
      limit,
      pct,
    };

    setCurrent(entry);
    setHistory((prev) => {
      const next = [...prev, entry];
      return next.length > 60 ? next.slice(-60) : next;
    });

    if (pct > 80 && !alertedRef.current) {
      alertedRef.current = true;
      createAlert('High JS Heap Usage', `Heap at ${pct}% of limit (${used}MB / ${limit}MB)`, 'HIGH', 'memory-profiler');
      logger.warn(CTX, `Heap at ${pct}% of limit`, { used, limit });
    } else if (pct < 70) {
      alertedRef.current = false;
    }
  }, [supported, recording]);

  useEffect(() => {
    if (!supported) return;
    sample();
    const interval = setInterval(sample, 2000);
    return () => clearInterval(interval);
  }, [sample, supported]);

  if (!supported) {
    return (
      <div style={styles.root}>
        <p style={styles.title}>Memory Profiler</p>
        <div style={styles.noSupport}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠</div>
          <strong style={{ color: '#64748b' }}>performance.memory is not available</strong><br />
          This API requires Chrome or Chromium-based browsers.<br />
          Open the app in Chrome to enable JS heap profiling.
        </div>
      </div>
    );
  }

  const heapPct = current ? current.pct : 0;

  return (
    <div style={styles.root}>
      <p style={styles.title}>Memory Profiler — JS Heap</p>

      <div style={styles.controls}>
        <button style={styles.btn(recording)} onClick={() => setRecording((v) => !v)}>
          {recording ? '⏸ PAUSE' : '▶ RESUME'}
        </button>
        <button style={styles.btn(false)} onClick={() => { setHistory([]); setCurrent(null); }}>
          CLEAR
        </button>
        <span style={{ color: '#475569', fontSize: '11px', marginLeft: '4px', alignSelf: 'center' }}>
          {history.length} samples · interval 2s
        </span>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.stat('#38bdf8')}>
          <div style={styles.statLabel}>Used Heap</div>
          <div style={styles.statVal('#38bdf8')}>{current?.used ?? '—'} <span style={styles.statUnit}>MB</span></div>
        </div>
        <div style={styles.stat('#a78bfa')}>
          <div style={styles.statLabel}>Total Heap</div>
          <div style={styles.statVal('#a78bfa')}>{current?.total ?? '—'} <span style={styles.statUnit}>MB</span></div>
        </div>
        <div style={styles.stat('#64748b')}>
          <div style={styles.statLabel}>Heap Limit</div>
          <div style={styles.statVal('#64748b')}>{current?.limit ?? '—'} <span style={styles.statUnit}>MB</span></div>
        </div>
        <div style={styles.stat(heapPct > 80 ? '#ef4444' : heapPct > 60 ? '#eab308' : '#22c55e')}>
          <div style={styles.statLabel}>Utilization</div>
          <div style={styles.statVal(heapPct > 80 ? '#ef4444' : heapPct > 60 ? '#eab308' : '#22c55e')}>
            {current?.pct ?? '—'} <span style={styles.statUnit}>%</span>
          </div>
        </div>
      </div>

      <div style={styles.barLabel}>
        <span>Heap utilization</span>
        <span>{heapPct}%</span>
      </div>
      <div style={styles.bar}>
        <div style={styles.barFill(heapPct)} />
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} unit=" MB" />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={current?.limit ? current.limit * 0.8 : undefined} stroke="#ef444444" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="used" stroke="#38bdf8" fill="#0c4a6e" strokeWidth={2} dot={false} name="Used" />
          <Area type="monotone" dataKey="total" stroke="#a78bfa" fill="transparent" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Total" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemoryProfiler;

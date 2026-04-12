import React, { useState, useEffect, useRef, useCallback } from 'react';

const EVENT_TYPES = [
  'enterprise:log',
  'enterprise:error',
  'enterprise:performance',
  'enterprise:business',
  'enterprise:alert',
  'enterprise:alert:ack',
  'enterprise:alert:resolve',
  'enterprise:network',
];

const EVENT_COLORS = {
  'enterprise:log': '#64748b',
  'enterprise:error': '#ef4444',
  'enterprise:performance': '#38bdf8',
  'enterprise:business': '#a78bfa',
  'enterprise:alert': '#f97316',
  'enterprise:alert:ack': '#eab308',
  'enterprise:alert:resolve': '#22c55e',
  'enterprise:network': '#06b6d4',
};

const EVENT_SHORT = {
  'enterprise:log': 'LOG',
  'enterprise:error': 'ERR',
  'enterprise:performance': 'PERF',
  'enterprise:business': 'BIZ',
  'enterprise:alert': 'ALERT',
  'enterprise:alert:ack': 'ACK',
  'enterprise:alert:resolve': 'RESOLVE',
  'enterprise:network': 'NET',
};

const styles = {
  root: { background: '#1e293b', borderRadius: '8px', overflow: 'hidden' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    borderBottom: '1px solid #0f172a',
    flexWrap: 'wrap',
  },
  title: { color: '#e2e8f0', fontSize: '13px', fontWeight: 700, marginRight: '4px', whiteSpace: 'nowrap' },
  filterChip: (active, color) => ({
    background: active ? color + '22' : 'transparent',
    color: active ? color : '#475569',
    border: `1px solid ${active ? color : '#334155'}`,
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '10px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontWeight: active ? 700 : 400,
  }),
  controls: { display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' },
  btn: {
    background: 'transparent',
    color: '#475569',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  },
  scrollBtn: (active) => ({
    background: active ? '#1e3a5f' : 'transparent',
    color: active ? '#38bdf8' : '#475569',
    border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'monospace',
  }),
  list: { maxHeight: '400px', overflowY: 'auto', padding: '8px 0' },
  entry: (type) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '6px 16px',
    borderBottom: '1px solid #0f172a',
  }),
  dot: (type) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: EVENT_COLORS[type] || '#475569',
    flexShrink: 0,
    marginTop: '4px',
  }),
  time: { color: '#334155', fontSize: '10px', whiteSpace: 'nowrap', width: '80px', flexShrink: 0, marginTop: '2px' },
  typeBadge: (type) => ({
    display: 'inline-block',
    background: (EVENT_COLORS[type] || '#475569') + '22',
    color: EVENT_COLORS[type] || '#475569',
    borderRadius: '3px',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: 800,
    flexShrink: 0,
    width: '58px',
    textAlign: 'center',
  }),
  payload: { color: '#64748b', fontSize: '11px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  count: { color: '#475569', fontSize: '11px' },
  empty: { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '12px' },
};

const summarize = (type, detail) => {
  if (!detail) return '';
  if (type === 'enterprise:log') return `[${detail.level}] ${detail.context}: ${detail.message}`;
  if (type === 'enterprise:error') return `${detail.severity} in ${detail.context}: ${detail.message}`;
  if (type === 'enterprise:performance') return `${detail.name} = ${detail.value?.toFixed ? detail.value.toFixed(2) : detail.value} (${detail.rating})`;
  if (type === 'enterprise:business') return `${detail.name} = ${detail.value}`;
  if (type === 'enterprise:alert') return `[${detail.severity}] ${detail.title} — ${detail.service}`;
  if (type === 'enterprise:alert:ack') return `Alert ${detail.id?.slice(0, 8)} acknowledged`;
  if (type === 'enterprise:alert:resolve') return `Alert ${detail.id?.slice(0, 8)} resolved`;
  if (type === 'enterprise:network') return `${detail.method} ${detail.shortUrl} → ${detail.status || '…'} ${detail.duration ? detail.duration + 'ms' : ''}`;
  return JSON.stringify(detail).slice(0, 80);
};

const EventTimeline = () => {
  const [events, setEvents] = useState([]);
  const [activeFilters, setActiveFilters] = useState(new Set(EVENT_TYPES));
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);
  const bufferRef = useRef([]);

  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;
    const incoming = bufferRef.current.splice(0);
    setEvents((prev) => {
      const next = [...prev, ...incoming];
      return next.length > 500 ? next.slice(-500) : next;
    });
  }, []);

  useEffect(() => {
    const handlers = {};
    EVENT_TYPES.forEach((type) => {
      handlers[type] = (e) => {
        bufferRef.current.push({
          id: Date.now() + Math.random(),
          type,
          timestamp: Date.now(),
          detail: e.detail,
        });
      };
      window.addEventListener(type, handlers[type]);
    });

    const interval = setInterval(flush, 500);
    return () => {
      EVENT_TYPES.forEach((type) => window.removeEventListener(type, handlers[type]));
      clearInterval(interval);
    };
  }, [flush]);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const toggleFilter = (type) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const displayed = events.filter((e) => activeFilters.has(e.type));

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <span style={styles.title}>Event Timeline</span>
        {EVENT_TYPES.map((type) => (
          <button
            key={type}
            style={styles.filterChip(activeFilters.has(type), EVENT_COLORS[type])}
            onClick={() => toggleFilter(type)}
          >
            {EVENT_SHORT[type]}
          </button>
        ))}
        <div style={styles.controls}>
          <span style={styles.count}>{displayed.length} events</span>
          <button style={styles.scrollBtn(autoScroll)} onClick={() => setAutoScroll((v) => !v)}>
            AUTO {autoScroll ? 'ON' : 'OFF'}
          </button>
          <button style={styles.btn} onClick={() => setEvents([])}>CLEAR</button>
        </div>
      </div>

      <div style={styles.list} ref={listRef}>
        {displayed.length === 0 ? (
          <div style={styles.empty}>
            Waiting for events… <br />
            All enterprise:* events will appear here in real time.
          </div>
        ) : (
          displayed.map((ev) => (
            <div key={ev.id} style={styles.entry(ev.type)}>
              <span style={styles.dot(ev.type)} />
              <span style={styles.time}>{new Date(ev.timestamp).toLocaleTimeString()}</span>
              <span style={styles.typeBadge(ev.type)}>{EVENT_SHORT[ev.type]}</span>
              <span style={styles.payload}>{summarize(ev.type, ev.detail)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventTimeline;

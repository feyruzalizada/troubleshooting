import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePerformance } from '../../hooks/usePerformance';

const Card = ({ children, style }) => (
  <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px', ...style }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
    {children}
  </p>
);

const StatValue = ({ value, unit, color = '#e2e8f0', size = '28px' }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
    <span style={{ color, fontSize: size, fontWeight: 700, fontFamily: 'monospace' }}>
      {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value}
    </span>
    {unit && <span style={{ color: '#475569', fontSize: '13px' }}>{unit}</span>}
  </div>
);

const StatusDot = ({ value, thresholds }) => {
  let color = '#22c55e';
  if (value === null || value === undefined) color = '#475569';
  else if (value >= thresholds[1]) color = '#ef4444';
  else if (value >= thresholds[0]) color = '#eab308';
  return <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: color, marginLeft: '8px' }} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px' }}>
      <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color || '#38bdf8', fontSize: '13px', fontWeight: 600 }}>
          {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

const PerformanceMetrics = () => {
  const { latest, history } = usePerformance(20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        <Card>
          <CardTitle>Active Users</CardTitle>
          <StatValue value={latest.active_users} color="#38bdf8" />
          <StatusDot value={latest.active_users} thresholds={[1800, 2200]} />
        </Card>
        <Card>
          <CardTitle>Response Time</CardTitle>
          <StatValue value={latest.response_time_ms} unit="ms" color={latest.response_time_ms > 250 ? '#ef4444' : '#22c55e'} />
          <StatusDot value={latest.response_time_ms} thresholds={[200, 350]} />
        </Card>
        <Card>
          <CardTitle>Throughput</CardTitle>
          <StatValue value={latest.throughput_rps} unit="rps" color="#a78bfa" />
        </Card>
        <Card>
          <CardTitle>Error Rate</CardTitle>
          <StatValue value={latest.error_rate_pct} unit="%" color={latest.error_rate_pct > 1 ? '#ef4444' : '#22c55e'} />
          <StatusDot value={latest.error_rate_pct} thresholds={[0.5, 1.5]} />
        </Card>
        <Card>
          <CardTitle>Availability</CardTitle>
          <StatValue value={latest.availability_pct} unit="%" color={latest.availability_pct < 99.5 ? '#ef4444' : '#22c55e'} size="22px" />
        </Card>
        <Card>
          <CardTitle>CPU Usage</CardTitle>
          <StatValue value={latest.cpu_usage_pct} unit="%" color={latest.cpu_usage_pct > 70 ? '#ef4444' : '#38bdf8'} />
          <StatusDot value={latest.cpu_usage_pct} thresholds={[55, 75]} />
        </Card>
        <Card>
          <CardTitle>Memory Usage</CardTitle>
          <StatValue value={latest.memory_usage_pct} unit="%" color="#f472b6" />
          <StatusDot value={latest.memory_usage_pct} thresholds={[65, 80]} />
        </Card>
        <Card>
          <CardTitle>Revenue (Live)</CardTitle>
          <StatValue value={latest.revenue_impact_usd ? `$${(latest.revenue_impact_usd / 1000).toFixed(1)}k` : null} color="#fbbf24" size="22px" />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <CardTitle>Response Time Trend (ms)</CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={history.response_time_ms || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="#0c4a6e" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Error Rate Trend (%)</CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={history.error_rate_pct || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 3]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#450a0a" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Active Users Trend</CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={history.active_users || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>CPU & Memory Utilization (%)</CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={(history.cpu_usage_pct || []).map((c, i) => ({
              time: c.time,
              cpu: c.value,
              memory: (history.memory_usage_pct || [])[i]?.value,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="cpu" stroke="#38bdf8" strokeWidth={2} dot={false} name="CPU" />
              <Line type="monotone" dataKey="memory" stroke="#f472b6" strokeWidth={2} dot={false} name="Memory" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceMetrics;

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { usePerformance } from '../../hooks/usePerformance';

const SLOGauge = ({ label, value, target, unit = '%', color }) => {
  const pct = Math.min((value / target) * 100, 100);
  const passing = value >= target;

  return (
    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
      <div style={{ position: 'relative', height: '100px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={[{ value: pct }]}>
            <RadialBar background={{ fill: '#1e293b' }} dataKey="value" fill={passing ? '#22c55e' : '#ef4444'} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ color: passing ? '#22c55e' : '#ef4444', fontSize: '18px', fontWeight: 700, fontFamily: 'monospace' }}>
            {value !== null ? `${value}${unit}` : '—'}
          </div>
        </div>
      </div>
      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{label}</div>
      <div style={{ color: '#475569', fontSize: '11px' }}>Target: ≥{target}{unit}</div>
      <div style={{
        marginTop: '6px',
        background: passing ? '#14532d' : '#7f1d1d',
        color: passing ? '#86efac' : '#fca5a5',
        borderRadius: '4px',
        padding: '2px 0',
        fontSize: '11px',
        fontWeight: 700,
      }}>
        {passing ? 'SLO MET' : 'SLO BREACH'}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px' }}>
      <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill || '#38bdf8', fontSize: '13px', fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

const BusinessMetrics = () => {
  const { latest, history } = usePerformance(10);

  const revenueHistory = (history.revenue_impact_usd || []).map((r) => ({
    time: r.time,
    revenue: parseFloat((r.value / 1000).toFixed(1)),
  }));

  const throughputHistory = (history.throughput_rps || []).map((r) => ({
    time: r.time,
    rps: r.value,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          SLO Compliance Dashboard
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          <SLOGauge
            label="Availability"
            value={latest.availability_pct}
            target={99.5}
            color="#22c55e"
          />
          <SLOGauge
            label="Error Rate (max)"
            value={latest.error_rate_pct !== null ? parseFloat((1 - latest.error_rate_pct / 100 * 100).toFixed(2)) : null}
            target={99}
            color="#ef4444"
          />
          <SLOGauge
            label="Saturation"
            value={latest.saturation_pct !== null ? parseFloat((100 - latest.saturation_pct).toFixed(1)) : null}
            target={60}
            color="#a78bfa"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Revenue Impact ($k)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#fbbf24" name="Revenue $k" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Throughput (req/s)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={throughputHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rps" fill="#38bdf8" name="RPS" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Four Golden Signals — Current State
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Latency', value: latest.response_time_ms, unit: 'ms', threshold: 250, color: '#38bdf8' },
            { label: 'Traffic', value: latest.throughput_rps, unit: 'rps', threshold: null, color: '#a78bfa' },
            { label: 'Errors', value: latest.error_rate_pct, unit: '%', threshold: 1, color: '#ef4444' },
            { label: 'Saturation', value: latest.saturation_pct, unit: '%', threshold: 70, color: '#fbbf24' },
          ].map(({ label, value, unit, threshold, color }) => {
            const isAlert = threshold !== null && value !== null && value > threshold;
            return (
              <div key={label} style={{ background: '#0f172a', borderRadius: '6px', padding: '14px', borderLeft: `3px solid ${isAlert ? '#ef4444' : color}` }}>
                <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                <div style={{ color: isAlert ? '#ef4444' : color, fontSize: '22px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {value !== null ? `${typeof value === 'number' ? value.toFixed(2) : value}${unit}` : '—'}
                </div>
                {isAlert && (
                  <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>THRESHOLD EXCEEDED</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusinessMetrics;

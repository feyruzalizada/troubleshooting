import React, { useState } from 'react';

const TABS = ['Performance', 'Alerts'];

const styles = {
  root:   { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace' },
  topBar: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 32px',
            display: 'flex', alignItems: 'center', height: '56px' },
  logo:   { color: '#e2e8f0', fontWeight: 800, fontSize: '16px' },
  main:   { padding: '24px 32px' },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #1e293b' },
  tab: (active) => ({ background: 'transparent', color: active ? '#38bdf8' : '#64748b',
    border: 'none', borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
    padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'monospace',
    marginBottom: '-1px' }),
  placeholder: { background: '#1e293b', borderRadius: '8px', padding: '48px',
                 textAlign: 'center', color: '#475569', fontSize: '13px' },
};

const ReliabilityDashboard = () => {
  const [tab, setTab] = useState('Performance');
  return (
    <div style={styles.root}>
      <div style={styles.topBar}><span style={styles.logo}>Enterprise Reliability Platform</span></div>
      <div style={styles.main}>
        <div style={styles.tabBar}>
          {TABS.map((t) => <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <div style={styles.placeholder}>{tab} -- coming soon</div>
      </div>
    </div>
  );
};

export default ReliabilityDashboard;

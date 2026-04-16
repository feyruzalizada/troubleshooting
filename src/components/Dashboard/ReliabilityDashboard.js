import React, { useState, useEffect } from 'react';
import PlatformErrorBoundary from '../ErrorBoundary/PlatformErrorBoundary';
import PerformanceMetrics from './PerformanceMetrics';
import BusinessMetrics from './BusinessMetrics';
import AlertPanel from './AlertPanel';
import ErrorTracker from '../Monitoring/ErrorTracker';
import MonitoringServicePanel from '../Monitoring/MonitoringService';
import PerformanceObserverPanel from '../Monitoring/PerformanceObserverPanel';
import EventTimeline from '../Debug/EventTimeline';
import NetworkMonitor from '../Debug/NetworkMonitor';
import MemoryProfiler from '../Debug/MemoryProfiler';
import StateInspector from '../Debug/StateInspector';
import DebugPanel from '../Debug/DebugPanel';
import SystemStatus from '../Debug/SystemStatus';

const NAV_TABS = ['Performance', 'Business Metrics', 'Alerts', 'Error Tracking', 'Monitoring', 'Debugging'];

const styles = {
  root: { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace' },
  topBar: {
    background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 32px',
    display: 'flex', alignItems: 'center', height: '56px', position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { color: '#e2e8f0', fontWeight: 800, fontSize: '16px' },
  main: { padding: '24px 32px', paddingBottom: '360px' },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #1e293b' },
  tab: (active) => ({
    background: 'transparent',
    color: active ? '#38bdf8' : '#64748b',
    border: 'none',
    borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'monospace',
    marginBottom: '-1px',
  }),
  sectionGap: { display: 'flex', flexDirection: 'column', gap: '24px' },
  sectionTitle: {
    color: '#475569', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', marginBottom: '12px',
  },
};

const MonitoringTab = () => (
  <div style={styles.sectionGap}>
    <div>
      <div style={styles.sectionTitle}>Service Registry</div>
      <MonitoringServicePanel />
    </div>
    <div>
      <div style={styles.sectionTitle}>Core Web Vitals</div>
      <PerformanceObserverPanel />
    </div>
    <div>
      <div style={styles.sectionTitle}>Error Tracker</div>
      <ErrorTracker />
    </div>
  </div>
);

const DebuggingTab = () => (
  <div style={styles.sectionGap}>
    <div>
      <div style={styles.sectionTitle}>Event Timeline</div>
      <EventTimeline />
    </div>
    <div>
      <div style={styles.sectionTitle}>Network Monitor</div>
      <NetworkMonitor />
    </div>
    <div>
      <div style={styles.sectionTitle}>Memory Profiler</div>
      <MemoryProfiler />
    </div>
    <div>
      <div style={styles.sectionTitle}>State Inspector</div>
      <StateInspector />
    </div>
  </div>
);

const ReliabilityDashboard = () => {
  const [tab, setTab] = useState('Performance');
  const [debugVisible, setDebugVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderTab = () => {
    switch (tab) {
      case 'Performance':     return <PerformanceMetrics />;
      case 'Business Metrics': return <BusinessMetrics />;
      case 'Alerts':          return <AlertPanel />;
      case 'Error Tracking':  return <ErrorTracker />;
      case 'Monitoring':      return <MonitoringTab />;
      case 'Debugging':       return <DebuggingTab />;
      default:                return null;
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.topBar}>
        <span style={styles.logo}>Enterprise Reliability Platform</span>
      </div>
      <div style={styles.main}>
        <div style={styles.tabBar}>
          {NAV_TABS.map((t) => (
            <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <PlatformErrorBoundary platform="dashboard" component={tab}>
          {renderTab()}
        </PlatformErrorBoundary>
      </div>
      <SystemStatus />
      <DebugPanel visible={debugVisible} />
    </div>
  );
};

export default ReliabilityDashboard;

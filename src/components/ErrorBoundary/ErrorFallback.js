import React from 'react';

const styles = {
  container: {
    background: '#1e293b',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '24px',
    margin: '16px',
    fontFamily: 'monospace',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  icon: {
    width: '32px',
    height: '32px',
    background: '#ef4444',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '18px',
    flexShrink: 0,
  },
  title: { color: '#ef4444', fontSize: '18px', fontWeight: 700, margin: 0 },
  subtitle: { color: '#94a3b8', fontSize: '12px', marginTop: '4px' },
  message: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '12px',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '12px',
    wordBreak: 'break-all',
  },
  stack: {
    background: '#0f172a',
    border: '1px solid #1e3a5f',
    borderRadius: '4px',
    padding: '12px',
    color: '#64748b',
    fontSize: '11px',
    maxHeight: '150px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    marginBottom: '16px',
  },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnPrimary: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  btnSecondary: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  badge: {
    display: 'inline-block',
    background: '#7f1d1d',
    color: '#fca5a5',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 700,
    marginRight: '8px',
  },
  meta: { color: '#64748b', fontSize: '11px', marginBottom: '12px' },
};

const ErrorFallback = ({ error, errorInfo, boundary, onReset, severity = 'ERROR' }) => {
  const timestamp = new Date().toISOString();

  return (
    <div style={styles.container} data-testid="error-fallback">
      <div style={styles.header}>
        <div style={styles.icon}>!</div>
        <div>
          <p style={styles.title}>Platform Component Failure</p>
          <p style={styles.subtitle}>Boundary: {boundary || 'UnknownBoundary'}</p>
        </div>
      </div>

      <div style={styles.meta}>
        <span style={styles.badge}>{severity}</span>
        <span>{timestamp}</span>
      </div>

      <div style={styles.message}>
        {error?.message || 'An unexpected error occurred in this component'}
      </div>

      {errorInfo?.componentStack && (
        <div style={styles.stack}>{errorInfo.componentStack}</div>
      )}

      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={onReset}>
          Retry Component
        </button>
        <button style={styles.btnSecondary} onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;

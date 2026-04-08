import React from 'react';

const ErrorFallback = ({ error, boundary, onReset }) => (
  <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '8px',
                padding: '24px', margin: '16px', fontFamily: 'monospace' }}>
    <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Component Error -- {boundary}</h2>
    <p style={{ color: '#fca5a5', marginBottom: '16px' }}>{error?.message || 'Unknown error'}</p>
    <button onClick={onReset} style={{ background: '#3b82f6', color: '#fff', border: 'none',
      borderRadius: '6px', padding: '8px 20px', cursor: 'pointer' }}>Retry</button>
  </div>
);

export default ErrorFallback;

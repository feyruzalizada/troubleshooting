import React from 'react';
import { trackRenderError } from '../../services/errorTracking';
import { createAlert } from '../../utils/metrics';
import { logger } from '../../utils/logger';
import ErrorFallback from './ErrorFallback';

const CTX = 'GlobalErrorBoundary';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, key: 0 };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.critical(CTX, 'Global boundary caught render error', {
      message: error.message,
      componentStack: errorInfo.componentStack,
    });

    trackRenderError(error, errorInfo.componentStack, 'GlobalApp');

    createAlert(
      'Application-Level Render Failure',
      `Critical render error: ${error.message}`,
      'CRITICAL',
      'global-error-boundary'
    );

    this.setState({ errorInfo });
  }

  handleReset() {
    logger.info(CTX, 'User triggered global boundary reset');
    this.setState((s) => ({ hasError: false, error: null, errorInfo: null, key: s.key + 1 }));
  }

  render() {
    const { hasError, error, errorInfo, key } = this.state;

    if (hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ color: '#ef4444', fontSize: '28px', fontFamily: 'monospace' }}>
                Enterprise Reliability Platform
              </h1>
              <p style={{ color: '#64748b', marginTop: '8px', fontFamily: 'monospace' }}>
                Application-level error captured and logged
              </p>
            </div>
            <ErrorFallback
              error={error}
              errorInfo={errorInfo}
              boundary="GlobalErrorBoundary"
              onReset={this.handleReset}
              severity="CRITICAL"
            />
          </div>
        </div>
      );
    }

    return <React.Fragment key={key}>{this.props.children}</React.Fragment>;
  }
}

export default GlobalErrorBoundary;

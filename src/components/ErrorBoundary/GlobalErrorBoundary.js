import React from 'react';
import ErrorFallback from './ErrorFallback';
import { logger } from '../../utils/logger';

const CTX = 'GlobalErrorBoundary';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, key: 0 };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) { return { hasError: true, error }; }

  componentDidCatch(error, info) {
    logger.critical(CTX, 'Global boundary caught render error', { message: error.message });
  }

  handleReset() {
    this.setState((s) => ({ hasError: false, error: null, key: s.key + 1 }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '32px' }}>
          <ErrorFallback error={this.state.error} boundary="GlobalErrorBoundary"
                         onReset={this.handleReset} severity="CRITICAL" />
        </div>
      );
    }
    return <React.Fragment key={this.state.key}>{this.props.children}</React.Fragment>;
  }
}

export default GlobalErrorBoundary;

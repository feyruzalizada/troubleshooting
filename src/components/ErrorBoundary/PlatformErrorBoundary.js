import React from 'react';
import { trackPlatformError } from '../../services/errorTracking';
import { createAlert } from '../../utils/metrics';
import { logger } from '../../utils/logger';
import ErrorFallback from './ErrorFallback';

const CTX = 'PlatformErrorBoundary';

class PlatformErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { platform = 'unknown', component = 'unknown', onError } = this.props;
    logger.error(CTX, `Platform error in [${platform}/${component}]`, { message: error.message });
    trackPlatformError(error, platform, component);
    createAlert(`Platform Module Failure: ${component}`, `Error in ${platform}/${component}: ${error.message}`, 'HIGH', `platform:${platform}`);
    if (typeof onError === 'function') onError(error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset() {
    const { maxRetries = 3 } = this.props;
    this.setState((s) => {
      if (s.retryCount > maxRetries) {
        logger.error(CTX, 'Max retries exceeded');
        return s;
      }
      logger.info(CTX, `Platform boundary reset (retry ${s.retryCount}/${maxRetries})`);
      return { hasError: false, error: null, errorInfo: null };
    });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { platform = 'unknown', component = 'unknown' } = this.props;
    if (hasError) {
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          boundary={`PlatformErrorBoundary[${platform}/${component}]`}
          onReset={this.handleReset}
          severity="ERROR"
        />
      );
    }
    return this.props.children;
  }
}

export default PlatformErrorBoundary;

import React, { useEffect } from 'react';
import GlobalErrorBoundary from './components/ErrorBoundary/GlobalErrorBoundary';
import ReliabilityDashboard from './components/Dashboard/ReliabilityDashboard';
import { initSession } from './utils/metrics';
import { startAllMonitoring } from './services/monitoring';
import { startBusinessMetricSimulation } from './services/analytics';
import { logger } from './utils/logger';

const App = () => {
  useEffect(() => {
    initSession();
    startAllMonitoring();
    startBusinessMetricSimulation(4000);
    logger.info('App', 'Feyruz Review');
  }, []);

  return (
    <GlobalErrorBoundary>
      <ReliabilityDashboard />
    </GlobalErrorBoundary>
  );
};

export default App;

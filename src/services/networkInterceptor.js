// Network interceptor -- v1: fetch patching only
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const CTX = 'NetworkInterceptor';
let interceptorActive = false;

const store = () => { window.__NETWORK_LOG__ = window.__NETWORK_LOG__ || []; return window.__NETWORK_LOG__; };
const push  = (e) => { const l = store(); l.push(e); if (l.length > 300) l.shift();
                        window.dispatchEvent(new CustomEvent('enterprise:network', { detail: e })); };

const patchFetch = () => {
  const original = window.fetch;
  window.fetch = async function (...args) {
    const id = uuidv4(), start = performance.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const method = (args[1]?.method || 'GET').toUpperCase();
    try {
      const response = await original.apply(this, args);
      const duration = parseFloat((performance.now() - start).toFixed(2));
      push({ id, type: 'fetch', method, url, status: response.status,
             duration, timestamp: Date.now() });
      return response;
    } catch (err) {
      push({ id, type: 'fetch', method, url, status: 0, duration: 0, timestamp: Date.now() });
      throw err;
    }
  };
};

export const startNetworkInterceptor = () => {
  if (interceptorActive) return;
  interceptorActive = true;
  patchFetch();
  logger.info(CTX, 'Network interceptor active (fetch only -- v1)');
};

export const getNetworkLog  = () => window.__NETWORK_LOG__ || [];
export const clearNetworkLog = () => { window.__NETWORK_LOG__ = []; };

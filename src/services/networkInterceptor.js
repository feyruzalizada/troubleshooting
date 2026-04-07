import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const CTX = 'NetworkInterceptor';
let interceptorActive = false;

const store = () => {
  window.__NETWORK_LOG__ = window.__NETWORK_LOG__ || [];
  return window.__NETWORK_LOG__;
};

const push = (entry) => {
  const log = store();
  log.push(entry);
  if (log.length > 300) log.shift();
  window.dispatchEvent(new CustomEvent('enterprise:network', { detail: entry }));
};

const categorize = (status) => {
  if (!status) return 'pending';
  if (status < 300) return 'success';
  if (status < 400) return 'redirect';
  if (status < 500) return 'client-error';
  return 'server-error';
};

const shortUrl = (url) => {
  try {
    const u = new URL(url, window.location.href);
    return u.pathname + u.search;
  } catch {
    return url;
  }
};

const patchFetch = () => {
  const original = window.fetch;
  window.fetch = async function (...args) {
    const id = uuidv4();
    const start = performance.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const method = (args[1]?.method || 'GET').toUpperCase();

    const entry = {
      id,
      type: 'fetch',
      method,
      url,
      shortUrl: shortUrl(url),
      status: null,
      statusText: null,
      duration: null,
      size: null,
      category: 'pending',
      timestamp: Date.now(),
      startTime: start,
    };
    push({ ...entry });

    try {
      const response = await original.apply(this, args);
      const duration = parseFloat((performance.now() - start).toFixed(2));
      const size = parseInt(response.headers.get('content-length') || '0', 10);
      const finished = {
        ...entry,
        status: response.status,
        statusText: response.statusText,
        duration,
        size,
        category: categorize(response.status),
      };
      push(finished);
      if (duration > 2000) {
        logger.warn(CTX, `Slow fetch: ${method} ${shortUrl(url)} took ${duration}ms`, { status: response.status });
      }
      return response;
    } catch (err) {
      const duration = parseFloat((performance.now() - start).toFixed(2));
      push({ ...entry, status: 0, statusText: err.message, duration, category: 'server-error' });
      logger.error(CTX, `Fetch failed: ${method} ${shortUrl(url)}`, { error: err.message });
      throw err;
    }
  };
};

const patchXHR = () => {
  const OriginalXHR = window.XMLHttpRequest;
  function PatchedXHR() {
    const xhr = new OriginalXHR();
    const id = uuidv4();
    let method = 'GET';
    let url = '';
    let start = 0;

    const origOpen = xhr.open.bind(xhr);
    xhr.open = function (m, u, ...rest) {
      method = (m || 'GET').toUpperCase();
      url = u || '';
      return origOpen(m, u, ...rest);
    };

    const origSend = xhr.send.bind(xhr);
    xhr.send = function (...rest) {
      start = performance.now();
      push({
        id,
        type: 'xhr',
        method,
        url,
        shortUrl: shortUrl(url),
        status: null,
        statusText: null,
        duration: null,
        size: null,
        category: 'pending',
        timestamp: Date.now(),
      });

      xhr.addEventListener('loadend', () => {
        const duration = parseFloat((performance.now() - start).toFixed(2));
        push({
          id,
          type: 'xhr',
          method,
          url,
          shortUrl: shortUrl(url),
          status: xhr.status,
          statusText: xhr.statusText,
          duration,
          size: xhr.responseText ? xhr.responseText.length : 0,
          category: categorize(xhr.status),
          timestamp: Date.now(),
        });
      });

      return origSend(...rest);
    };

    return xhr;
  }
  PatchedXHR.prototype = OriginalXHR.prototype;
  window.XMLHttpRequest = PatchedXHR;
};

export const startNetworkInterceptor = () => {
  if (interceptorActive) return;
  interceptorActive = true;
  patchFetch();
  patchXHR();
  logger.info(CTX, 'Network interceptor active (fetch + XHR)');
};

export const getNetworkLog = () => window.__NETWORK_LOG__ || [];
export const clearNetworkLog = () => { window.__NETWORK_LOG__ = []; };

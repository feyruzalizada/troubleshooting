const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 };
const CURRENT_LEVEL = LOG_LEVELS.DEBUG;

const formatMessage = (level, context, message, data) => ({
  timestamp: new Date().toISOString(),
  level,
  context,
  message,
  data: data || null,
  sessionId: window.__SESSION_ID__,
  environment: process.env.NODE_ENV,
});

const dispatch = (entry) => {
  window.__LOG_BUFFER__ = window.__LOG_BUFFER__ || [];
  window.__LOG_BUFFER__.push(entry);
  if (window.__LOG_BUFFER__.length > 500) window.__LOG_BUFFER__.shift();
  window.dispatchEvent(new CustomEvent('enterprise:log', { detail: entry }));
};

export const logger = {
  debug: (ctx, msg, data) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      const e = formatMessage('DEBUG', ctx, msg, data);
      console.debug(`[${e.timestamp}] [DEBUG] [${ctx}]`, msg, data || '');
      dispatch(e);
    }
  },
  info: (ctx, msg, data) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      const e = formatMessage('INFO', ctx, msg, data);
      console.info(`[${e.timestamp}] [INFO] [${ctx}]`, msg, data || '');
      dispatch(e);
    }
  },
  warn: (ctx, msg, data) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      const e = formatMessage('WARN', ctx, msg, data);
      console.warn(`[${e.timestamp}] [WARN] [${ctx}]`, msg, data || '');
      dispatch(e);
    }
  },
  error: (ctx, msg, data) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      const e = formatMessage('ERROR', ctx, msg, data);
      console.error(`[${e.timestamp}] [ERROR] [${ctx}]`, msg, data || '');
      dispatch(e);
    }
  },
  critical: (ctx, msg, data) => {
    const e = formatMessage('CRITICAL', ctx, msg, data);
    console.error(`[${e.timestamp}] [CRITICAL] [${ctx}]`, msg, data || '');
    dispatch(e);
  },
};

export const getLogs = () => window.__LOG_BUFFER__ || [];
export const clearLogs = () => { window.__LOG_BUFFER__ = []; };

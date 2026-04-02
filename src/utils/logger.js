// Structured logger -- v2: persistent window.__LOG_BUFFER__
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 };

const internalLog = (level, context, message, data) => {
  window.__LOG_BUFFER__ = window.__LOG_BUFFER__ || [];
  const entry = { id: Date.now() + Math.random(), level, context, message,
                  data: data || null, timestamp: Date.now() };
  window.__LOG_BUFFER__.push(entry);
  return entry;
};

export const logger = {
  debug:    (ctx, msg, d) => internalLog('DEBUG',    ctx, msg, d),
  info:     (ctx, msg, d) => internalLog('INFO',     ctx, msg, d),
  warn:     (ctx, msg, d) => internalLog('WARN',     ctx, msg, d),
  error:    (ctx, msg, d) => internalLog('ERROR',    ctx, msg, d),
  critical: (ctx, msg, d) => internalLog('CRITICAL', ctx, msg, d),
};

export const getLogs  = () => window.__LOG_BUFFER__ || [];
export const clearLogs = () => { window.__LOG_BUFFER__ = []; };

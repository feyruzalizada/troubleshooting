// Structured logger -- v1: basic console output only
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 };

const internalLog = (level, context, message, data) => {
  const entry = { level, context, message, data, timestamp: Date.now() };
  console[level === 'CRITICAL' || level === 'ERROR' ? 'error' : 'log'](
    `[${level}] [${context}] ${message}`, data || ''
  );
  return entry;
};

export const logger = {
  debug:    (ctx, msg, d) => internalLog('DEBUG', ctx, msg, d),
  info:     (ctx, msg, d) => internalLog('INFO',  ctx, msg, d),
  warn:     (ctx, msg, d) => internalLog('WARN',  ctx, msg, d),
  error:    (ctx, msg, d) => internalLog('ERROR', ctx, msg, d),
  critical: (ctx, msg, d) => internalLog('CRITICAL', ctx, msg, d),
};

export const getLogs  = () => [];
export const clearLogs = () => {};

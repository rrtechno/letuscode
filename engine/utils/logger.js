/**
 * Logger
 * Leveled console wrapper. Call Logger.setLevel() once during bootstrap
 * from app.config.json. Nothing here ever touches the DOM — user-facing
 * error surfaces are handled by global-error-handler.js + toast/modal UI.
 */
const LEVELS = ['debug', 'info', 'warn', 'error', 'silent'];

let currentLevel = 'info';

function shouldLog(level) {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(currentLevel);
}

export const Logger = {
  setLevel(level) {
    if (LEVELS.includes(level)) currentLevel = level;
  },

  debug(...args) {
    if (shouldLog('debug')) console.debug('[LUC]', ...args);
  },
  info(...args) {
    if (shouldLog('info')) console.info('[LUC]', ...args);
  },
  warn(...args) {
    if (shouldLog('warn')) console.warn('[LUC]', ...args);
  },
  error(...args) {
    if (shouldLog('error')) console.error('[LUC]', ...args);
  }
};

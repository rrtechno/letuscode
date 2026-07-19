import { eventBus } from '../events/event-bus.js';
import { Logger } from './logger.js';

/**
 * installGlobalErrorHandler
 * Catches truly uncaught errors/rejections (bugs we didn't anticipate) and
 * turns them into a single "app:fatalError" event instead of a silent
 * white-screen or a raw stack trace shown to a 10-year-old. Feature code
 * should still use try/catch for anything expected (network errors,
 * malformed content, execution failures) — this is the last-resort net.
 */
export function installGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    Logger.error('Uncaught error:', event.error || event.message);
    eventBus.emit('app:fatalError', { error: event.error || new Error(event.message) });
  });

  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);
    eventBus.emit('app:fatalError', { error: event.reason });
  });
}

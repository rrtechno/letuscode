import { eventBus } from '../events/event-bus.js';

/**
 * StorageService
 * Single wrapper around window.localStorage. Every key is namespaced and
 * versioned so future schema changes don't collide with old data. No other
 * module should call window.localStorage directly.
 */
const NAMESPACE = 'luc';
const VERSION = 'v1';

function fullKey(key) {
  return `${NAMESPACE}:${VERSION}:${key}`;
}

export const StorageService = {
  /**
   * @param {string} key
   * @param {*} fallback returned if key is missing or unparsable
   */
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(fullKey(key));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      eventBus.emit('storage:error', { key, error: err, op: 'get' });
      return fallback;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(fullKey(key), JSON.stringify(value));
      return true;
    } catch (err) {
      const isQuotaError =
        err instanceof DOMException &&
        (err.code === 22 || err.name === 'QuotaExceededError');
      eventBus.emit(isQuotaError ? 'storage:quotaExceeded' : 'storage:error', {
        key,
        error: err,
        op: 'set'
      });
      return false;
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(fullKey(key));
    } catch (err) {
      eventBus.emit('storage:error', { key, error: err, op: 'remove' });
    }
  },

  /** Removes every key under this app's namespace (any version). Used for resets/debug. */
  clearNamespace() {
    const prefix = `${NAMESPACE}:`;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => window.localStorage.removeItem(k));
  },

  /** Lists raw (un-namespaced) keys currently stored under this app, for debugging. */
  listKeys() {
    const prefix = `${NAMESPACE}:${VERSION}:`;
    return Object.keys(window.localStorage)
      .filter((k) => k.startsWith(prefix))
      .map((k) => k.slice(prefix.length));
  }
};

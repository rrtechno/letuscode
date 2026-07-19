/**
 * EventBus
 * Minimal publish/subscribe utility. This is the primary way modules
 * communicate without importing each other directly (e.g. Lesson Engine
 * emits "lesson:completed"; Progress Service listens, with neither module
 * knowing the other exists).
 *
 * Canonical event names live in /docs/events-catalog.md (see plan). Key
 * events used across this build:
 *   route:changed          { path, params }
 *   app:fatalError         { error }
 *   storage:error          { key, error }
 *   editor:runRequested    { code }
 *   lesson:hintRevealed    { trackId, lessonId, hintIndex }
 *   lesson:completed       { trackId, lessonId, hintsUsed, attempts }
 *   progress:updated       { trackId }
 */
class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const wrapped = (payload) => {
      this.off(event, wrapped);
      handler(payload);
    };
    return this.on(event, wrapped);
  }

  off(event, handler) {
    const set = this._handlers.get(event);
    if (set) set.delete(handler);
  }

  emit(event, payload) {
    const set = this._handlers.get(event);
    if (!set || set.size === 0) return;
    // Copy to array so a handler unsubscribing mid-emit doesn't break iteration.
    [...set].forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        // A subscriber's bug should never break the emitter or other subscribers.
        console.error(`[EventBus] handler for "${event}" threw:`, err);
      }
    });
  }
}

// Single shared instance — the whole app talks over one bus.
export const eventBus = new EventBus();

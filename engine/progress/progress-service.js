import { StorageService } from '../storage/storage-service.js';
import { eventBus } from '../events/event-bus.js';

const SCHEMA_VERSION = 1;

function progressKey(trackId) {
  return `progress:${trackId}`;
}

function emptyTrackProgress() {
  return {
    schemaVersion: SCHEMA_VERSION,
    completedLessonIds: [],
    lessonMeta: {}, // lessonId -> { completedAt, attempts, hintsUsed }
    lastAccessedLessonId: null
  };
}

/**
 * ProgressService
 * Owns all learner progress persistence. Subscribes to "lesson:completed"
 * (emitted by run-orchestrator.js) so the Lesson Engine never needs to
 * know Progress exists — pure event-driven decoupling per the plan.
 */
export const ProgressService = {
  init() {
    eventBus.on('lesson:completed', (payload) => {
      this.markComplete(payload.trackId, payload.lessonId, {
        attempts: payload.attempts,
        hintsUsed: payload.hintsUsed
      });
    });
  },

  getTrackProgress(trackId) {
    return StorageService.get(progressKey(trackId), emptyTrackProgress());
  },

  getLessonProgress(trackId, lessonId) {
    const track = this.getTrackProgress(trackId);
    return {
      complete: track.completedLessonIds.includes(lessonId),
      meta: track.lessonMeta[lessonId] || null
    };
  },

  markComplete(trackId, lessonId, meta = {}) {
    const track = this.getTrackProgress(trackId);
    if (!track.completedLessonIds.includes(lessonId)) {
      track.completedLessonIds.push(lessonId);
    }
    track.lessonMeta[lessonId] = {
      completedAt: new Date().toISOString(),
      attempts: meta.attempts ?? track.lessonMeta[lessonId]?.attempts ?? 1,
      hintsUsed: meta.hintsUsed ?? track.lessonMeta[lessonId]?.hintsUsed ?? 0
    };
    StorageService.set(progressKey(trackId), track);
    eventBus.emit('progress:updated', { trackId });
  },

  setLastAccessedLesson(trackId, lessonId) {
    const track = this.getTrackProgress(trackId);
    track.lastAccessedLessonId = lessonId;
    StorageService.set(progressKey(trackId), track);
  },

  getLastAccessedLesson(trackId) {
    return this.getTrackProgress(trackId).lastAccessedLessonId;
  },

  /** @param {number} totalLessonCount total lessons in the track's manifest */
  getPercentComplete(trackId, totalLessonCount) {
    if (!totalLessonCount) return 0;
    const track = this.getTrackProgress(trackId);
    return Math.round((track.completedLessonIds.length / totalLessonCount) * 100);
  },

  getOverallCompletedCount(trackIds) {
    return trackIds.reduce((sum, id) => sum + this.getTrackProgress(id).completedLessonIds.length, 0);
  }
};

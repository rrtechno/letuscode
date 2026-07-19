import { ConfigService } from '../config/config-service.js';
import { validateLesson } from './lesson-validator.js';
import { Logger } from '../utils/logger.js';
import { PythonContentAdapter } from '../../adapters/content/python/python-content-adapter.js';

/**
 * Registry mapping a track's `contentAdapter` id (from tracks.json) to a
 * concrete adapter instance. This is the ONE place that knows concrete
 * adapter classes exist — everywhere else talks to the interface. Adding a
 * track means adding one line here plus the adapter module itself.
 */
const ADAPTERS = {
  python: new PythonContentAdapter()
};

function resolveAdapter(trackId) {
  const track = ConfigService.getTrackById(trackId);
  if (!track) throw new Error(`LessonEngine: unknown track "${trackId}"`);
  if (!track.contentAdapter || !ADAPTERS[track.contentAdapter]) {
    throw new Error(`LessonEngine: no content adapter registered for track "${trackId}"`);
  }
  return ADAPTERS[track.contentAdapter];
}

export const LessonEngine = {
  async loadManifest(trackId) {
    const adapter = resolveAdapter(trackId);
    return adapter.loadManifest();
  },

  async loadLesson(trackId, lessonId) {
    const adapter = resolveAdapter(trackId);
    const lesson = await adapter.loadLesson(lessonId);
    const { valid, errors } = validateLesson(lesson, `${trackId}/${lessonId}`);
    if (!valid) {
      errors.forEach((e) => Logger.warn(e));
    }
    return lesson;
  },

  getAdapter(trackId) {
    return resolveAdapter(trackId);
  }
};

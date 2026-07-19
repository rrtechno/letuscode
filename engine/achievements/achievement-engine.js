import { eventBus } from '../events/event-bus.js';
import { ProgressService } from '../progress/progress-service.js';
import { LessonEngine } from '../lesson/lesson-engine.js';
import { AchievementService } from './achievement-service.js';
import { getCurrentStreak } from '../progress/streak-calculator.js';
import { Logger } from '../utils/logger.js';

let definitions = [];
let loadPromise = null;

async function loadDefinitions() {
  if (loadPromise) return loadPromise;
  loadPromise = fetch('content/shared/achievements.json')
    .then((res) => res.json())
    .then((json) => (definitions = json.achievements));
  return loadPromise;
}

async function totalLessonCount(trackId) {
  try {
    const manifest = await LessonEngine.loadManifest(trackId);
    return manifest.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  } catch (err) {
    Logger.warn('AchievementEngine: could not compute total lesson count', err);
    return 0;
  }
}

function unlock(def) {
  const isNew = AchievementService.markEarned(def.id);
  if (isNew) eventBus.emit('achievement:earned', def);
}

async function evaluateAggregateTriggers(trackId) {
  await loadDefinitions();
  const earned = AchievementService.getEarnedIds();
  const trackProgress = ProgressService.getTrackProgress(trackId);
  const completedCount = trackProgress.completedLessonIds.length;
  const streak = getCurrentStreak();
  const total = await totalLessonCount(trackId);

  definitions.forEach((def) => {
    if (earned.includes(def.id)) return;
    if (def.triggerType === 'lessonCount' && completedCount >= def.triggerValue) unlock(def);
    if (def.triggerType === 'streak' && streak >= def.triggerValue) unlock(def);
    if (def.triggerType === 'trackComplete' && total > 0 && completedCount >= total) unlock(def);
  });
}

async function evaluateHintFreeTrigger(payload) {
  await loadDefinitions();
  const earned = AchievementService.getEarnedIds();
  const def = definitions.find((d) => d.triggerType === 'hintFree');
  if (def && !earned.includes(def.id) && payload.hintsUsed === 0) unlock(def);
}

/**
 * AchievementEngine
 * Listens to events already emitted elsewhere in the app
 * (progress:updated from progress-service.js, lesson:completed from
 * run-orchestrator.js) — no existing file needs to change to wire this
 * in, only `AchievementEngine.init()` needs to be called once at boot.
 */
export const AchievementEngine = {
  init() {
    eventBus.on('progress:updated', ({ trackId }) => evaluateAggregateTriggers(trackId));
    eventBus.on('lesson:completed', (payload) => evaluateHintFreeTrigger(payload));
  },

  async getAllWithStatus() {
    await loadDefinitions();
    const earnedRecords = AchievementService.getEarnedRecords();
    return definitions.map((def) => {
      const record = earnedRecords.find((r) => r.id === def.id);
      return { ...def, earned: Boolean(record), earnedAt: record ? record.earnedAt : null };
    });
  }
};

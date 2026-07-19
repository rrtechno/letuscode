import { ConfigService } from '../config/config-service.js';
import { ProgressService } from './progress-service.js';

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * getCurrentStreak
 * Consecutive calendar days (browser-local time) with at least one lesson
 * completion, across all active tracks. If today has no completion yet,
 * we don't break the streak on that basis alone — we start counting from
 * yesterday instead, so a learner mid-day isn't shown "streak: 0".
 */
export function getCurrentStreak() {
  const dateSet = new Set();

  ConfigService.getActiveTracks().forEach((track) => {
    const progress = ProgressService.getTrackProgress(track.id);
    Object.values(progress.lessonMeta || {}).forEach((meta) => {
      if (meta && meta.completedAt) dateSet.add(meta.completedAt.slice(0, 10));
    });
  });

  if (dateSet.size === 0) return 0;

  const cursor = new Date();
  if (!dateSet.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dateSet.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

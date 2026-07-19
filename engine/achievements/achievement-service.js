import { StorageService } from '../storage/storage-service.js';

const KEY = 'achievements:earned';

/**
 * AchievementService
 * Stores earned achievements as [{id, earnedAt}]. Mirrors the pattern of
 * progress-service.js but kept separate since achievements are their own
 * concern. markEarned() is idempotent.
 */
export const AchievementService = {
  getEarnedRecords() {
    return StorageService.get(KEY, []);
  },

  getEarnedIds() {
    return this.getEarnedRecords().map((r) => r.id);
  },

  markEarned(id) {
    const records = this.getEarnedRecords();
    if (records.some((r) => r.id === id)) return false;
    records.push({ id, earnedAt: new Date().toISOString() });
    StorageService.set(KEY, records);
    return true;
  }
};

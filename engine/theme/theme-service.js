import { StorageService } from '../storage/storage-service.js';

const STORAGE_KEY = 'preferences:theme';
const DEFAULT_THEME = 'light';

export const ThemeService = {
  apply(themeName = DEFAULT_THEME) {
    document.documentElement.setAttribute('data-theme', themeName);
    StorageService.set(STORAGE_KEY, themeName);
  },

  getCurrent() {
    return StorageService.get(STORAGE_KEY, DEFAULT_THEME);
  },

  initFromStoredPreference() {
    this.apply(this.getCurrent());
  }
};

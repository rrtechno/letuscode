/**
 * ConfigService
 * Loads /config/app.config.json and /config/tracks.json once, caches them
 * in memory, and exposes typed accessors. No other module should fetch
 * these files directly.
 */

let appConfig = null;
let tracksConfig = null;
let loadPromise = null;

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`ConfigService: failed to load ${path} (${res.status})`);
  }
  return res.json();
}

export const ConfigService = {
  /**
   * Loads and caches config. Safe to call multiple times — only fetches once.
   * @returns {Promise<{app: object, tracks: object}>}
   */
  async load() {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      const [app, tracks] = await Promise.all([
        fetchJson('./letuscode/config/app.config.json'),
        fetchJson('./letuscode/config/tracks.json')
      ]);
      appConfig = app;
      tracksConfig = tracks;
      return { app: appConfig, tracks: tracksConfig };
    })();

    return loadPromise;
  },

  getAppConfig() {
    if (!appConfig) {
      throw new Error('ConfigService: app config accessed before load()');
    }
    return appConfig;
  },

  getTracks() {
    if (!tracksConfig) {
      throw new Error('ConfigService: tracks config accessed before load()');
    }
    return tracksConfig.tracks;
  },

  getTrackById(trackId) {
    return this.getTracks().find((t) => t.id === trackId) || null;
  },

  getActiveTracks() {
    return this.getTracks().filter((t) => t.status === 'active');
  }
};

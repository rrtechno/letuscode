/**
 * PyodideLoader
 * Loads Pyodide from CDN and initializes the WASM runtime. Loaded lazily —
 * only the first time a Python lesson actually runs code — so tracks that
 * don't need Python never pay this cost. `ready()` caches the init so
 * repeated lesson runs reuse the same interpreter instance.
 */
const PYODIDE_CDN_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full';

let readyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`PyodideLoader: failed to load script ${src}`));
    document.head.appendChild(script);
  });
}

export const PyodideLoader = {
  /** @returns {Promise<any>} the initialized pyodide instance */
  ready() {
    if (readyPromise) return readyPromise;

    readyPromise = (async () => {
      await loadScript(`${PYODIDE_CDN_BASE}/pyodide.js`);
      // eslint-disable-next-line no-undef
      const pyodide = await loadPyodide({ indexURL: `${PYODIDE_CDN_BASE}/` });
      return pyodide;
    })();

    return readyPromise;
  },

  isLoaded() {
    return readyPromise !== null;
  }
};

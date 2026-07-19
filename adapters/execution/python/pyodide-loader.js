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
      // 1. Temporarily hide the AMD module loader to prevent collisions
      const tempDefine = window.define;
      window.define = undefined;

      try {
        // 2. Load the script cleanly into the global window space
        await loadScript(`${PYODIDE_CDN_BASE}/pyodide.js`);
        
        // 3. Initialize Pyodide with your CDN path configuration
        // eslint-disable-next-line no-undef
        const pyodide = await loadPyodide({ indexURL: `${PYODIDE_CDN_BASE}/` });
        return pyodide;
      } finally {
        // 4. Always restore the AMD loader so your other application tools work
        window.define = tempDefine;
      }
    })();

    return readyPromise;
  },

  isLoaded() {
    return readyPromise !== null;
  }
};

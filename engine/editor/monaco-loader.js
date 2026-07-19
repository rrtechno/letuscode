/**
 * MonacoLoader
 * Loads Monaco Editor from a CDN using its AMD loader, without any bundler
 * — required by the "no build tools" constraint. `ready()` resolves once
 * `window.monaco` is fully available and is safe to call from multiple
 * places (it only loads once).
 */
const MONACO_CDN_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs';

let readyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`MonacoLoader: failed to load script ${src}`));
    document.head.appendChild(script);
  });
}

export const MonacoLoader = {
  ready() {
    if (readyPromise) return readyPromise;

    readyPromise = new Promise((resolve, reject) => {
      loadScript(`${MONACO_CDN_BASE}/loader.js`)
        .then(() => {
          // eslint-disable-next-line no-undef
          require.config({ paths: { vs: MONACO_CDN_BASE } });
          // eslint-disable-next-line no-undef
          require(['vs/editor/editor.main'], () => {
            resolve(window.monaco);
          }, (err) => reject(new Error(`MonacoLoader: AMD module load failed — ${err}`)));
        })
        .catch(reject);
    });

    return readyPromise;
  }
};

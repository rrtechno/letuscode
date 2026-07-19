let dictionary = null;
let loadPromise = null;

/**
 * ErrorTranslator
 * Loads /content/shared/error-messages.python.json once and looks up a
 * friendly explanation by exception type. Unrecognized types fall back to
 * the raw message rather than being silently swallowed (Task 6.6
 * acceptance criteria).
 */
export const ErrorTranslator = {
  async load() {
    if (loadPromise) return loadPromise;
    loadPromise = fetch('./content/shared/error-messages.python.json')
      .then((res) => res.json())
      .then((json) => (dictionary = json));
    return loadPromise;
  },

  /** @param {{type:string, message:string, line?:number}} error */
  translate(error) {
    if (!error) return null;
    const friendly = dictionary ? dictionary[error.type] : null;
    return {
      type: error.type,
      line: error.line,
      friendlyMessage: friendly || `${error.type}: ${error.message}`,
      rawMessage: error.message
    };
  }
};

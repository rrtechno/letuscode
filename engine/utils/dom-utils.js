/**
 * dom-utils
 * Small helpers used across every component. `setText` and `createEl`
 * default to text-safe insertion so untrusted content (lesson JSON, user
 * code output) can never inject markup unless a caller explicitly opts in
 * via `trusted: true`.
 */

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Creates an element with attributes/children in one call.
 * @param {string} tag
 * @param {object} [opts]
 * @param {object} [opts.attrs] plain attribute map (also accepts "class", "style")
 * @param {string} [opts.text] text content (escaped — safe for untrusted strings)
 * @param {(Node|string)[]} [opts.children]
 * @param {object} [opts.on] event listener map, e.g. { click: handler }
 */
export function createEl(tag, opts = {}) {
  const el = document.createElement(tag);
  const { attrs = {}, text, children = [], on = {} } = opts;

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'dataset') {
      Object.entries(value).forEach(([dk, dv]) => (el.dataset[dk] = dv));
    } else {
      el.setAttribute(key, value);
    }
  }

  if (text !== undefined) setText(el, text);

  children.forEach((child) => {
    if (child === null || child === undefined) return;
    el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });

  for (const [evt, handler] of Object.entries(on)) {
    el.addEventListener(evt, handler);
  }

  return el;
}

/** Sets element text content safely (never interprets HTML). */
export function setText(el, text) {
  el.textContent = text ?? '';
}

/**
 * Sets HTML content ONLY when the caller explicitly asserts the string is
 * trusted (i.e. authored by us, not derived from lesson JSON or program
 * output without sanitization). Prefer setText/createEl everywhere else.
 */
export function setTrustedHtml(el, html) {
  el.innerHTML = html;
}

/** Removes all children of an element. */
export function empty(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/**
 * Extremely small {{token}} substitution templater for trusted, static
 * string templates (never for rendering raw external content).
 * @param {string} template
 * @param {object} data
 */
export function renderTemplate(template, data = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : ''
  );
}

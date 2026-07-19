import { eventBus } from '../events/event-bus.js';
import { Logger } from '../utils/logger.js';

/**
 * Router
 * Minimal hash-based client-side router. GitHub Pages has no server-side
 * rewrites, so history-API routing is out of scope by design — every
 * route lives under a "#/" hash fragment.
 *
 * Route patterns use ":param" segments, e.g. "/track/:trackId/lesson/:lessonId".
 */
const routes = []; // { pattern, segments, controller }
let currentController = null;
let notFoundController = null;
let mainEl = null;

function compilePattern(pattern) {
  const segments = pattern.split('/').filter(Boolean);
  return segments;
}

function matchRoute(pathSegments) {
  for (const route of routes) {
    if (route.segments.length !== pathSegments.length) continue;
    const params = {};
    let matched = true;
    for (let i = 0; i < route.segments.length; i++) {
      const routeSeg = route.segments[i];
      const pathSeg = decodeURIComponent(pathSegments[i]);
      if (routeSeg.startsWith(':')) {
        params[routeSeg.slice(1)] = pathSeg;
      } else if (routeSeg !== pathSeg) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return null;
}

function parseHash() {
  const hash = window.location.hash || '#/';
  const path = hash.replace(/^#/, '') || '/';
  return path.split('/').filter(Boolean);
}

async function dispatch() {
  const pathSegments = parseHash();
  const match = matchRoute(pathSegments);

  if (currentController && typeof currentController.unmount === 'function') {
    try {
      currentController.unmount();
    } catch (err) {
      Logger.error('Router: error unmounting previous page', err);
    }
  }

  const path = '/' + pathSegments.join('/');

  if (!match) {
    Logger.warn(`Router: no route matched "${path}", falling back to not-found controller`);
    currentController = notFoundController;
    eventBus.emit('route:changed', { path, params: {}, matched: false });
    if (notFoundController) notFoundController.mount(mainEl, {});
    return;
  }

  currentController = match.route.controller;
  eventBus.emit('route:changed', { path, params: match.params, matched: true });
  try {
    await currentController.mount(mainEl, match.params);
  } catch (err) {
    Logger.error(`Router: error mounting controller for "${path}"`, err);
    eventBus.emit('app:fatalError', { error: err });
  }
}

export const Router = {
  /** @param {string} pattern e.g. "/track/:trackId/lesson/:lessonId" */
  register(pattern, controller) {
    routes.push({ pattern, segments: compilePattern(pattern), controller });
  },

  registerNotFound(controller) {
    notFoundController = controller;
  },

  start(mountEl) {
    mainEl = mountEl;
    window.addEventListener('hashchange', dispatch);
    dispatch(); // handle the initial load / deep link
  },

  navigate(path) {
    window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
  }
};

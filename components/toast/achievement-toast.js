import { createEl } from '../../engine/utils/dom-utils.js';
import { eventBus } from '../../engine/events/event-bus.js';

const DISPLAY_MS = 4000;
let hostEl = null;
let queue = [];
let showing = false;

function ensureMounted() {
  if (hostEl) return;
  hostEl = createEl('div', { attrs: { class: 'luc-toast-host', 'aria-live': 'polite' } });
  document.body.appendChild(hostEl);
}

function showNext() {
  if (showing || queue.length === 0) return;
  showing = true;
  const def = queue.shift();

  const toast = createEl('div', {
    attrs: { class: 'luc-toast' },
    children: [
      createEl('span', { attrs: { class: 'luc-toast__icon' }, text: def.icon }),
      createEl('div', {
        children: [
          createEl('div', { attrs: { class: 'luc-toast__title' }, text: `Achievement unlocked: ${def.title}` }),
          createEl('div', { attrs: { class: 'luc-toast__desc' }, text: def.description })
        ]
      }),
      createEl('button', {
        attrs: { class: 'luc-toast__dismiss', 'aria-label': 'Dismiss' },
        text: '✕',
        on: { click: dismissCurrent }
      })
    ]
  });

  hostEl.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  const timer = setTimeout(dismissCurrent, DISPLAY_MS);

  function dismissCurrent() {
    clearTimeout(timer);
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.remove();
      showing = false;
      showNext();
    }, 200);
  }
}

/**
 * AchievementToast
 * Call init() once at boot. No mount point required in the shell — it
 * attaches itself to document.body the same way the Modal system does.
 */
export const AchievementToast = {
  init() {
    ensureMounted();
    eventBus.on('achievement:earned', (def) => {
      queue.push(def);
      showNext();
    });
  }
};

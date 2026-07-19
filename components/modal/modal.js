import { createEl, empty } from '../../engine/utils/dom-utils.js';

let overlayEl = null;
let dialogEl = null;
let lastFocusedEl = null;
let appRootEl = null;
let isOpen = false;

function ensureMounted() {
  if (overlayEl) return;
  dialogEl = createEl('div', {
    attrs: { class: 'luc-modal__dialog', role: 'dialog', 'aria-modal': 'true', tabindex: '-1' }
  });
  overlayEl = createEl('div', {
    attrs: { class: 'luc-modal__overlay', hidden: true },
    children: [dialogEl],
    on: {
      click: (e) => {
        if (e.target === overlayEl) Modal.close();
      }
    }
  });
  document.body.appendChild(overlayEl);
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === 'Escape') Modal.close();
    if (isOpen && e.key === 'Tab') trapFocus(e);
  });
}

function trapFocus(e) {
  const focusable = dialogEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Modal
 * open({title, body, actions}) — `body` may be a string (rendered as text)
 * or a DOM node (for richer content built by the caller). Only one modal
 * may be open at a time; a second open() call while one is active is
 * rejected (caller should queue if needed, e.g. achievement toasts do
 * their own sequencing rather than using Modal for that).
 */
export const Modal = {
  open({ title, body, actions = [] }) {
    ensureMounted();
    if (isOpen) {
      console.warn('[Modal] open() called while a modal is already open — ignored.');
      return false;
    }

    empty(dialogEl);
    const titleEl = createEl('h2', { attrs: { class: 'luc-modal__title' }, text: title });
    const bodyEl = createEl('div', { attrs: { class: 'luc-modal__body' } });
    if (typeof body === 'string') bodyEl.textContent = body;
    else if (body instanceof Node) bodyEl.appendChild(body);

    const actionsEl = createEl('div', { attrs: { class: 'luc-modal__actions' } });
    actions.forEach((action) => {
      actionsEl.appendChild(
        createEl('button', {
          attrs: { class: `luc-btn ${action.variant === 'primary' ? 'luc-btn--primary' : 'luc-btn--ghost'}` },
          text: action.label,
          on: {
            click: () => {
              action.onClick && action.onClick();
              if (action.closeOnClick !== false) Modal.close();
            }
          }
        })
      );
    });

    dialogEl.append(titleEl, bodyEl, actionsEl);

    lastFocusedEl = document.activeElement;
    if (appRootEl) appRootEl.setAttribute('aria-hidden', 'true');
    overlayEl.hidden = false;
    isOpen = true;

    const firstFocusable = dialogEl.querySelector('button, [href], input, [tabindex]');
    (firstFocusable || dialogEl).focus();
    return true;
  },

  close() {
    if (!isOpen) return;
    overlayEl.hidden = true;
    isOpen = false;
    if (appRootEl) appRootEl.removeAttribute('aria-hidden');
    if (lastFocusedEl) lastFocusedEl.focus();
  },

  isOpen() {
    return isOpen;
  },

  /** Called once at boot so Modal knows which element to mark inert/aria-hidden while open. */
  registerAppRoot(el) {
    appRootEl = el;
  }
};

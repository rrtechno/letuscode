import { createEl } from '../../engine/utils/dom-utils.js';

/**
 * AppShell
 * Renders the persistent header/sidebar/main/footer regions once at boot.
 * Page controllers mount into `getMainEl()`; Header/Sidebar components
 * mount into their respective regions once, on init.
 */
let shellEl = null;
let mainEl = null;
let breadcrumbSlotEl = null;
let pageContentEl = null;
let sidebarEl = null;
let headerEl = null;

export const AppShell = {
  mount(rootEl) {
    headerEl = createEl('div', { attrs: { class: 'luc-shell__header' } });
    sidebarEl = createEl('nav', {
      attrs: { class: 'luc-shell__sidebar', 'aria-label': 'Lesson navigation' }
    });

    breadcrumbSlotEl = createEl('div', { attrs: { class: 'luc-shell__breadcrumb-slot' } });
    pageContentEl = createEl('div', { attrs: { class: 'luc-shell__page-content', id: 'app-main' } });
    mainEl = createEl('main', {
      attrs: { class: 'luc-shell__main' },
      children: [breadcrumbSlotEl, pageContentEl]
    });

    const footerEl = createEl('footer', { attrs: { class: 'luc-shell__footer' } });

    shellEl = createEl('div', {
      attrs: { class: 'luc-shell', 'data-sidebar': 'closed' },
      children: [headerEl, sidebarEl, mainEl, footerEl]
    });

    rootEl.appendChild(shellEl);
    return shellEl;
  },

  getHeaderEl() {
    return headerEl;
  },
  getSidebarEl() {
    return sidebarEl;
  },
  getBreadcrumbEl() {
    return breadcrumbSlotEl;
  },
  /** The router-controlled region — page controllers mount/unmount here only. */
  getMainEl() {
    return pageContentEl;
  },

  /** Mobile sidebar toggle — sidebar starts hidden below the 860px breakpoint. */
  toggleSidebar(forceOpen) {
    const isOpen = shellEl.dataset.sidebar === 'open';
    const next = forceOpen ?? !isOpen;
    shellEl.dataset.sidebar = next ? 'open' : 'closed';
  }
};

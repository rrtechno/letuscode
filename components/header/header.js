import { createEl, setText } from '../../engine/utils/dom-utils.js';

let els = {};

/**
 * Header
 * Renders once into the shell's header region. `setTrack` updates the
 * displayed track without re-rendering the whole component.
 */
export const Header = {
  mount(container) {
    const logo = createEl('a', {
      attrs: { class: 'luc-header__logo', href: '#/' },
      children: [
        createEl('span', { attrs: { class: 'luc-header__logo-mark' }, text: '</>' }),
        createEl('span', { attrs: { class: 'luc-header__logo-text' }, text: 'Let Us Code' })
      ]
    });

    const trackLabel = createEl('span', { attrs: { class: 'luc-header__track' } });
    const progressSummary = createEl('span', {
      attrs: { class: 'luc-header__progress', id: 'header-progress-summary' }
    });

    const menuBtn = createEl('button', {
      attrs: { class: 'luc-header__menu-btn', 'aria-label': 'Toggle lesson menu' },
      text: '☰'
    });

    const nav = createEl('nav', {
      attrs: { class: 'luc-header__nav', 'aria-label': 'Main' },
      children: [
        createEl('a', { attrs: { href: '#/progress' }, text: 'Progress' }),
        createEl('a', { attrs: { href: '#/' }, text: 'Tracks' })
      ]
    });

    const bar = createEl('div', {
      attrs: { class: 'luc-header' },
      children: [menuBtn, logo, trackLabel, progressSummary, nav]
    });

    container.appendChild(bar);
    els = { trackLabel, progressSummary, menuBtn };
    return els;
  },

  setTrack(trackMeta) {
    if (!trackMeta) {
      setText(els.trackLabel, '');
      return;
    }
    setText(els.trackLabel, `${trackMeta.icon || ''} ${trackMeta.displayName}`.trim());
  },

  setProgressSummary(text) {
    setText(els.progressSummary, text);
  },

  onMenuToggle(handler) {
    els.menuBtn.addEventListener('click', handler);
  }
};

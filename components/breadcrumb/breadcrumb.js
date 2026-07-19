import { createEl, empty } from '../../engine/utils/dom-utils.js';

let hostEl = null;

export const Breadcrumb = {
  mount(container) {
    hostEl = createEl('nav', { attrs: { class: 'luc-breadcrumb', 'aria-label': 'Breadcrumb' } });
    container.appendChild(hostEl);
  },

  /** @param {Array<{label:string, href?:string}>} trail last item has no href (current page) */
  render(trail) {
    if (!hostEl) return;
    empty(hostEl);
    trail.forEach((crumb, i) => {
      const isLast = i === trail.length - 1;
      hostEl.appendChild(
        isLast
          ? createEl('span', { attrs: { class: 'luc-breadcrumb__current', 'aria-current': 'page' }, text: crumb.label })
          : createEl('a', { attrs: { class: 'luc-breadcrumb__link', href: crumb.href }, text: crumb.label })
      );
      if (!isLast) {
        hostEl.appendChild(createEl('span', { attrs: { class: 'luc-breadcrumb__sep', 'aria-hidden': 'true' }, text: '/' }));
      }
    });
  }
};

import { createEl, empty, qsa } from '../../engine/utils/dom-utils.js';

let containerEl = null;
let listEl = null;
let onSelectHandler = null;

/**
 * Sidebar
 * Structural + interactive list of modules/lessons. Data binding (what to
 * show, completion state) is owned by lesson-nav-binder.js — this
 * component only knows how to render items it's given and report clicks.
 */
export const Sidebar = {
  mount(container) {
    containerEl = container;
    listEl = createEl('ul', { attrs: { class: 'luc-sidebar__list', role: 'list' } });
    container.appendChild(createEl('div', { attrs: { class: 'luc-sidebar' }, children: [listEl] }));
    listEl.addEventListener('keydown', handleKeydown);
  },

  /**
   * @param {Array<{id, label, type:'module'|'lesson', complete?:boolean, href}>} items
   */
  renderItems(items) {
    empty(listEl);
    items.forEach((item) => {
      if (item.type === 'module') {
        listEl.appendChild(
          createEl('li', {
            attrs: { class: 'luc-sidebar__module', role: 'presentation' },
            text: item.label
          })
        );
        return;
      }

      const link = createEl('a', {
        attrs: {
          href: item.href,
          class: 'luc-sidebar__item',
          'data-item-id': item.id,
          tabindex: '0',
          'aria-current': 'false'
        },
        children: [
          createEl('span', {
            attrs: { class: 'luc-sidebar__check', 'aria-hidden': 'true' },
            text: item.complete ? '✓' : ''
          }),
          createEl('span', { attrs: { class: 'luc-sidebar__label' }, text: item.label })
        ],
        on: {
          click: () => onSelectHandler && onSelectHandler(item.id)
        }
      });

      listEl.appendChild(createEl('li', { children: [link] }));
    });
  },

  setActiveItem(itemId) {
    qsa('.luc-sidebar__item', listEl).forEach((el) => {
      const isActive = el.dataset.itemId === String(itemId);
      el.classList.toggle('is-active', isActive);
      el.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  },

  onSelect(handler) {
    onSelectHandler = handler;
  }
};

function handleKeydown(event) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const items = qsa('.luc-sidebar__item', listEl);
  const currentIndex = items.indexOf(document.activeElement);
  if (currentIndex === -1) return;
  event.preventDefault();
  const nextIndex =
    event.key === 'ArrowDown'
      ? Math.min(currentIndex + 1, items.length - 1)
      : Math.max(currentIndex - 1, 0);
  items[nextIndex].focus();
}

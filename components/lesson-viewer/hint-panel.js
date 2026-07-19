import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { eventBus } from '../../engine/events/event-bus.js';

export const HintPanel = {
  /**
   * @param {HTMLElement} hostEl
   * @param {string[]} hints
   * @param {(index:number)=>void} [onReveal]
   */
  render(hostEl, hints, onReveal) {
    let revealedCount = 0;

    const list = createEl('ol', { attrs: { class: 'luc-hints__list' } });
    const button = createEl('button', {
      attrs: { class: 'luc-btn luc-btn--ghost luc-hints__button' },
      text: `Show a hint (${hints.length} available)`
    });

    button.addEventListener('click', () => {
      if (revealedCount >= hints.length) return;
      const hintText = hints[revealedCount];
      list.appendChild(createEl('li', { text: hintText }));
      revealedCount += 1;
      eventBus.emit('lesson:hintRevealed', { hintIndex: revealedCount - 1 });
      if (onReveal) onReveal(revealedCount - 1);

      if (revealedCount >= hints.length) {
        button.disabled = true;
        button.textContent = 'No more hints';
      } else {
        button.textContent = `Show another hint (${hints.length - revealedCount} left)`;
      }
    });

    empty(hostEl);
    hostEl.append(
      createEl('div', { attrs: { class: 'luc-hints' }, children: [button, list] })
    );
  }
};

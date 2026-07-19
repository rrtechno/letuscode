import { createEl, empty } from '../../engine/utils/dom-utils.js';

const MAX_VISIBLE_CHARS = 4000;

let outputEl = null;
let hostEl = null;

export const ConsolePanel = {
  mount(container) {
    hostEl = container;
    const header = createEl('div', {
      attrs: { class: 'luc-console__header' },
      children: [
        createEl('span', { attrs: { class: 'luc-console__label' }, text: 'Console' }),
        createEl('button', {
          attrs: { class: 'luc-console__clear', 'aria-label': 'Clear console' },
          text: 'Clear',
          on: { click: () => ConsolePanel.clear() }
        })
      ]
    });
    outputEl = createEl('div', { attrs: { class: 'luc-console__output', role: 'log' } });
    container.append(header, outputEl);
  },

  setBusy(isBusy) {
    if (!hostEl) return;
    hostEl.classList.toggle('is-busy', isBusy);
  },

  clear() {
    if (outputEl) empty(outputEl);
  },

  /** @param {{stdout:string, translatedError:{friendlyMessage:string,rawMessage:string,line?:number}|null}} output */
  render({ stdout, translatedError }) {
    this.clear();

    if (stdout) {
      const text = stdout.length > MAX_VISIBLE_CHARS ? stdout.slice(0, MAX_VISIBLE_CHARS) + '\n… (output trimmed)' : stdout;
      outputEl.appendChild(createEl('pre', { attrs: { class: 'luc-console__stdout' }, text }));
    }

    if (translatedError) {
      outputEl.appendChild(
        createEl('div', {
          attrs: { class: 'luc-console__error' },
          children: [
            createEl('div', { attrs: { class: 'luc-console__error-title' }, text: `⚠ ${translatedError.type}` }),
            createEl('div', { attrs: { class: 'luc-console__error-friendly' }, text: translatedError.friendlyMessage }),
            createEl('div', { attrs: { class: 'luc-console__error-raw' }, text: translatedError.rawMessage })
          ]
        })
      );
    }

    if (!stdout && !translatedError) {
      outputEl.appendChild(
        createEl('div', { attrs: { class: 'luc-console__empty' }, text: 'Nothing printed yet — click Run!' })
      );
    }

    outputEl.scrollTop = outputEl.scrollHeight;
  }
};

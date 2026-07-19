import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { Modal } from '../modal/modal.js';

export const EditorToolbar = {
  mount(container, { onRun, onReset, onFontSizeChange, initialFontSize = 16 }) {
    empty(container);

    const runBtn = createEl('button', {
      attrs: { class: 'luc-btn luc-btn--primary luc-editor-toolbar__run' },
      children: [createEl('span', { attrs: { 'aria-hidden': 'true' }, text: '▶ ' }), document.createTextNode('Run')],
      on: { click: () => onRun() }
    });

    const resetBtn = createEl('button', {
      attrs: { class: 'luc-btn luc-btn--ghost' },
      text: 'Reset',
      on: {
        click: () => {
          Modal.open({
            title: 'Reset your code?',
            body: "This puts back the starting code and can't be undone.",
            actions: [
              { label: 'Cancel', variant: 'ghost' },
              { label: 'Reset', variant: 'primary', onClick: onReset }
            ]
          });
        }
      }
    });

    const fontDown = createEl('button', {
      attrs: { class: 'luc-btn luc-btn--ghost luc-editor-toolbar__font-btn', 'aria-label': 'Decrease font size' },
      text: 'A−'
    });
    const fontUp = createEl('button', {
      attrs: { class: 'luc-btn luc-btn--ghost luc-editor-toolbar__font-btn', 'aria-label': 'Increase font size' },
      text: 'A+'
    });

    let fontSize = initialFontSize;
    fontDown.addEventListener('click', () => {
      fontSize = Math.max(12, fontSize - 2);
      onFontSizeChange(fontSize);
    });
    fontUp.addEventListener('click', () => {
      fontSize = Math.min(28, fontSize + 2);
      onFontSizeChange(fontSize);
    });

    container.appendChild(
      createEl('div', {
        attrs: { class: 'luc-editor-toolbar' },
        children: [runBtn, resetBtn, createEl('span', { attrs: { class: 'luc-editor-toolbar__spacer' } }), fontDown, fontUp]
      })
    );
  }
};

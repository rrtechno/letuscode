import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { Logger } from '../../engine/utils/logger.js';
import { HintPanel } from './hint-panel.js';

/**
 * LessonViewer
 * Renders lesson.contentBlocks[] into the given pane. Unknown block types
 * degrade to plain text with a console warning rather than breaking the
 * page (Task 4.5 acceptance criteria). Track-specific block types are
 * given to the active adapter's renderContentBlock() first; only if that
 * returns null do we fall back to the generic renderers below.
 */
export const LessonViewer = {
  render(paneEl, lesson, { adapter, onHintRevealed } = {}) {
    empty(paneEl);

    const header = createEl('div', {
      attrs: { class: 'luc-lesson__header' },
      children: [
        createEl('span', { attrs: { class: 'luc-lesson__number' }, text: formatOrder(lesson.order) }),
        createEl('h1', { attrs: { class: 'luc-lesson__title' }, text: lesson.title })
      ]
    });
    paneEl.appendChild(header);

    const body = createEl('div', { attrs: { class: 'luc-lesson__body' } });
    (lesson.contentBlocks || []).forEach((block) => {
      const custom = adapter ? adapter.renderContentBlock(block) : null;
      body.appendChild(custom instanceof Node ? custom : renderBlock(block));
    });
    paneEl.appendChild(body);

    if (Array.isArray(lesson.hints) && lesson.hints.length > 0) {
      const hintHost = createEl('div', { attrs: { class: 'luc-lesson__hints' } });
      paneEl.appendChild(hintHost);
      HintPanel.render(hintHost, lesson.hints, onHintRevealed);
    }

    const resultsHost = createEl('div', {
      attrs: { class: 'luc-lesson__results', id: 'lesson-test-results' }
    });
    paneEl.appendChild(resultsHost);
  },

  /** @param {{passed:boolean, results:Array}} evaluation */
  renderTestResults(paneEl, evaluation) {
    const host = paneEl.querySelector('#lesson-test-results');
    if (!host) return;
    empty(host);

    if (!evaluation) return;

    const summary = createEl('div', {
      attrs: {
        class: `luc-test-summary ${evaluation.passed ? 'is-pass' : 'is-fail'}`
      },
      text: evaluation.passed ? '🎉 All checks passed!' : 'Not quite yet — check the details below.'
    });
    host.appendChild(summary);

    const list = createEl('ul', { attrs: { class: 'luc-test-list' } });
    evaluation.results.forEach((r) => {
      list.appendChild(
        createEl('li', {
          attrs: { class: `luc-test-item ${r.passed ? 'is-pass' : 'is-fail'}` },
          children: [
            createEl('span', { attrs: { class: 'luc-test-item__icon' }, text: r.passed ? '✓' : '✕' }),
            createEl('span', { text: r.message })
          ]
        })
      );
    });
    host.appendChild(list);
  }
};

function formatOrder(order) {
  return String(order).padStart(2, '0');
}

function renderBlock(block) {
  switch (block.type) {
    case 'heading':
      return createEl('h2', { attrs: { class: 'luc-block-heading' }, text: block.text });
    case 'paragraph':
      return createEl('p', { attrs: { class: 'luc-block-paragraph' }, text: block.text });
    case 'code-sample':
      return createEl('pre', {
        attrs: { class: 'luc-block-code' },
        children: [createEl('code', { text: block.code || '' })]
      });
    case 'tip':
      return createEl('div', {
        attrs: { class: 'luc-block-tip' },
        children: [
          createEl('span', { attrs: { class: 'luc-block-tip__icon' }, text: '💡' }),
          createEl('span', { text: block.text })
        ]
      });
    case 'image':
      return createEl('img', {
        attrs: { class: 'luc-block-image', src: block.src, alt: block.alt || '' }
      });
    default:
      Logger.warn(`LessonViewer: unknown content block type "${block.type}" — rendering as plain text`);
      return createEl('p', { text: block.text || '' });
  }
}

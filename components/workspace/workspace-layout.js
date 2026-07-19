import { createEl } from '../../engine/utils/dom-utils.js';

/**
 * WorkspaceLayout
 * Purely structural: creates the three named mount points used by the
 * Lesson Viewer, Editor Panel, and Console Panel. Returns fresh elements
 * each call so a page controller can build/tear down its own workspace
 * instance per lesson visit.
 */
export function createWorkspaceLayout() {
  const lessonPane = createEl('section', {
    attrs: { class: 'luc-workspace__lesson', id: 'lesson-pane', 'aria-label': 'Lesson instructions' }
  });
  const editorPane = createEl('section', {
    attrs: { class: 'luc-workspace__editor', id: 'editor-pane', 'aria-label': 'Code editor' }
  });
  const consolePane = createEl('section', {
    attrs: { class: 'luc-workspace__console', id: 'console-pane', 'aria-label': 'Program output' }
  });

  const codeColumn = createEl('div', {
    attrs: { class: 'luc-workspace__code-column' },
    children: [editorPane, consolePane]
  });

  const root = createEl('div', {
    attrs: { class: 'luc-workspace' },
    children: [lessonPane, codeColumn]
  });

  return { root, lessonPane, editorPane, consolePane };
}

import { MonacoLoader } from '../../engine/editor/monaco-loader.js';
import { defineLucMonacoTheme } from '../../engine/editor/monaco-theme.js';
import { StorageService } from '../../engine/storage/storage-service.js';
import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { EditorToolbar } from './editor-toolbar.js';

const FONT_SIZE_KEY = 'preferences:editorFontSize';
const SAVE_DEBOUNCE_MS = 500;

let monacoInstance = null;
let editorInstance = null;
let saveTimer = null;
let currentStorageKey = null;
let changeListeners = [];

function codeStorageKey(trackId, lessonId) {
  return `code:${trackId}:${lessonId}`;
}

/**
 * EditorPanel
 * Wraps a single Monaco instance. mount() is called once per lesson visit
 * (the Lesson Page Controller disposes the previous instance first via
 * dispose()). Persists in-progress code per lesson via StorageService.
 */
export const EditorPanel = {
  async mount(container, { trackId, lessonId, starterCode, onRunRequested, onReset }) {
    empty(container);
    const toolbarHost = createEl('div', { attrs: { class: 'luc-editor-panel__toolbar' } });
    const editorHost = createEl('div', { attrs: { class: 'luc-editor-panel__surface' } });
    container.append(toolbarHost, editorHost);

    currentStorageKey = codeStorageKey(trackId, lessonId);
    const savedCode = StorageService.get(currentStorageKey, null);
    const initialCode = savedCode !== null ? savedCode : starterCode;

    monacoInstance = await MonacoLoader.ready();
    defineLucMonacoTheme(monacoInstance);

    editorInstance = monacoInstance.editor.create(editorHost, {
      value: initialCode,
      language: 'python',
      theme: 'luc-light',
      fontSize: StorageService.get(FONT_SIZE_KEY, 16),
      tabSize: 4,
      insertSpaces: true,
      autoIndent: 'full',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false
    });

    editorInstance.onDidChangeModelContent(() => {
      scheduleSave();
      changeListeners.forEach((fn) => fn(editorInstance.getValue()));
    });

    EditorToolbar.mount(toolbarHost, {
      onRun: () => onRunRequested && onRunRequested(editorInstance.getValue()),
      onReset: () => {
        editorInstance.setValue(starterCode);
        StorageService.set(currentStorageKey, starterCode);
        onReset && onReset();
      },
      onFontSizeChange: (size) => {
        editorInstance.updateOptions({ fontSize: size });
        StorageService.set(FONT_SIZE_KEY, size);
      },
      initialFontSize: StorageService.get(FONT_SIZE_KEY, 16)
    });
  },

  getValue() {
    return editorInstance ? editorInstance.getValue() : '';
  },

  setValue(code) {
    if (editorInstance) editorInstance.setValue(code);
  },

  focus() {
    if (editorInstance) editorInstance.focus();
  },

  onChange(handler) {
    changeListeners.push(handler);
  },

  /** Displays inline error markers, e.g. from a Python traceback with a line number. */
  setErrorMarker(line, message) {
    if (!editorInstance || !monacoInstance) return;
    monacoInstance.editor.setModelMarkers(editorInstance.getModel(), 'luc-execution', [
      {
        startLineNumber: line,
        endLineNumber: line,
        startColumn: 1,
        endColumn: 1000,
        message,
        severity: monacoInstance.MarkerSeverity.Error
      }
    ]);
  },

  clearErrorMarkers() {
    if (!editorInstance || !monacoInstance) return;
    monacoInstance.editor.setModelMarkers(editorInstance.getModel(), 'luc-execution', []);
  },

  /** Disposes the current Monaco instance — call before mounting a new lesson. */
  dispose() {
    if (saveTimer) clearTimeout(saveTimer);
    if (editorInstance) {
      editorInstance.dispose();
      editorInstance = null;
    }
    changeListeners = [];
    currentStorageKey = null;
  }
};

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (currentStorageKey && editorInstance) {
      StorageService.set(currentStorageKey, editorInstance.getValue());
    }
  }, SAVE_DEBOUNCE_MS);
}

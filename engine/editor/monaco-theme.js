/**
 * defineLucMonacoTheme
 * Registers a Monaco theme whose colors are hand-mapped from
 * /assets/styles/tokens.css so the editor doesn't look visually
 * disconnected from the rest of the app. Called once, after Monaco is
 * ready, before the first editor instance is created.
 */
export function defineLucMonacoTheme(monaco) {
  monaco.editor.defineTheme('luc-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '9497a8', fontStyle: 'italic' },
      { token: 'keyword', foreground: '4c56e8', fontStyle: 'bold' },
      { token: 'string', foreground: '17a673' },
      { token: 'number', foreground: 'ffb020' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1c1f2e',
      'editorLineNumber.foreground': '#9497a8',
      'editorCursor.foreground': '#4c56e8',
      'editor.lineHighlightBackground': '#f2f1fb',
      'editorGutter.background': '#ffffff'
    }
  });
}

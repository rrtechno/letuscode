import { ExecutionEngine } from './execution-engine.js';
import { ErrorTranslator } from './error-translator.js';
import { LessonValidatorEngine } from '../lesson/lesson-validator-engine.js';
import { ConsolePanel } from '../../components/console-panel/console-panel.js';
import { LessonViewer } from '../../components/lesson-viewer/lesson-viewer.js';
import { EditorPanel } from '../../components/editor-panel/editor-panel.js';
import { eventBus } from '../events/event-bus.js';
import { Logger } from '../utils/logger.js';
import { ConfigService } from '../config/config-service.js';

let attemptsForCurrentLesson = 0;
let hintsUsedForCurrentLesson = 0;
let hasEmittedCompletionForCurrentLesson = false;

/**
 * RunOrchestrator
 * Orchestrates a single "Run" click: get code from the Editor -> resolve
 * the track's Execution Adapter -> run it -> translate any error ->
 * render console output -> grade against the lesson's test cases ->
 * render pass/fail feedback -> emit lesson:completed on first full pass.
 */
export const RunOrchestrator = {
  resetSession() {
    attemptsForCurrentLesson = 0;
    hintsUsedForCurrentLesson = 0;
    hasEmittedCompletionForCurrentLesson = false;
  },

  trackHintRevealed() {
    hintsUsedForCurrentLesson += 1;
  },

  async run({ trackId, lesson, code, lessonPaneEl }) {
    attemptsForCurrentLesson += 1;
    ConsolePanel.setBusy(true);
    EditorPanel.clearErrorMarkers();

    const timeoutMs = ConfigService.getAppConfig().execution.timeoutMs;

    let result;
    try {
      result = await ExecutionEngine.run(trackId, code, { timeoutMs });
    } catch (err) {
      Logger.error('RunOrchestrator: execution adapter threw unexpectedly', err);
      result = { stdout: '', stderr: '', error: { type: 'RuntimeError', message: String(err) }, variables: {} };
    }

    ConsolePanel.setBusy(false);

    await ErrorTranslator.load();
    const translatedError = result.error ? ErrorTranslator.translate(result.error) : null;

    if (translatedError && translatedError.line) {
      EditorPanel.setErrorMarker(translatedError.line, translatedError.friendlyMessage);
    }

    ConsolePanel.render({ stdout: result.stdout, translatedError });

    const evaluation = LessonValidatorEngine.evaluate(lesson, result);
    LessonViewer.renderTestResults(lessonPaneEl, evaluation);

    if (evaluation.passed && !hasEmittedCompletionForCurrentLesson) {
      hasEmittedCompletionForCurrentLesson = true;
      eventBus.emit('lesson:completed', {
        trackId,
        lessonId: lesson.id,
        hintsUsed: hintsUsedForCurrentLesson,
        attempts: attemptsForCurrentLesson
      });
    }

    return { result, evaluation };
  }
};

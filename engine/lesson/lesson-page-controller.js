import { LessonEngine } from './lesson-engine.js';
import { LessonNavBinder } from './lesson-nav-binder.js';
import { LessonViewer } from '../../components/lesson-viewer/lesson-viewer.js';
import { EditorPanel } from '../../components/editor-panel/editor-panel.js';
import { ConsolePanel } from '../../components/console-panel/console-panel.js';
import { createWorkspaceLayout } from '../../components/workspace/workspace-layout.js';
import { Breadcrumb } from '../../components/breadcrumb/breadcrumb.js';
import { RunOrchestrator } from '../execution/run-orchestrator.js';
import { ProgressService } from '../progress/progress-service.js';
import { ConfigService } from '../config/config-service.js';
import { Header } from '../../components/header/header.js';
import { Router } from '../router/router.js';
import { eventBus } from '../events/event-bus.js';
import { Logger } from '../utils/logger.js';
import { createEl, empty } from '../utils/dom-utils.js';

let unsubscribeHint = null;

/**
 * TrackEntryController
 * PageController for "/track/:trackId". Binds the sidebar to the track's
 * manifest, then resolves where the learner should land: their
 * last-accessed lesson if any progress exists, otherwise the first lesson
 * in the manifest (Task 7.6 — resume-where-you-left-off).
 */
export const TrackEntryController = {
  async mount(container, params) {
    const { trackId } = params;
    const track = ConfigService.getTrackById(trackId);
    if (!track || track.status !== 'active') {
      Router.navigate('/');
      return;
    }

    Header.setTrack(track);
    const manifest = await LessonNavBinder.bindTrack(trackId);

    const lastLessonId = ProgressService.getLastAccessedLesson(trackId);
    const firstLessonId = manifest.modules[0]?.lessons[0]?.id;
    const targetLessonId = lastLessonId || firstLessonId;

    if (targetLessonId) {
      Router.navigate(`/track/${trackId}/lesson/${targetLessonId}`);
    } else {
      container.appendChild(createEl('p', { text: 'This track has no lessons yet.' }));
    }
  },
  unmount() {}
};

/**
 * LessonPageController
 * PageController for "/track/:trackId/lesson/:lessonId". Owns the full
 * workspace: lesson content, editor, console, and the Run round trip.
 */
export const LessonPageController = {
  async mount(container, params) {
    const { trackId, lessonId } = params;
    const track = ConfigService.getTrackById(trackId);
    if (!track || track.status !== 'active') {
      Router.navigate('/');
      return;
    }

    Header.setTrack(track);

    if (!LessonNavBinder.getManifest()) {
      await LessonNavBinder.bindTrack(trackId);
    }

    let lesson;
    try {
      lesson = await LessonEngine.loadLesson(trackId, lessonId);
    } catch (err) {
      Logger.error('LessonPageController: failed to load lesson', err);
      container.appendChild(
        createEl('div', {
          attrs: { class: 'luc-lesson-error' },
          children: [
            createEl('h2', { text: "We couldn't find that lesson." }),
            createEl('a', { attrs: { href: `#/track/${trackId}` }, text: '← Back to lesson list' })
          ]
        })
      );
      return;
    }

    ProgressService.setLastAccessedLesson(trackId, lessonId);
    RunOrchestrator.resetSession();

    const { root, lessonPane, editorPane, consolePane } = createWorkspaceLayout();
    empty(container);
    container.appendChild(root);

    const adapter = LessonEngine.getAdapter(trackId);
    LessonViewer.render(lessonPane, lesson, {
      adapter,
      onHintRevealed: () => RunOrchestrator.trackHintRevealed()
    });

    ConsolePanel.mount(consolePane);
    ConsolePanel.render({ stdout: '', translatedError: null });

    const meta = LessonNavBinder.findLessonMeta(lessonId);
    Breadcrumb.render([
      { label: track.displayName, href: `#/track/${trackId}` },
      ...(meta?.moduleTitle ? [{ label: meta.moduleTitle }] : []),
      { label: lesson.title }
    ]);

    await EditorPanel.mount(editorPane, {
      trackId,
      lessonId,
      starterCode: adapter.getStarterCode(lesson),
      onRunRequested: (code) =>
        RunOrchestrator.run({ trackId, lesson, code, lessonPaneEl: lessonPane }),
      onReset: () => Logger.info('Editor reset to starter code')
    });

    if (unsubscribeHint) unsubscribeHint();
    unsubscribeHint = eventBus.on('lesson:hintRevealed', () => {
      // hint tracking handled inline via onHintRevealed above; kept as an
      // extension point for future analytics/achievements consumers.
    });
  },

  unmount() {
    EditorPanel.dispose();
    if (unsubscribeHint) {
      unsubscribeHint();
      unsubscribeHint = null;
    }
  }
};

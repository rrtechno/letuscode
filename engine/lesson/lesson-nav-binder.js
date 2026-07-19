import { Sidebar } from '../../components/sidebar/sidebar.js';
import { LessonEngine } from './lesson-engine.js';
import { ProgressService } from '../progress/progress-service.js';
import { Router } from '../router/router.js';
import { eventBus } from '../events/event-bus.js';

let currentTrackId = null;
let currentManifest = null;
let unsubscribeProgress = null;

/**
 * LessonNavBinder
 * Fetches the active track's manifest, maps it into Sidebar's expected
 * item shape (with completion checkmarks from ProgressService), and keeps
 * the sidebar's active-item highlight in sync with the router.
 */
export const LessonNavBinder = {
  async bindTrack(trackId) {
    currentTrackId = trackId;
    currentManifest = await LessonEngine.loadManifest(trackId);
    renderSidebar();

    if (unsubscribeProgress) unsubscribeProgress();
    unsubscribeProgress = eventBus.on('progress:updated', (payload) => {
      if (payload.trackId === currentTrackId) renderSidebar();
    });

    Sidebar.onSelect((lessonId) => {
      Router.navigate(`/track/${currentTrackId}/lesson/${lessonId}`);
    });

    eventBus.on('route:changed', ({ params }) => {
      if (params.lessonId) Sidebar.setActiveItem(params.lessonId);
    });

    return currentManifest;
  },

  getManifest() {
    return currentManifest;
  },

  findLessonMeta(lessonId) {
    if (!currentManifest) return null;
    for (const module of currentManifest.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson) return { ...lesson, moduleTitle: module.title };
    }
    return null;
  },

  getTotalLessonCount() {
    if (!currentManifest) return 0;
    return currentManifest.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  }
};

function renderSidebar() {
  const progress = ProgressService.getTrackProgress(currentTrackId);
  const items = [];
  currentManifest.modules.forEach((module) => {
    items.push({ type: 'module', label: module.title });
    module.lessons.forEach((lesson) => {
      items.push({
        type: 'lesson',
        id: lesson.id,
        label: lesson.title,
        href: `#/track/${currentTrackId}/lesson/${lesson.id}`,
        complete: progress.completedLessonIds.includes(lesson.id)
      });
    });
  });
  Sidebar.renderItems(items);
}

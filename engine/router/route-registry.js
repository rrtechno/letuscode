import { Router } from './router.js';
import { TrackSelectorPage } from '../../components/track-selector/track-selector.js';
import { TrackEntryController, LessonPageController } from '../lesson/lesson-page-controller.js';
import { ProgressDashboardPage } from '../../components/progress-dashboard/progress-dashboard.js';
import { createEl } from '../utils/dom-utils.js';

const NotFoundController = {
  mount(container) {
    container.appendChild(
      createEl('div', {
        attrs: { class: 'luc-not-found' },
        children: [
          createEl('h1', { text: "Hmm, that page doesn't exist." }),
          createEl('a', { attrs: { href: '#/' }, text: '← Back to tracks' })
        ]
      })
    );
  },
  unmount() {}
};

/**
 * registerRoutes
 * Single place enumerating every route -> PageController mapping. Every
 * controller implements { mount(container, params), unmount() } per
 * /docs/page-controller-contract.md (see execution plan).
 */
export function registerRoutes() {
  Router.register('/', TrackSelectorPage);
  Router.register('/progress', ProgressDashboardPage);
  Router.register('/track/:trackId', TrackEntryController);
  Router.register('/track/:trackId/lesson/:lessonId', LessonPageController);
  Router.registerNotFound(NotFoundController);
}

import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { ConfigService } from '../../engine/config/config-service.js';
import { ProgressService } from '../../engine/progress/progress-service.js';
import { LessonEngine } from '../../engine/lesson/lesson-engine.js';

let mountedEl = null;

export const ProgressDashboardPage = {
  async mount(container) {
    mountedEl = createEl('div', { attrs: { class: 'luc-progress-dash' } });
    mountedEl.appendChild(createEl('h1', { text: 'Your progress' }));

    const activeTracks = ConfigService.getActiveTracks();
    const grid = createEl('div', { attrs: { class: 'luc-progress-dash__grid' } });
    mountedEl.appendChild(grid);
    container.appendChild(mountedEl);

    if (activeTracks.length === 0) {
      grid.appendChild(createEl('p', { text: 'No tracks are available yet.' }));
      return;
    }

    let anyProgress = false;

    for (const track of activeTracks) {
      let totalLessons = 0;
      try {
        const manifest = await LessonEngine.loadManifest(track.id);
        totalLessons = manifest.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      } catch {
        // If a manifest fails to load we still show the card with 0/0.
      }

      const trackProgress = ProgressService.getTrackProgress(track.id);
      const completedCount = trackProgress.completedLessonIds.length;
      if (completedCount > 0) anyProgress = true;
      const percent = ProgressService.getPercentComplete(track.id, totalLessons);

      grid.appendChild(
        createEl('div', {
          attrs: { class: 'luc-progress-card' },
          children: [
            createEl('div', {
              attrs: { class: 'luc-progress-card__title' },
              text: `${track.icon} ${track.displayName}`
            }),
            createEl('div', {
              attrs: { class: 'luc-progress-card__bar-track' },
              children: [
                createEl('div', {
                  attrs: { class: 'luc-progress-card__bar-fill', style: `width:${percent}%` }
                })
              ]
            }),
            createEl('div', {
              attrs: { class: 'luc-progress-card__count' },
              text: `${completedCount} / ${totalLessons} lessons complete (${percent}%)`
            })
          ]
        })
      );
    }

    if (!anyProgress) {
      mountedEl.appendChild(
        createEl('p', {
          attrs: { class: 'luc-progress-dash__empty' },
          text: "You haven't finished a lesson yet — pick a track and give it a try!"
        })
      );
    }
  },

  unmount() {
    if (mountedEl) empty(mountedEl);
    mountedEl = null;
  }
};

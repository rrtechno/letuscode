import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { ConfigService } from '../../engine/config/config-service.js';
import { Router } from '../../engine/router/router.js';
import { ProgressService } from '../../engine/progress/progress-service.js';

let mountedEl = null;

/**
 * TrackSelectorPage
 * PageController for "/" — one tile per track in tracks.json. Active
 * tracks navigate to the track's lesson list; comingSoon tracks render
 * disabled. This is the proof point that new tracks register with zero
 * engine changes (Epic 9.7 in the plan).
 */
export const TrackSelectorPage = {
  async mount(container) {
    mountedEl = createEl('div', { attrs: { class: 'luc-track-select' } });

    mountedEl.appendChild(
      createEl('h1', { attrs: { class: 'luc-track-select__heading' }, text: 'Pick a track to start coding' })
    );

    const grid = createEl('div', { attrs: { class: 'luc-track-select__grid' } });
    const tracks = ConfigService.getTracks();

    tracks.forEach((track) => {
      const isActive = track.status === 'active';
      const progress = isActive ? ProgressService.getTrackProgress(track.id) : null;
      const hasProgress = progress && progress.completedLessonIds.length > 0;

      const card = createEl(isActive ? 'a' : 'div', {
        attrs: {
          class: `luc-track-card ${isActive ? '' : 'is-disabled'}`,
          ...(isActive ? { href: `#/track/${track.id}` } : { 'aria-disabled': 'true' })
        },
        children: [
          createEl('span', { attrs: { class: 'luc-track-card__icon' }, text: track.icon }),
          createEl('h2', { attrs: { class: 'luc-track-card__title' }, text: track.displayName }),
          createEl('p', { attrs: { class: 'luc-track-card__tagline' }, text: track.tagline }),
          createEl('span', {
            attrs: { class: 'luc-track-card__status' },
            text: isActive ? (hasProgress ? 'Continue →' : 'Start →') : 'Coming soon'
          })
        ]
      });
      grid.appendChild(card);
    });

    mountedEl.appendChild(grid);
    container.appendChild(mountedEl);
  },

  unmount() {
    if (mountedEl) empty(mountedEl);
    mountedEl = null;
  }
};

// Kept for symmetry with other "component" imports even though this module
// doubles as a page controller for the home route.
export function navigateToTrack(trackId) {
  Router.navigate(`/track/${trackId}`);
}

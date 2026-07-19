import { createEl, empty } from '../../engine/utils/dom-utils.js';
import { AchievementEngine } from '../../engine/achievements/achievement-engine.js';

let mountedEl = null;

export const AchievementsGalleryPage = {
  async mount(container) {
    mountedEl = createEl('div', { attrs: { class: 'luc-achievements' } });
    mountedEl.appendChild(createEl('h1', { text: 'Achievements' }));

    const grid = createEl('div', { attrs: { class: 'luc-achievements__grid' } });
    mountedEl.appendChild(grid);
    container.appendChild(mountedEl);

    const all = await AchievementEngine.getAllWithStatus();

    all.forEach((a) => {
      grid.appendChild(
        createEl('div', {
          attrs: { class: `luc-achievement-card ${a.earned ? 'is-earned' : 'is-locked'}` },
          children: [
            createEl('span', { attrs: { class: 'luc-achievement-card__icon' }, text: a.icon }),
            createEl('h2', { attrs: { class: 'luc-achievement-card__title' }, text: a.title }),
            createEl('p', { attrs: { class: 'luc-achievement-card__desc' }, text: a.description }),
            createEl('span', {
              attrs: { class: 'luc-achievement-card__status' },
              text: a.earned ? `Earned ${new Date(a.earnedAt).toLocaleDateString()}` : 'Locked'
            })
          ]
        })
      );
    });
  },

  unmount() {
    if (mountedEl) empty(mountedEl);
    mountedEl = null;
  }
};

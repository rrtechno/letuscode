import { ContentAdapterInterface } from '../_interface/content-adapter.interface.js';

const MANIFEST_URL = '/content/python/manifest.json';

/**
 * PythonContentAdapter
 * Thin fetch wrapper over /content/python/*. This is the reference
 * implementation of ContentAdapterInterface — a second track's adapter
 * should look structurally identical, just pointed at its own folder.
 */
export class PythonContentAdapter extends ContentAdapterInterface {
  async loadManifest() {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(`PythonContentAdapter: manifest fetch failed (${res.status})`);
    return res.json();
  }

  async loadLesson(lessonId) {
    const manifest = await this.loadManifest();
    const entry = findLessonEntry(manifest, lessonId);
    if (!entry) throw new Error(`PythonContentAdapter: unknown lesson id "${lessonId}"`);

    const res = await fetch(entry.path);
    if (!res.ok) throw new Error(`PythonContentAdapter: lesson fetch failed (${res.status})`);
    return res.json();
  }

  getStarterCode(lesson) {
    return lesson.starterCode || '# Write your code below\n';
  }
}

function findLessonEntry(manifest, lessonId) {
  for (const module of manifest.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

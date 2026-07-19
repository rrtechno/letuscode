/**
 * ContentAdapter (interface)
 *
 * Every learning track (python, ai, streamlit, data-science, cloud, ...)
 * implements this contract. The Lesson Engine (engine/lesson/lesson-engine.js)
 * only ever calls through this interface — it never imports a concrete
 * track adapter directly. New tracks register themselves in
 * /config/tracks.json and drop a conforming implementation under
 * /adapters/content/<trackId>/ — no engine code changes required.
 */
export class ContentAdapterInterface {
  /** @returns {Promise<{modules: Array<{id, title, lessons: Array<{id, title}>}>}>} */
  async loadManifest() {
    throw new Error('ContentAdapter.loadManifest() not implemented');
  }

  /** @param {string} lessonId @returns {Promise<object>} a lesson object conforming to lesson.schema.md */
  async loadLesson(lessonId) {
    throw new Error('ContentAdapter.loadLesson() not implemented');
  }

  /**
   * Renders a single content block. Return a DOM Node, or `null` to let the
   * engine fall back to its generic renderer for well-known block types
   * (paragraph/heading/code-sample/tip/image). Only needed for
   * track-specific block types.
   * @param {object} block
   * @returns {Node|null}
   */
  renderContentBlock(block) {
    return null;
  }

  /** @param {object} lesson @returns {string} starter code to seed the editor with */
  getStarterCode(lesson) {
    return lesson.starterCode || '';
  }
}

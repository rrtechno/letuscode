/**
 * ExecutionAdapter (interface)
 *
 * Every track's runtime (Pyodide for Python, something else entirely for
 * a future track) implements this contract and returns a *normalized*
 * result shape so the track-agnostic LessonValidatorEngine
 * (engine/lesson/lesson-validator-engine.js) can grade any track's code
 * the same way.
 */
export class ExecutionAdapterInterface {
  /**
   * @param {string} code
   * @param {{timeoutMs?: number}} [options]
   * @returns {Promise<{stdout:string, stderr:string, error:{type:string,message:string,line?:number}|null, variables:object}>}
   */
  async run(code, options = {}) {
    throw new Error('ExecutionAdapter.run() not implemented');
  }
}

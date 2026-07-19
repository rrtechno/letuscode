import { ConfigService } from '../config/config-service.js';
import { PythonExecutionAdapter } from '../../adapters/execution/python/python-execution-adapter.js';

/**
 * Registry mapping a track's `executionAdapter` id to a concrete adapter
 * instance — the execution-side counterpart of lesson-engine.js's
 * ADAPTERS map. Adding a track's runtime means one line here plus its
 * adapter module.
 */
const ADAPTERS = {
  python: new PythonExecutionAdapter()
};

export const ExecutionEngine = {
  resolveAdapter(trackId) {
    const track = ConfigService.getTrackById(trackId);
    if (!track) throw new Error(`ExecutionEngine: unknown track "${trackId}"`);
    if (!track.executionAdapter || !ADAPTERS[track.executionAdapter]) {
      throw new Error(`ExecutionEngine: no execution adapter registered for track "${trackId}"`);
    }
    return ADAPTERS[track.executionAdapter];
  },

  async run(trackId, code, options) {
    const adapter = this.resolveAdapter(trackId);
    return adapter.run(code, options);
  }
};

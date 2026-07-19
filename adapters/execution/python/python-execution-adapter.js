import { ExecutionAdapterInterface } from '../_interface/execution-adapter.interface.js';
import { PyodideLoader } from './pyodide-loader.js';

/**
 * PythonExecutionAdapter
 *
 * Runs learner code through Pyodide, redirecting stdout/stderr via a
 * Python-side contextlib wrapper (portable across Pyodide versions,
 * unlike relying on pyodide.setStdout callbacks), and mapping uncaught
 * Python exceptions into the normalized ExecutionAdapter result shape.
 *
 * KNOWN LIMITATION (documented, not silently hidden): Pyodide executes on
 * the main thread in this build. A genuine hard-kill of a runaway
 * `while True:` loop requires running the interpreter in a Web Worker
 * with a SharedArrayBuffer interrupt buffer, which in turn requires
 * cross-origin-isolation headers GitHub Pages does not let us set. The
 * timeout below therefore bounds how long we *wait and report*, not how
 * long the tab may still be busy underneath. This is flagged as a
 * follow-up (see Epic 6, Task 6.4 in the execution plan) rather than
 * pretended away.
 */
export class PythonExecutionAdapter extends ExecutionAdapterInterface {
  async run(code, options = {}) {
    const timeoutMs = options.timeoutMs || 8000;
    const pyodide = await PyodideLoader.ready();

    const runPromise = this._runInPyodide(pyodide, code);
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            stdout: '',
            stderr: '',
            error: { type: 'TimeoutError', message: 'Your code took too long to run.' },
            variables: {}
          }),
        timeoutMs
      );
    });

    return Promise.race([runPromise, timeoutPromise]);
  }

  async _runInPyodide(pyodide, userCode) {
    // Wrap the learner's code so we can capture stdout/stderr and any
    // exception without letting a Python-level crash bubble up as a JS
    // exception (which would be much harder to turn into a friendly
    // message).
    const harness = `
import sys, io, json, contextlib, traceback

__luc_stdout = io.StringIO()
__luc_stderr = io.StringIO()
__luc_error = None

with contextlib.redirect_stdout(__luc_stdout), contextlib.redirect_stderr(__luc_stderr):
    try:
        exec(compile(${JSON.stringify(userCode)}, "<learner_code>", "exec"), globals())
    except Exception as e:
        tb = traceback.extract_tb(e.__traceback__)
        line = tb[-1].lineno if tb else None
        __luc_error = {"type": type(e).__name__, "message": str(e), "line": line}

def __luc_collect_vars():
    safe = {}
    for name, value in list(globals().items()):
        if name.startswith("_") or name.startswith("__luc"):
            continue
        if callable(value) or isinstance(value, type(sys)):
            continue
        try:
            json.dumps(value)
            safe[name] = value
        except TypeError:
            safe[name] = str(value)
    return safe

__luc_variables = __luc_collect_vars()
json.dumps({
    "stdout": __luc_stdout.getvalue(),
    "stderr": __luc_stderr.getvalue(),
    "error": __luc_error,
    "variables": __luc_variables
})
`;

    const resultJson = await pyodide.runPythonAsync(harness);
    return JSON.parse(resultJson);
  }
}

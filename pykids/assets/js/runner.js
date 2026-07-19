let pyodideReadyPromise = null;

function loadPyodideOnce() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

async function runKidCode(textareaId, outputId, statusId, buttonId) {
  const code = document.getElementById(textareaId).value;
  const output = document.getElementById(outputId);
  const status = document.getElementById(statusId);
  const btn = document.getElementById(buttonId);

  btn.disabled = true;
  status.textContent = "Starting Python…";
  output.textContent = "";

  try {
    const pyodide = await loadPyodideOnce();
    status.textContent = "Running…";

    // Capture print() output
    pyodide.setStdout({ batched: (s) => { output.textContent += s + "\n"; } });
    pyodide.setStderr({ batched: (s) => { output.textContent += "⚠️ " + s + "\n"; } });

    await pyodide.runPythonAsync(code);
    status.textContent = "Done ✅";
  } catch (err) {
    output.textContent += "\n" + friendlyError(err.message);
    status.textContent = "Oops, try again 🙂";
  } finally {
    btn.disabled = false;
  }
}

function friendlyError(msg) {
  if (msg.includes("SyntaxError")) return "Hmm, there's a typo in your code. Check spelling, colons ':' and quotes.";
  if (msg.includes("NameError")) return "Python doesn't recognize a word you used. Did you spell a variable name correctly?";
  if (msg.includes("IndentationError")) return "Check your spacing — Python cares about indents (usually 4 spaces).";
  return msg;
}

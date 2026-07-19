# Let Us Code

A browser-based coding platform for kids, starting with Python. Static site,
no build tools, no backend — plain ES modules, Monaco, and Pyodide loaded
from CDN, content driven entirely by JSON.

## Run it locally

Because this uses native ES modules and `fetch()` for JSON content, it must
be served over HTTP (not opened directly as a `file://` URL). From this
folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## What's implemented (Epics 1–7 of the execution plan)

- **Foundation** — config loading, event bus, localStorage wrapper, logging.
- **Layout** — app shell, header, sidebar, modal, design tokens.
- **Navigation** — hash-based router, track selector, breadcrumbs.
- **Lesson Engine** — JSON-driven lessons behind a pluggable Content Adapter.
- **Editor** — Monaco, themed, with per-lesson autosave and font controls.
- **Python Runtime** — Pyodide behind a pluggable Execution Adapter, with
  kid-friendly error translation.
- **Progress** — per-track completion tracking, sidebar checkmarks,
  resume-where-you-left-off, a simple progress dashboard.

Content: one real module (`content/python/module-01`) with three lessons —
enough to exercise the full pipeline end to end.

Not yet built (intentionally, per current scope): Achievements (Epic 8),
authored content beyond Module 1, deployment/CI configuration, and the
formal test suite / documentation set from Epics 10–12, which were
descoped from this build pass.

## Architecture notes

- `/engine` never imports a concrete track adapter directly — it only
  talks to `ContentAdapterInterface` / `ExecutionAdapterInterface`.
  `/adapters/content/python` and `/adapters/execution/python` are the
  reference implementations proving that contract.
- Adding a second track requires: one entry in `config/tracks.json`, a new
  `/adapters/content/<track>/`, a new (or reused) `/adapters/execution/<track>/`,
  and `/content/<track>/` lesson files — zero changes to `/engine`.

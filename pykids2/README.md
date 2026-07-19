# PyKids 🐍 — Config-Driven Learning Framework

A free, browser-based coding course for kids. Python runs in-browser via
[Pyodide](https://pyodide.org) — no installs, no backend, hosted free on
GitHub Pages. **Content lives entirely in JSON** — the HTML/JS is a generic
renderer that never needs to change when you add lessons or tracks.

## How it fits together

```
config/site.config.json          ← MASTER FILE. Registers every track.
tracks/<track-id>.track.json     ← One file per track. Lists its lessons in order.
lessons/<track-id>/<lesson-id>.json  ← One file per lesson. List of content "blocks".

index.html   → renders track list, reading config/site.config.json
track.html   → renders a track's lesson list, reading tracks/<id>.track.json
lesson.html  → renders a lesson's content, reading lessons/<track>/<lesson>.json

assets/js/app.js     → generic renderer (fetches JSON, builds the DOM)
assets/js/runner.js  → Pyodide code execution engine
assets/css/style.css → shared design system
```

Nothing in `app.js` knows about "Lesson 3" or "Level 2" — it just walks
whatever JSON it's given. That's what makes this scalable.

## Adding a new lesson (existing track)
1. Create `lessons/python-basics/lesson7.json` (copy an existing lesson as a template).
2. Add one line to `tracks/python-basics.track.json`'s `"lessons"` array.
3. Done — no HTML/JS changes.

### Lesson JSON schema
```json
{
  "id": "lesson7",
  "track": "python-basics",
  "title": "Your Lesson Title",
  "blocks": [
    { "type": "concept",   "html": "Explain a concept here. Basic HTML allowed." },
    { "type": "code",      "id": "code1", "starter": "print('hi')", "runnable": true },
    { "type": "challenge", "html": "A task for the kid to try." }
  ]
}
```
**Block types currently supported:**
| type | purpose |
|---|---|
| `concept` | Text/explanation box |
| `code` | Runnable code editor (executed via the track's `engine`) |
| `challenge` | Highlighted "try this yourself" box |
| `app-embed` | Embeds an external URL in an iframe (for hosted Streamlit apps, etc.) |

Adding a new block type = add one `case` to `renderBlock()` in `app.js`.

## Adding a brand-new track (e.g. Streamlit, AI)
1. Create `tracks/python-streamlit.track.json`:
   ```json
   { "id": "python-streamlit", "title": "Build Apps with Streamlit",
     "description": "...", "engine": "iframe-app", "lessons": [] }
   ```
2. Create its lesson JSON files (as above — use `app-embed` blocks to embed
   a hosted Streamlit app, since Streamlit needs a Python server and can't
   run purely client-side like Pyodide).
3. Add one entry to `config/site.config.json`'s `"tracks"` array, with
   `"status": "active"` when ready to launch.

That's the entire process — **one master file, one track file, N lesson
files.** No page templates to duplicate.

### The `engine` field (per track)
- `"pyodide"` — code blocks run live in-browser (current default)
- `"iframe-app"` — for tracks whose interactivity is hosted elsewhere (Streamlit Cloud, etc.); code blocks are skipped and `app-embed` blocks are used instead
- Future engines (e.g. a Jupyter-lite kernel, a hosted AI API) just need a case added to `renderCodeBlock()` in `app.js`

## Run locally
```
python3 -m http.server
```
then visit `localhost:8000`. (Must be served over HTTP — `fetch()` of local
JSON files fails when opening `index.html` directly via `file://`.)

## Deploy on GitHub Pages
1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: `main` branch, `/root`.
3. Live at `https://<username>.github.io/<repo>/`.

## Roadmap
- [x] Python Basics track (6 lessons) — config-driven
- [x] Reusable framework: master config + track JSON + lesson JSON
- [ ] Streamlit track (needs a hosted Streamlit backend, e.g. Streamlit Community Cloud)
- [ ] AI for Kids track
- [ ] Progress tracking (localStorage → optional login) + lesson lock/unlock
- [ ] Badges / achievements
- [ ] Advanced Python track (files, classes, error handling)

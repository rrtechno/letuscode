# PyKids 🐍 — Learn Python, Step by Step

A free, browser-based Python course for kids (age 10+). No installs needed —
Python runs directly in the browser via [Pyodide](https://pyodide.org).

## Structure
```
pykids/
├── index.html          # Course map (landing page)
├── lessons/
│   └── lesson1.html     # Level 1: print(), variables
├── assets/
│   ├── css/style.css    # Design system
│   └── js/runner.js     # Pyodide code runner
└── README.md
```

## Run locally
Just open `index.html` in a browser (or use `python -m http.server` and visit
`localhost:8000`).

## Deploy on GitHub Pages
1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: `main` branch, `/root`.
3. Site goes live at `https://<username>.github.io/<repo>/`.

## Adding a new lesson
Copy `lessons/lesson1.html`, update the concept text, starter code, and
challenge box. Add a new `.level-card` link in `index.html` and remove
`locked` from the next level's card.

## Roadmap
- [x] Level 1 — Say Hello to Python
- [ ] Level 2 — if / else
- [ ] Level 3 — loops
- [ ] Level 4 — lists & dictionaries
- [ ] Level 5 — functions
- [ ] Level 6 — mini projects
- [ ] Progress tracking (localStorage → optional login)
- [ ] Badges / achievements

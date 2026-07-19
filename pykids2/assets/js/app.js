// ---------- utilities ----------
async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return res.json();
}

function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// ---------- HOME PAGE (index.html) ----------
async function renderHomePage() {
  const config = await loadJSON("config/site.config.json");
  document.getElementById("site-title").textContent = config.site_name;
  document.getElementById("site-tagline").textContent = config.tagline;

  const wrap = document.getElementById("track-list");

  for (const track of config.tracks) {
    const locked = track.status !== "active";
    const card = el("a", `track-card ${locked ? "locked" : ""}`);
    card.href = locked ? "#" : `track.html?track=${track.id}`;

    let progressHtml = "";
    if (!locked) {
      const trackData = await loadJSON(track.file);
      const { completed, total } = trackProgressSummary(track.id, trackData.lessons);
      if (total > 0) {
        progressHtml = `<div class="mini-progress">
          <div class="mini-progress-bar"><div class="mini-progress-fill" style="width:${(completed / total) * 100}%"></div></div>
          <span>${completed} / ${total} lessons</span>
        </div>`;
      }
    }

    card.innerHTML = `
      <div class="track-icon track-${track.color}">${track.icon}</div>
      <div class="track-info">
        <h3>${track.title} ${locked ? '<span class="badge-soon">Coming soon</span>' : ""}</h3>
        <p>${track.description}</p>
        ${progressHtml}
      </div>`;
    wrap.appendChild(card);
  }

  const resetLink = el("a", "reset-link", "Reset my progress");
  resetLink.href = "#";
  resetLink.onclick = (e) => {
    e.preventDefault();
    if (confirm("This clears all your completed lessons on this device. Continue?")) {
      resetAllProgress();
      location.reload();
    }
  };

  const [badgesConfig, summaries] = await Promise.all([loadBadgesConfig(), getAllTrackSummaries()]);
  const earned = computeEarnedBadgeIds(badgesConfig, summaries);
  const badgesLink = el("a", "badges-link",
    `🏅 ${earned.size} / ${badgesConfig.badges.length} badges earned`);
  badgesLink.href = "badges.html";

  document.getElementById("track-list").after(resetLink);
  document.getElementById("track-list").after(badgesLink);
}

// ---------- TRACK PAGE (track.html?track=ID) ----------
async function renderTrackPage() {
  const trackId = qs("track");
  const config = await loadJSON("config/site.config.json");
  const trackMeta = config.tracks.find((t) => t.id === trackId);
  if (!trackMeta) {
    document.getElementById("track-content").innerHTML = "<p>Track not found.</p>";
    return;
  }
  const track = await loadJSON(trackMeta.file);

  document.getElementById("site-title").textContent = config.site_name;
  document.getElementById("track-title").textContent = track.title;
  document.getElementById("track-desc").textContent = track.description;

  const wrap = document.getElementById("lesson-list");
  if (track.lessons.length === 0) {
    wrap.innerHTML = `<p class="empty-note">Lessons for this track are coming soon — check back later! 🚧</p>`;
    return;
  }

  track.lessons.forEach((lesson, i) => {
    const complete = isLessonComplete(trackId, lesson.id);
    const unlocked = isLessonUnlocked(trackId, track.lessons, i);
    const card = el("a", `level-card ${!unlocked ? "locked" : ""} ${complete ? "completed" : ""}`);
    card.href = unlocked ? `lesson.html?track=${trackId}&lesson=${lesson.id}` : "#";
    card.innerHTML = `
      <div class="level-badge">${complete ? "✓" : (unlocked ? i + 1 : "🔒")}</div>
      <div class="level-info">
        <h3>${lesson.title}</h3>
        <p>${lesson.summary || ""}</p>
      </div>`;
    wrap.appendChild(card);
  });
}

// ---------- LESSON PAGE (lesson.html?track=ID&lesson=ID) ----------
async function renderLessonPage() {
  const trackId = qs("track");
  const lessonId = qs("lesson");

  const config = await loadJSON("config/site.config.json");
  const trackMeta = config.tracks.find((t) => t.id === trackId);
  const track = await loadJSON(trackMeta.file);
  const lessonMeta = track.lessons.find((l) => l.id === lessonId);
  const lesson = await loadJSON(lessonMeta.file);

  document.getElementById("site-title").textContent = config.site_name;
  document.getElementById("lesson-eyebrow").textContent = track.title;
  document.getElementById("lesson-title").textContent = lesson.title;

  const body = document.getElementById("lesson-body");
  let codeCounter = 0;

  lesson.blocks.forEach((block) => {
    body.appendChild(renderBlock(block, track.engine, () => ++codeCounter));
  });

  // prev/next nav
  const idx = track.lessons.findIndex((l) => l.id === lessonId);
  const prev = track.lessons[idx - 1];
  const next = track.lessons[idx + 1];

  const alreadyDone = isLessonComplete(trackId, lessonId);
  const completeBox = el("div", "complete-row");
  const completeBtn = el("button", `btn-complete ${alreadyDone ? "done" : ""}`,
    alreadyDone ? "✅ Completed" : "Mark Complete ✓");
  completeBtn.onclick = async () => {
    const badgesConfig = await loadBadgesConfig();
    const before = computeEarnedBadgeIds(badgesConfig, await getAllTrackSummaries());

    markLessonComplete(trackId, lessonId);

    const after = computeEarnedBadgeIds(badgesConfig, await getAllTrackSummaries());
    const newBadgeIds = [...after].filter((id) => !before.has(id));
    const newBadges = badgesConfig.badges.filter((b) => newBadgeIds.includes(b.id));

    const goNext = () => {
      if (next) {
        window.location.href = `lesson.html?track=${trackId}&lesson=${next.id}`;
      } else {
        window.location.href = `track.html?track=${trackId}`;
      }
    };

    if (newBadges.length > 0) {
      newBadges.forEach((b, i) => setTimeout(() => showBadgeToast(b), i * 400));
      setTimeout(goNext, 1600 + newBadges.length * 400);
    } else {
      goNext();
    }
  };
  completeBox.appendChild(completeBtn);
  body.appendChild(completeBox);

  const navRow = document.getElementById("lesson-nav");
  navRow.innerHTML = `
    ${prev ? `<a href="lesson.html?track=${trackId}&lesson=${prev.id}">← ${prev.title}</a>` : `<a href="track.html?track=${trackId}">← Back to Track</a>`}
    ${next ? `<a href="lesson.html?track=${trackId}&lesson=${next.id}">${next.title} →</a>` : `<a href="track.html?track=${trackId}">Back to Track 🏁</a>`}
  `;
}

// ---------- block renderers (extensible: add a case for new block types) ----------
function renderBlock(block, engine) {
  switch (block.type) {
    case "concept":
      return el("div", "concept-box", `<p>${block.html}</p>`);

    case "challenge":
      return el("div", "challenge-box", `<h3>🌟 Challenge</h3><p>${block.html}</p>`);

    case "code":
      return renderCodeBlock(block, engine);

    case "app-embed":
      return el("div", "app-embed-box",
        `<iframe src="${block.url}" height="${block.height || 500}" style="width:100%;border:0;border-radius:12px;"></iframe>`);

    default:
      return el("div", "concept-box", `<p><em>Unsupported block type: ${block.type}</em></p>`);
  }
}

function renderCodeBlock(block, engine) {
  const wrapper = el("div");
  const outId = block.id + "_out";
  const statusId = block.id + "_status";
  const btnId = block.id + "_btn";

  wrapper.innerHTML = `
    <div class="editor-box">
      <textarea id="${block.id}" spellcheck="false">${escapeHtml(block.starter)}</textarea>
    </div>
    <div class="run-row">
      <button class="btn-run" id="${btnId}">▶ ${block.label || "Run Code"}</button>
      <span class="status" id="${statusId}"></span>
    </div>
    <div class="output-box" id="${outId}">Your output will show up here…</div>
  `;

  // Wire the run button after insertion (engine-specific — pyodide for now,
  // future engines like "iframe-app" simply skip runnable wiring)
  requestAnimationFrame(() => {
    const btn = document.getElementById(btnId);
    if (btn && engine === "pyodide") {
      btn.addEventListener("click", () =>
        runKidCode(block.id, outId, statusId, btnId)
      );
    }
  });

  return wrapper;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

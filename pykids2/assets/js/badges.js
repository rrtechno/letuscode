// ---------- Badges (config-driven achievements) ----------
// Rule types supported:
//   { "type": "lesson-count", "count": N }        → N lessons completed, any track(s)
//   { "type": "track-complete", "track": "<id>" } → every lesson in that track done
// Add new rule types by extending badgeIsEarned() below.

async function loadBadgesConfig() {
  return loadJSON("config/badges.config.json");
}

// Returns [{ id, total, completed }] for every ACTIVE track that has lessons.
async function getAllTrackSummaries() {
  const config = await loadJSON("config/site.config.json");
  const summaries = [];
  for (const track of config.tracks) {
    if (track.status !== "active") continue;
    const trackData = await loadJSON(track.file);
    if (trackData.lessons.length === 0) continue;
    const { completed, total } = trackProgressSummary(track.id, trackData.lessons);
    summaries.push({ id: track.id, title: trackData.title, completed, total });
  }
  return summaries;
}

function badgeIsEarned(badge, summaries) {
  const totalCompleted = summaries.reduce((sum, t) => sum + t.completed, 0);
  if (badge.rule.type === "lesson-count") {
    return totalCompleted >= badge.rule.count;
  }
  if (badge.rule.type === "track-complete") {
    const t = summaries.find((s) => s.id === badge.rule.track);
    return !!(t && t.total > 0 && t.completed >= t.total);
  }
  return false;
}

function computeEarnedBadgeIds(badgesConfig, summaries) {
  const earned = new Set();
  badgesConfig.badges.forEach((b) => {
    if (badgeIsEarned(b, summaries)) earned.add(b.id);
  });
  return earned;
}

// ---------- BADGES PAGE (badges.html) ----------
async function renderBadgesPage() {
  const config = await loadJSON("config/site.config.json");
  document.getElementById("site-title").textContent = config.site_name;

  const [badgesConfig, summaries] = await Promise.all([
    loadBadgesConfig(),
    getAllTrackSummaries(),
  ]);
  const earned = computeEarnedBadgeIds(badgesConfig, summaries);

  document.getElementById("badges-summary").textContent =
    `You've earned ${earned.size} of ${badgesConfig.badges.length} badges!`;

  const grid = document.getElementById("badge-grid");
  badgesConfig.badges.forEach((badge) => {
    const got = earned.has(badge.id);
    const card = el("div", `badge-card ${got ? "earned" : "locked"}`);
    card.innerHTML = `
      <div class="badge-icon">${got ? badge.icon : "🔒"}</div>
      <h3>${badge.title}</h3>
      <p>${badge.description}</p>`;
    grid.appendChild(card);
  });
}

// ---------- Toast (used by lesson.html when a new badge is earned) ----------
function showBadgeToast(badge) {
  const toast = el("div", "badge-toast",
    `<span class="badge-toast-icon">${badge.icon}</span>
     <div><strong>Badge earned!</strong><br>${badge.title}</div>`);
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

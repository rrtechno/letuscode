// ---------- Progress tracking (localStorage) ----------
// Schema: { "<trackId>": { "completedLessons": ["lesson1", "lesson2", ...] } }
const PROGRESS_KEY = "pykids-progress-v1";

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save progress:", e);
  }
}

function isLessonComplete(trackId, lessonId) {
  const data = loadProgress();
  return !!(data[trackId] && data[trackId].completedLessons.includes(lessonId));
}

function markLessonComplete(trackId, lessonId) {
  const data = loadProgress();
  if (!data[trackId]) data[trackId] = { completedLessons: [] };
  if (!data[trackId].completedLessons.includes(lessonId)) {
    data[trackId].completedLessons.push(lessonId);
  }
  saveProgress(data);
}

// First lesson is always unlocked. Every later lesson unlocks once the
// lesson immediately before it (in track order) is marked complete.
function isLessonUnlocked(trackId, lessons, index) {
  if (index === 0) return true;
  const prevLessonId = lessons[index - 1].id;
  return isLessonComplete(trackId, prevLessonId);
}

function trackProgressSummary(trackId, lessons) {
  const total = lessons.length;
  if (total === 0) return { completed: 0, total: 0 };
  const data = loadProgress();
  const completed = (data[trackId] && data[trackId].completedLessons.length) || 0;
  return { completed: Math.min(completed, total), total };
}

function resetAllProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    console.warn("Could not reset progress:", e);
  }
}

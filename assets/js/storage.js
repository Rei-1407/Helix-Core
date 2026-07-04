/* =========================================================================
   storage.js — Quản lý toàn bộ tiến độ học của người dùng.
   Lưu trong localStorage của trình duyệt (theo từng máy).
   ========================================================================= */

const KEY = 'helix_academy_state_v1';

// Đổi token này để buộc làm mới sạch tiến trình cho mọi máy ở lần tải kế tiếp.
const RESET_TOKEN = 'reset-2026-07-04';

/** Ngày hôm nay dạng YYYY-MM-DD theo giờ máy. */
export function today() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

/** Cộng/trừ số ngày cho một chuỗi ngày YYYY-MM-DD (an toàn với mọi múi giờ). */
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

/** Số ngày giữa hai mốc (b - a). */
export function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

function defaultState() {
  return {
    resetToken: RESET_TOKEN,
    version: 1,
    createdAt: today(),
    xp: 0,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    lessonsRead: {},          // { [lessonId]: true }
    quizStats: {},            // { [quizId]: { attempts, best, lastScore } }
    srs: {},                  // { [cardId]: { ef, interval, reps, due, lapses, lastReview } }
    reviewLog: {},            // { [date]: soLuotOn }
    newPerDay: 8,             // số thẻ mới giới thiệu mỗi ngày
    achievements: {},         // { [achId]: dateUnlocked }
    settings: { theme: 'dark' },
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (parsed.resetToken !== RESET_TOKEN) return defaultState(); // buộc làm mới
    return { ...defaultState(), ...parsed };
  } catch (e) {
    console.warn('Không đọc được state, tạo mới:', e);
    return defaultState();
  }
}

let saveTimer = null;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error('Lưu state lỗi:', e); }
  }, 120);
}

export function getState() { return state; }

export function resetState() {
  state = defaultState();
  save();
}

/* ---- XP & streak ---- */

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => fn(state)); }

export function addXp(amount) {
  state.xp += amount;
  save(); emit();
  return amount;
}

/* ---- Cấp độ (Level) ---- */
export const XP_PER_LEVEL = 300;
export function levelInfo() {
  const xp = state.xp;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const inLevel = xp - (level - 1) * XP_PER_LEVEL;
  return {
    level, xp, inLevel, need: XP_PER_LEVEL,
    toNext: XP_PER_LEVEL - inLevel,
    pct: Math.round(inLevel / XP_PER_LEVEL * 100),
  };
}

/** Đánh dấu có hoạt động học hôm nay → cập nhật streak. */
export function touchStreak() {
  const t = today();
  const s = state.streak;
  if (s.lastActiveDate === t) return; // đã tính hôm nay
  if (s.lastActiveDate && daysBetween(s.lastActiveDate, t) === 1) {
    s.current += 1;
  } else {
    s.current = 1;
  }
  s.longest = Math.max(s.longest, s.current);
  s.lastActiveDate = t;
  save(); emit();
}

/** Nếu bỏ lỡ >1 ngày thì streak coi như đứt (tính khi khởi động). */
export function refreshStreak() {
  const s = state.streak;
  if (s.lastActiveDate && daysBetween(s.lastActiveDate, today()) > 1) {
    s.current = 0;
    save();
  }
}

export function logReview(count = 1) {
  const t = today();
  state.reviewLog[t] = (state.reviewLog[t] || 0) + count;
  save(); emit();
}

/* ---- Bài học ---- */

export function markLessonRead(lessonId) {
  if (!state.lessonsRead[lessonId]) {
    state.lessonsRead[lessonId] = true;
    addXp(15);
    touchStreak();
    save(); emit();
    return true;
  }
  return false;
}
export function unmarkLessonRead(lessonId) {
  if (state.lessonsRead[lessonId]) {
    delete state.lessonsRead[lessonId];
    save(); emit();
    return true;
  }
  return false;
}
export function isLessonRead(id) { return !!state.lessonsRead[id]; }

/* ---- Quiz ---- */

export function recordQuiz(quizId, score, total) {
  const pct = Math.round((score / total) * 100);
  const cur = state.quizStats[quizId] || { attempts: 0, best: 0, lastScore: 0 };
  cur.attempts += 1;
  cur.lastScore = pct;
  cur.best = Math.max(cur.best, pct);
  state.quizStats[quizId] = cur;
  touchStreak();
  save(); emit();
  return cur;
}

export { emit as notify };

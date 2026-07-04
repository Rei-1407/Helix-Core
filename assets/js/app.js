/* =========================================================================
   app.js — Điểm khởi động: nạp nội dung, định tuyến, cập nhật thanh trạng thái.
   ========================================================================= */

import { loadContent } from './content.js';
import { getState, onChange, refreshStreak, save } from './storage.js';
import { counts } from './srs.js';

import * as dashboard from './views/dashboard.js';
import * as learn from './views/learn.js';
import * as practice from './views/practice.js';
import * as review from './views/review.js';
import * as progress from './views/progress.js';

const VIEWS = { dashboard, learn, practice, review, progress };
const viewEl = document.getElementById('view');
let currentCleanup = null;

/* ------------------------- Theme ------------------------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('themeToggle');
  const dark = theme === 'dark';
  btn.querySelector('.theme-toggle__icon').textContent = dark ? '🌙' : '☀️';
  btn.querySelector('.theme-toggle__label').textContent = dark ? 'Giao diện tối' : 'Giao diện sáng';
}
function initTheme() {
  applyTheme(getState().settings.theme || 'dark');
  document.getElementById('themeToggle').addEventListener('click', () => {
    const s = getState();
    s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark';
    save();
    applyTheme(s.settings.theme);
  });
}

/* ------------------------- Thanh trạng thái ------------------------- */
function updateChrome() {
  const s = getState();
  const c = counts();
  document.getElementById('streakValue').textContent = s.streak.current;
  document.getElementById('xpValue').textContent = s.xp;

  const duePill = document.getElementById('duePill');
  const dueVal = document.getElementById('dueValue');
  if (c.todo > 0) { duePill.hidden = false; dueVal.textContent = c.todo; } else { duePill.hidden = true; }

  const badge = document.getElementById('reviewBadge');
  if (c.todo > 0) { badge.hidden = false; badge.textContent = c.todo; } else { badge.hidden = true; }
}

/* ------------------------- Router ------------------------- */
function parseHash() {
  let h = location.hash || '';
  if (h === '' || h === '#') return [];              // trống → về dashboard mặc định
  if (!h.startsWith('#/')) return null;              // #anchor trong bài → để trình duyệt tự cuộn
  const path = h.slice(2).replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);
  return segments;
}

function route() {
  const segments = parseHash();
  if (segments === null) return;                     // bỏ qua anchor nội bộ
  if (!segments.length) { location.hash = '#/dashboard'; return; }

  const name = segments[0];
  const view = VIEWS[name] || VIEWS.dashboard;

  // dọn dẹp view trước
  if (currentCleanup) { try { currentCleanup(); } catch (_) {} currentCleanup = null; }

  const params = { segments, rest: segments.slice(1), num: segments[1] };
  view.render(viewEl, params);
  currentCleanup = typeof view.cleanup === 'function' ? view.cleanup : null;

  // cập nhật nav + tiêu đề
  document.querySelectorAll('.nav__item').forEach(a =>
    a.classList.toggle('is-active', a.dataset.route === (VIEWS[name] ? name : 'dashboard')));
  document.getElementById('topbarTitle').textContent = view.title || 'Helix Core Academy';
  document.body.classList.remove('nav-open');
  updateChrome();
}

/* ------------------------- Menu (màn hình hẹp) ------------------------- */
function initMenu() {
  document.getElementById('menuToggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.getElementById('sidebarBackdrop').addEventListener('click', () => document.body.classList.remove('nav-open'));
}

/* ------------------------- Khởi động ------------------------- */
async function boot() {
  initTheme();
  initMenu();
  refreshStreak();
  onChange(updateChrome);

  try {
    await loadContent();
  } catch (err) {
    viewEl.innerHTML = `<div class="page"><div class="empty">
      <div class="empty__ic">⚠️</div><h3>Không tải được tài liệu</h3>
      <p>${err.message}. Nếu đang mở trực tiếp bằng file://, hãy chạy qua một máy chủ web (hoặc GitHub Pages).</p>
    </div></div>`;
    return;
  }

  window.addEventListener('hashchange', route);
  route();
  updateChrome();
}

boot();

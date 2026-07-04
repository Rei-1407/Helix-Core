/* =========================================================================
   app.js — Khởi động, định tuyến, sidebar cây bài học, tìm kiếm, trạng thái.
   ========================================================================= */

import { loadContent, getCachedContent } from './content.js';
import { getState, onChange, refreshStreak, save, isLessonRead, levelInfo } from './storage.js';
import { counts } from './srs.js';
import { MODULES } from './data/lessons.js';
import { QUIZZES } from './data/quizzes.js';
import { EXERCISES } from './data/exercises.js';
import { esc } from './util.js';

import * as dashboard from './views/dashboard.js';
import * as learn from './views/learn.js';
import * as practice from './views/practice.js';
import * as review from './views/review.js';
import * as progress from './views/progress.js';

const VIEWS = { dashboard, learn, practice, review, progress };
const viewEl = document.getElementById('view');
let currentCleanup = null;
let currentLessonNum = null;
const openModules = new Set();           // module đang mở trong cây sidebar

const MOD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/* ------------------------- Theme ------------------------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById('themeToggle').textContent = theme === 'dark' ? '🌙' : '☀️';
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

/* ------------------------- Cây bài học ở sidebar ------------------------- */
function lessonProgress() {
  const content = getCachedContent();
  if (!content) return { read: 0, total: 0 };
  const ls = content.lessons.filter(l => l.kind === 'lesson');
  return { read: ls.filter(l => isLessonRead(l.id)).length, total: ls.length };
}

function renderTree() {
  const content = getCachedContent();
  const host = document.getElementById('moduleTree');
  if (!content || !host) return;
  const byNum = content.byNum;

  const groups = MODULES.map((m, i) => ({
    id: m.id, letter: MOD_LETTERS[i], title: m.title,
    lessons: m.lessons.filter(n => byNum[n]).map(n => byNum[n]),
  }));
  const bonus = content.lessons.filter(l => l.kind === 'bonus');
  if (bonus.length) groups.push({ id: 'bonus', letter: '★', title: 'Bổ sung', lessons: bonus });

  host.innerHTML = groups.map(g => {
    const done = g.lessons.filter(l => isLessonRead(l.id)).length;
    const open = openModules.has(g.id);
    const items = g.lessons.map(l => {
      const isDone = isLessonRead(l.id);
      const active = l.num === currentLessonNum ? ' is-active' : '';
      return `<a class="tree-item${active}${isDone ? ' is-done' : ''}" href="#/learn/${l.num}">
        <span class="tree-item__dot">${isDone ? '✓' : ''}</span>
        <span class="tree-item__title">${esc(l.title)}</span>
      </a>`;
    }).join('');
    return `<div class="mod${open ? ' is-open' : ''}" data-mod="${g.id}">
      <button class="mod__head" data-modtoggle="${g.id}">
        <span class="mod__badge">${g.letter}</span>
        <span class="mod__title">${esc(g.title)}</span>
        <span class="mod__count">${done}/${g.lessons.length}</span>
        <span class="mod__chev">▾</span>
      </button>
      <div class="mod__items">${items}</div>
    </div>`;
  }).join('');

  host.querySelectorAll('[data-modtoggle]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.modtoggle;
    if (openModules.has(id)) openModules.delete(id); else openModules.add(id);
    renderTree();
  }));
}

/* ------------------------- Thanh trạng thái ------------------------- */
function updateChrome() {
  const s = getState();
  const c = counts();
  const lv = levelInfo();

  document.getElementById('streakValue').textContent = s.streak.current;
  document.getElementById('levelValue').textContent = 'Lv.' + lv.level;
  document.getElementById('xpValue').textContent = lv.xp + ' XP';
  document.getElementById('levelRing').style.background =
    `conic-gradient(var(--primary) ${lv.pct}%, var(--surface-3) 0)`;

  const duePill = document.getElementById('duePill');
  if (c.todo > 0) { duePill.hidden = false; document.getElementById('dueValue').textContent = c.todo; }
  else duePill.hidden = true;

  const badge = document.getElementById('reviewBadge');
  if (c.todo > 0) { badge.hidden = false; badge.textContent = c.todo; } else badge.hidden = true;

  const lp = lessonProgress();
  const pct = lp.total ? Math.round(lp.read / lp.total * 100) : 0;
  document.getElementById('overallPct').textContent = pct + '%';
  document.getElementById('overallBar').style.width = pct + '%';

  renderTree();
}

/* ------------------------- Tìm kiếm toàn cục ------------------------- */
function initSearch() {
  const input = document.getElementById('globalSearch');
  const panel = document.getElementById('searchPanel');

  const close = () => { panel.hidden = true; };
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    const content = getCachedContent();
    const norm = s => s.toLowerCase();
    const hits = [];

    if (content) content.lessons.filter(l => norm(l.title).includes(q)).slice(0, 6)
      .forEach(l => hits.push({ ic: l.icon, t: l.title, sub: l.kind === 'bonus' ? 'Bổ sung' : `Mục ${l.num}`, href: `#/learn/${l.num}` }));
    QUIZZES.filter(x => norm(x.title).includes(q) || norm(x.desc).includes(q)).slice(0, 4)
      .forEach(x => hits.push({ ic: '🎯', t: x.title, sub: 'Quiz', href: `#/practice/quiz/${x.id}` }));
    EXERCISES.filter(x => norm(x.title).includes(q)).slice(0, 4)
      .forEach(x => hits.push({ ic: '🧩', t: x.title, sub: 'Bài tập', href: `#/practice/exercise/${x.id}` }));

    panel.innerHTML = hits.length
      ? hits.map(h => `<a class="search-hit" href="${h.href}">
          <span class="search-hit__ic">${h.ic}</span>
          <span class="search-hit__body"><span class="search-hit__t">${esc(h.t)}</span><span class="search-hit__sub">${h.sub}</span></span>
        </a>`).join('')
      : `<div class="search-empty">Không tìm thấy kết quả cho "${esc(q)}"</div>`;
    panel.hidden = false;
    panel.querySelectorAll('.search-hit').forEach(a => a.addEventListener('click', () => { input.value = ''; close(); }));
  };

  input.addEventListener('input', run);
  input.addEventListener('focus', () => { if (input.value.trim()) run(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('#search')) close(); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); }
    else if (e.key === 'Escape') { close(); input.blur(); }
  });
}

/* ------------------------- Router ------------------------- */
function parseHash() {
  let h = location.hash || '';
  if (h === '' || h === '#') return [];
  if (!h.startsWith('#/')) return null;
  const path = h.slice(2).replace(/\/+$/, '');
  return path.split('/').filter(Boolean);
}

function route() {
  const segments = parseHash();
  if (segments === null) return;
  if (!segments.length) { location.hash = '#/dashboard'; return; }

  const name = segments[0];
  const view = VIEWS[name] || VIEWS.dashboard;
  if (currentCleanup) { try { currentCleanup(); } catch (_) {} currentCleanup = null; }

  const params = { segments, rest: segments.slice(1), num: segments[1] };

  // Ghi nhớ bài đang mở để highlight trong cây
  if (name === 'learn') {
    const content = getCachedContent();
    let n = parseInt(params.num, 10);
    if (content && (!n || !content.byNum[n])) {
      const fu = content.lessons.find(l => l.kind === 'lesson' && !isLessonRead(l.id));
      n = fu ? fu.num : content.lessons[0].num;
    }
    currentLessonNum = n || null;
    // mở module chứa bài đang đọc
    const mod = MODULES.find(m => m.lessons.includes(currentLessonNum));
    if (mod) openModules.add(mod.id);
    else if (currentLessonNum >= 100) openModules.add('bonus');
  } else {
    currentLessonNum = null;
  }

  view.render(viewEl, params);
  currentCleanup = typeof view.cleanup === 'function' ? view.cleanup : null;

  document.querySelectorAll('.nav__item').forEach(a =>
    a.classList.toggle('is-active', a.dataset.route === (VIEWS[name] ? name : 'dashboard')));
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

  // Mở sẵn tất cả nhóm trong cây
  MODULES.forEach(m => openModules.add(m.id));
  openModules.add('bonus');

  initSearch();
  window.addEventListener('hashchange', route);
  route();
  updateChrome();
}

boot();

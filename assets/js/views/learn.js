/* =========================================================================
   learn.js — Đọc bài học. Layout 3 cột: danh mục | nội dung | mục lục.
   ========================================================================= */

import { getCachedContent } from '../content.js';
import { isLessonRead, markLessonRead } from '../storage.js';
import { MODULES } from '../data/lessons.js';
import { QUIZZES } from '../data/quizzes.js';
import { esc, toast } from '../util.js';

export const title = 'Bài học';

let cleanupFns = [];

function buildNav(lessons, activeNum) {
  const byNum = Object.fromEntries(lessons.map(l => [l.num, l]));
  let html = `<input class="lesson-nav__search" id="lessonSearch" type="text" placeholder="🔍 Tìm bài học..." />`;

  for (const m of MODULES) {
    const items = m.lessons.filter(n => byNum[n]);
    if (!items.length) continue;
    html += `<div class="module-group"><div class="module-group__title">${esc(m.title)}</div>`;
    for (const n of items) {
      const l = byNum[n];
      const done = isLessonRead(l.id) ? ' is-done' : '';
      const active = n === activeNum ? ' is-active' : '';
      html += `<a class="lesson-link${active}${done}" data-title="${esc(l.title.toLowerCase())}" href="#/learn/${n}">
        <span class="lesson-link__num">${n}</span><span>${esc(l.title)}</span></a>`;
    }
    html += `</div>`;
  }

  // Bài bổ sung (phụ lục)
  const bonus = lessons.filter(l => l.kind === 'bonus');
  if (bonus.length) {
    html += `<div class="module-group"><div class="module-group__title">Bổ sung</div>`;
    for (const l of bonus) {
      const active = l.num === activeNum ? ' is-active' : '';
      const done = isLessonRead(l.id) ? ' is-done' : '';
      html += `<a class="lesson-link${active}${done}" data-title="${esc(l.title.toLowerCase())}" href="#/learn/${l.num}">
        <span class="lesson-link__num">${l.icon}</span><span>${esc(l.title)}</span></a>`;
    }
    html += `</div>`;
  }
  return html;
}

function buildToc(headings) {
  if (!headings.length) return '<p style="color:var(--text-3);font-size:12.5px">Bài này không có mục con.</p>';
  return headings.map(h =>
    `<a class="toc__link${h.level === 3 ? ' toc__link--h3' : ''}" href="#${h.id}" data-toc="${h.id}">${esc(h.text)}</a>`
  ).join('');
}

export function render(root, params) {
  teardown();
  const content = getCachedContent();
  if (!content) { root.innerHTML = '<div class="page"><p>Chưa tải được nội dung.</p></div>'; return; }

  const lessons = content.lessons;
  let num = parseInt(params.num, 10);
  if (!num || !content.byNum[num]) {
    // mặc định: bài chưa đọc đầu tiên, hoặc bài 1
    const firstUnread = lessons.find(l => l.kind === 'lesson' && !isLessonRead(l.id));
    num = firstUnread ? firstUnread.num : lessons[0].num;
  }
  const lesson = content.byNum[num];

  // Bài trước / sau (chỉ trong các bài "lesson"/"bonus" theo thứ tự)
  const idx = lessons.findIndex(l => l.num === num);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];

  // Quiz liên quan
  const relatedQuiz = QUIZZES.find(q => q.lessons.includes(num));

  root.innerHTML = `
  <div class="page">
    <div class="learn-layout">
      <aside class="lesson-nav" id="lessonNav">${buildNav(lessons, num)}</aside>

      <div class="lesson-main" id="lessonMain">
        <div class="reading-progress"><div class="reading-progress__bar" id="readBar"></div></div>

        <div class="lesson-head">
          <div class="lesson-head__crumb">${lesson.kind === 'bonus' ? 'Bổ sung' : `Mục ${lesson.num}`} · Helix Core Academy</div>
          <h1>${lesson.icon} ${esc(lesson.title)}</h1>
          <div class="lesson-head__meta">
            ${isLessonRead(lesson.id) ? '<span class="chip chip--success">✓ Đã đọc</span>' : '<span class="chip">Chưa đọc</span>'}
            ${relatedQuiz ? `<span class="chip chip--accent">🎯 Có quiz ôn tập</span>` : ''}
          </div>
        </div>

        <article class="prose" id="prose">${lesson.html}</article>

        <div class="lesson-foot">
          ${relatedQuiz ? `
          <div class="lesson-cta" id="lessonCta">
            <div class="lesson-cta__ic">🎯</div>
            <div class="lesson-cta__body">
              <strong>Kiểm tra hiểu bài</strong>
              <p>Làm bộ quiz "${esc(relatedQuiz.title)}" để chắc chắn bạn đã nắm vững.</p>
            </div>
            <a class="btn btn--accent" href="#/practice/quiz/${relatedQuiz.id}">Làm quiz →</a>
          </div>` : ''}

          <div class="lesson-pager">
            ${prev ? `<a href="#/learn/${prev.num}"><span class="lesson-pager__dir">← Bài trước</span><span class="lesson-pager__title">${esc(prev.title)}</span></a>` : '<span></span>'}
            ${next ? `<a class="is-next" href="#/learn/${next.num}"><span class="lesson-pager__dir">Bài tiếp →</span><span class="lesson-pager__title">${esc(next.title)}</span></a>` : '<span></span>'}
          </div>
        </div>
      </div>

      <aside class="toc" id="toc">
        <div class="toc__title">Trong bài này</div>
        ${buildToc(lesson.headings)}
      </aside>
    </div>
  </div>`;

  window.scrollTo(0, 0);
  setupSearch();
  setupScroll(lesson);
}

function setupSearch() {
  const input = document.getElementById('lessonSearch');
  if (!input) return;
  const onInput = () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('#lessonNav .lesson-link').forEach(a => {
      const match = !q || (a.dataset.title || '').includes(q);
      a.style.display = match ? '' : 'none';
    });
    document.querySelectorAll('#lessonNav .module-group').forEach(g => {
      const anyVisible = [...g.querySelectorAll('.lesson-link')].some(a => a.style.display !== 'none');
      g.style.display = anyVisible ? '' : 'none';
    });
  };
  input.addEventListener('input', onInput);
  cleanupFns.push(() => input.removeEventListener('input', onInput));
}

function setupScroll(lesson) {
  const bar = document.getElementById('readBar');
  const article = document.getElementById('lessonMain');
  const tocLinks = [...document.querySelectorAll('#toc .toc__link')];
  const headings = lesson.headings.map(h => document.getElementById(h.id)).filter(Boolean);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      // Thanh tiến độ đọc
      const start = article.offsetTop - 120;
      const end = article.offsetTop + article.offsetHeight - window.innerHeight + 120;
      const p = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

      // Scroll-spy mục lục
      const offset = 120;
      let activeId = headings.length ? headings[0].id : null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= offset) activeId = h.id; else break;
      }
      tocLinks.forEach(a => a.classList.toggle('is-active', a.dataset.toc === activeId));
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  cleanupFns.push(() => window.removeEventListener('scroll', onScroll));

  // Tự đánh dấu đã đọc khi cuộn tới cuối bài
  if (!isLessonRead(lesson.id)) {
    const foot = document.querySelector('.lesson-foot');
    if (foot) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          if (markLessonRead(lesson.id)) {
            toast('✓ Đã đọc xong bài · <strong>+15 XP</strong>', 'xp');
            // cập nhật badge trong nav
            document.querySelectorAll(`#lessonNav a[href="#/learn/${lesson.num}"]`).forEach(a => a.classList.add('is-done'));
            document.querySelector('.lesson-head__meta .chip')?.replaceWith(
              Object.assign(document.createElement('span'), { className: 'chip chip--success', textContent: '✓ Đã đọc' })
            );
          }
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(foot);
      cleanupFns.push(() => io.disconnect());
    }
  }
}

function teardown() {
  cleanupFns.forEach(fn => { try { fn(); } catch (_) {} });
  cleanupFns = [];
}

export { teardown as cleanup };

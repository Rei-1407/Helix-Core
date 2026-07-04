/* =========================================================================
   learn.js — Đọc bài học. Layout 2 cột: nội dung | mục lục.
   Danh mục bài học nằm ở sidebar chung. Đánh dấu hoàn thành bằng NÚT (không tự động).
   ========================================================================= */

import { getCachedContent } from '../content.js';
import { isLessonRead, markLessonRead, unmarkLessonRead } from '../storage.js';
import { QUIZZES } from '../data/quizzes.js';
import { esc, toast } from '../util.js';

export const title = 'Bài học';

let cleanupFns = [];

function buildToc(headings) {
  if (!headings.length) return '<p style="color:var(--text-3);font-size:12.5px">Bài này không có mục con.</p>';
  return headings.map(h =>
    `<a class="toc__link${h.level === 3 ? ' toc__link--h3' : ''}" href="#${h.id}" data-toc="${h.id}">${esc(h.text)}</a>`
  ).join('');
}

function completeBtnHTML(lesson) {
  return isLessonRead(lesson.id)
    ? `<div class="complete-box is-done">
         <span class="complete-box__label">✓ Bạn đã hoàn thành bài này</span>
         <button class="btn btn--ghost" id="unmarkBtn">Bỏ đánh dấu</button>
       </div>`
    : `<div class="complete-box">
         <span class="complete-box__label">Đọc xong bài này rồi? Xác nhận để tính vào tiến độ.</span>
         <button class="btn btn--primary" id="markBtn">✓ Đánh dấu đã hoàn thành</button>
       </div>`;
}

export function render(root, params) {
  teardown();
  const content = getCachedContent();
  if (!content) { root.innerHTML = '<div class="page"><p>Chưa tải được nội dung.</p></div>'; return; }

  const lessons = content.lessons;
  let num = parseInt(params.num, 10);
  if (!num || !content.byNum[num]) {
    const firstUnread = lessons.find(l => l.kind === 'lesson' && !isLessonRead(l.id));
    num = firstUnread ? firstUnread.num : lessons[0].num;
  }
  const lesson = content.byNum[num];

  const idx = lessons.findIndex(l => l.num === num);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const relatedQuiz = QUIZZES.find(q => q.lessons.includes(num));

  root.innerHTML = `
  <div class="learn-page">
    <div class="reading-progress"><div class="reading-progress__bar" id="readBar"></div></div>
    <div class="learn-layout">
      <div class="lesson-main" id="lessonMain">
        <div class="lesson-head">
          <div class="lesson-head__crumb">${lesson.kind === 'bonus' ? 'Bổ sung' : `Mục ${lesson.num}`} · Helix Core Academy</div>
          <h1>${lesson.icon} ${esc(lesson.title)}</h1>
          <div class="lesson-head__meta" id="lessonMeta">
            ${isLessonRead(lesson.id) ? '<span class="chip chip--success">✓ Đã hoàn thành</span>' : '<span class="chip">Chưa hoàn thành</span>'}
            ${relatedQuiz ? `<span class="chip chip--accent">🎯 Có quiz ôn tập</span>` : ''}
          </div>
        </div>

        <article class="prose" id="prose">${lesson.html}</article>

        <div class="lesson-foot">
          <div id="completeSlot">${completeBtnHTML(lesson)}</div>

          ${relatedQuiz ? `
          <div class="lesson-cta">
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
  wireComplete(lesson, relatedQuiz);
  setupScroll(lesson);
}

function wireComplete(lesson, relatedQuiz) {
  const slot = document.getElementById('completeSlot');
  const meta = document.getElementById('lessonMeta');

  const refresh = () => {
    slot.innerHTML = completeBtnHTML(lesson);
    meta.innerHTML =
      (isLessonRead(lesson.id) ? '<span class="chip chip--success">✓ Đã hoàn thành</span>' : '<span class="chip">Chưa hoàn thành</span>')
      + (relatedQuiz ? `<span class="chip chip--accent">🎯 Có quiz ôn tập</span>` : '');
    bind();
  };
  const bind = () => {
    document.getElementById('markBtn')?.addEventListener('click', () => {
      if (markLessonRead(lesson.id)) toast('✓ Đã hoàn thành bài · <strong>+15 XP</strong>', 'xp');
      refresh();
    });
    document.getElementById('unmarkBtn')?.addEventListener('click', () => {
      unmarkLessonRead(lesson.id);
      refresh();
    });
  };
  bind();
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
      const start = article.offsetTop - 120;
      const end = article.offsetTop + article.offsetHeight - window.innerHeight + 120;
      const p = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

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
}

function teardown() {
  cleanupFns.forEach(fn => { try { fn(); } catch (_) {} });
  cleanupFns = [];
}

export { teardown as cleanup };

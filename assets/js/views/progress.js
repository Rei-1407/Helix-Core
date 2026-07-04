/* =========================================================================
   progress.js — Tiến độ, thành tựu và mức độ thành thạo theo chủ đề.
   ========================================================================= */

import { getCachedContent } from '../content.js';
import { getState, isLessonRead, resetState } from '../storage.js';
import { counts } from '../srs.js';
import { MODULES } from '../data/lessons.js';
import { QUIZZES } from '../data/quizzes.js';
import { FLASHCARDS } from '../data/flashcards.js';
import { esc, toast } from '../util.js';

export const title = 'Tiến độ';

function achievements(state, content, c) {
  const lessons = content ? content.lessons.filter(l => l.kind === 'lesson') : [];
  const readCount = lessons.filter(l => isLessonRead(l.id)).length;
  const quizDone = Object.keys(state.quizStats).length;
  const perfect = Object.values(state.quizStats).some(s => s.best === 100);
  return [
    { ic: '🌱', t: 'Bước đầu tiên', d: 'Đọc xong bài học đầu tiên', on: readCount >= 1 },
    { ic: '🔥', t: 'Đều đặn 3 ngày', d: 'Chuỗi học 3 ngày liên tục', on: state.streak.longest >= 3 },
    { ic: '⚡', t: 'Kiên trì 7 ngày', d: 'Chuỗi học 7 ngày liên tục', on: state.streak.longest >= 7 },
    { ic: '📚', t: 'Nửa chặng đường', d: 'Đọc 50% số bài học', on: lessons.length && readCount >= lessons.length / 2 },
    { ic: '🎓', t: 'Đọc hết giáo trình', d: 'Hoàn thành tất cả bài học', on: lessons.length && readCount >= lessons.length },
    { ic: '🎯', t: 'Điểm tuyệt đối', d: 'Đạt 100% một bộ quiz', on: perfect },
    { ic: '🧠', t: 'Nhà chiến lược', d: `Làm ${QUIZZES.length} bộ quiz`, on: quizDone >= QUIZZES.length },
    { ic: '🃏', t: 'Ghi nhớ sâu', d: 'Có 10 thẻ nhớ lâu (mature)', on: c.mature >= 10 },
    { ic: '💎', t: 'Bậc thầy Helix', d: 'Đạt 500 XP', on: state.xp >= 500 },
  ];
}

function masteryRows(content) {
  const rows = [];
  for (const m of MODULES) {
    const lessons = content ? content.lessons.filter(l => m.lessons.includes(l.num)) : [];
    const readPct = lessons.length ? lessons.filter(l => isLessonRead(l.id)).length / lessons.length * 100 : 0;

    const st = getState();
    const quizzes = QUIZZES.filter(q => q.lessons.some(n => m.lessons.includes(n)));
    const quizPct = quizzes.length
      ? quizzes.reduce((s, q) => s + (st.quizStats[q.id]?.best || 0), 0) / quizzes.length : 0;

    const cards = FLASHCARDS.filter(fc => m.lessons.includes(fc.topic));
    const cardPct = cards.length
      ? cards.filter(fc => st.srs[fc.id]).length / cards.length * 100 : 0;

    const parts = [readPct, quizPct, cardPct].filter((_, i) => [true, quizzes.length > 0, cards.length > 0][i]);
    const mastery = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
    rows.push({ name: m.title, pct: mastery });
  }
  return rows;
}

export function render(root) {
  const state = getState();
  const content = getCachedContent();
  const c = counts();
  const lessons = content ? content.lessons.filter(l => l.kind === 'lesson') : [];
  const readCount = lessons.filter(l => isLessonRead(l.id)).length;
  const quizDone = Object.keys(state.quizStats).length;

  const achs = achievements(state, content, c);
  const unlocked = achs.filter(a => a.on).length;

  root.innerHTML = `
  <div class="page">
    <div class="page-head">
      <h1>Tiến độ của bạn 📊</h1>
      <p>Theo dõi hành trình chinh phục Helix Core. Học đều mỗi ngày, các con số sẽ tự lớn lên.</p>
    </div>

    <div class="stat-cards">
      <div class="big-stat"><div class="big-stat__ic">🔥</div><div class="big-stat__val">${state.streak.current}</div><div class="big-stat__lbl">Chuỗi ngày (dài nhất ${state.streak.longest})</div></div>
      <div class="big-stat"><div class="big-stat__ic">⚡</div><div class="big-stat__val">${state.xp}</div><div class="big-stat__lbl">Điểm kinh nghiệm</div></div>
      <div class="big-stat"><div class="big-stat__ic">📚</div><div class="big-stat__val">${readCount}/${lessons.length}</div><div class="big-stat__lbl">Bài học đã đọc</div></div>
      <div class="big-stat"><div class="big-stat__ic">🃏</div><div class="big-stat__val">${c.learned}/${c.total}</div><div class="big-stat__lbl">Thẻ đang ôn (${c.mature} nhớ lâu)</div></div>
    </div>

    <div class="card card--pad-lg" style="margin-bottom:26px">
      <div class="section-title">🧭 Mức độ thành thạo theo chủ đề</div>
      ${masteryRows(content).map(r => `
        <div class="mastery-row">
          <div class="mastery-row__name">${esc(r.name)}</div>
          <div class="progress"><div class="progress__bar" style="width:${r.pct}%"></div></div>
          <div class="mastery-row__pct">${r.pct}%</div>
        </div>`).join('')}
    </div>

    <div class="section-title">🏆 Thành tựu <span class="chip chip--primary">${unlocked}/${achs.length}</span></div>
    <div class="ach-grid" style="margin-bottom:30px">
      ${achs.map(a => `
        <div class="ach ${a.on ? 'is-unlocked' : 'is-locked'}">
          <div class="ach__ic">${a.on ? a.ic : '🔒'}</div>
          <div><div class="ach__t">${esc(a.t)}</div><div class="ach__d">${esc(a.d)}</div></div>
        </div>`).join('')}
    </div>

    <div class="card" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="font-weight:700">Đặt lại toàn bộ tiến độ</div>
        <div style="font-size:13px;color:var(--text-3)">Xoá streak, XP, lịch ôn tập và lịch sử. Không thể hoàn tác.</div>
      </div>
      <button class="btn btn--ghost" id="resetBtn" style="color:var(--danger)">Đặt lại</button>
    </div>
  </div>`;

  root.querySelector('#resetBtn').addEventListener('click', () => {
    if (confirm('Bạn chắc chắn muốn xoá toàn bộ tiến độ học? Hành động này không thể hoàn tác.')) {
      resetState();
      toast('Đã đặt lại tiến độ.');
      render(root);
    }
  });
}

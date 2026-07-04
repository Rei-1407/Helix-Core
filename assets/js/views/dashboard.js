/* =========================================================================
   dashboard.js — Trang chủ: tổng quan, lộ trình theo giai đoạn, huy hiệu.
   ========================================================================= */

import { getCachedContent } from '../content.js';
import { getState, isLessonRead, levelInfo } from '../storage.js';
import { counts } from '../srs.js';
import { MODULES } from '../data/lessons.js';
import { QUIZZES } from '../data/quizzes.js';
import { computeAchievements } from '../achievements.js';
import { esc, progressRing } from '../util.js';

export const title = 'Trang chủ';

const PHASES = [
  { n: 1, title: 'Nền tảng & Bắt đầu', desc: 'Bản chất Perforce P4, khái niệm cốt lõi, cài đặt & cấu hình UE', mods: ['m1', 'm2'] },
  { n: 2, title: 'Vận hành & Làm việc nhóm', desc: 'Workflow hàng ngày, resolve, shelve, editor, OFPA, UGS', mods: ['m3', 'm4'] },
  { n: 3, title: 'Nâng cao, vai trò & Tra cứu', desc: 'Streams, vai trò, dựng server, best practices, sự cố, CLI', mods: ['m5', 'm6', 'm7'] },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function phaseProgress(content, mods) {
  const nums = MODULES.filter(m => mods.includes(m.id)).flatMap(m => m.lessons);
  const ls = nums.map(n => content.byNum[n]).filter(Boolean);
  const read = ls.filter(l => isLessonRead(l.id)).length;
  return { read, total: ls.length, pct: ls.length ? Math.round(read / ls.length * 100) : 0 };
}

export function render(root) {
  const state = getState();
  const content = getCachedContent();
  const c = counts();
  const lv = levelInfo();

  const lessons = content ? content.lessons.filter(l => l.kind === 'lesson') : [];
  const read = lessons.filter(l => isLessonRead(l.id)).length;
  const totalLessons = lessons.length;
  const lessonPct = totalLessons ? Math.round(read / totalLessons * 100) : 0;
  const nextLesson = lessons.find(l => !isLessonRead(l.id));
  const quizPassed = QUIZZES.filter(q => (state.quizStats[q.id]?.best || 0) >= 80).length;
  const quizAttempted = Object.keys(state.quizStats).length;

  const achs = computeAchievements();
  const unlocked = achs.filter(a => a.on).length;

  root.innerHTML = `
  <div class="page">
    <!-- HERO -->
    <div class="dash-hero">
      <div class="dash-hero__main">
        <div class="eyebrow">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1>${greeting()}! 👋</h1>
        <p>Học và luyện Helix Core (Perforce) cho Unreal Engine theo lộ trình có hệ thống. Mỗi bài hoàn thành, mỗi lượt ôn là một bước tiến tới thành thạo.</p>
        <div class="dash-hero__btns">
          <a class="btn btn--primary btn--lg" href="#/learn${nextLesson ? '/' + nextLesson.num : ''}">▶ ${read ? 'Tiếp tục học' : 'Bắt đầu học'}</a>
          <a class="btn btn--ghost btn--lg" href="#/learn">📚 Xem lộ trình</a>
        </div>
      </div>
      <div class="dash-hero__ring">
        ${progressRing(lessonPct)}
        <div class="dash-hero__ring-label"><b>${lessonPct}%</b><span>hoàn thành</span></div>
      </div>
    </div>

    <!-- BANNER ÔN TẬP -->
    <a class="review-banner ${c.todo ? '' : 'is-empty'}" href="#/review">
      <div class="review-banner__ic">${c.todo ? '🗓️' : '🌤️'}</div>
      <div class="review-banner__body">
        <strong>${c.todo ? `Có ${c.todo} thẻ cần ôn hôm nay` : 'Hôm nay không còn thẻ nào để ôn'}</strong>
        <span>Luyện tập hàng ngày · 🔥 chuỗi ${state.streak.current} ngày · ${c.learned}/${c.total} thẻ đã thuộc</span>
      </div>
      <span class="review-banner__cta">${c.todo ? 'Ôn ngay →' : 'Xem lại →'}</span>
    </a>

    <!-- 4 THẺ CHỈ SỐ -->
    <div class="stat-cards">
      <div class="big-stat"><div class="big-stat__ic">📚</div><div class="big-stat__val">${read}<span class="big-stat__of">/${totalLessons}</span></div><div class="big-stat__lbl">Bài học hoàn thành</div></div>
      <div class="big-stat"><div class="big-stat__ic">🎯</div><div class="big-stat__val">${quizPassed}<span class="big-stat__of">/${QUIZZES.length}</span></div><div class="big-stat__lbl">Quiz đạt (≥80%) · đã làm ${quizAttempted}</div></div>
      <div class="big-stat"><div class="big-stat__ic">🃏</div><div class="big-stat__val">${c.learned}<span class="big-stat__of">/${c.total}</span></div><div class="big-stat__lbl">Thẻ đang ôn · ${c.mature} nhớ lâu</div></div>
      <div class="big-stat"><div class="big-stat__ic">🏆</div><div class="big-stat__val">Lv.${lv.level}</div><div class="big-stat__lbl">${lv.xp} XP · còn ${lv.toNext} XP lên cấp</div></div>
    </div>

    <!-- CỘT ĐÔI: LỘ TRÌNH + HUY HIỆU -->
    <div class="dash-cols">
      <div>
        <div class="section-title">🗺️ Lộ trình theo giai đoạn <a class="section-title__link" href="#/learn">Chi tiết →</a></div>
        <div class="phase-list">
          ${PHASES.map(p => {
            const pr = phaseProgress(content, p.mods);
            return `<a class="phase" href="#/learn">
              <div class="phase__num">${p.n}</div>
              <div class="phase__body">
                <div class="phase__title">${esc(p.title)}</div>
                <div class="phase__desc">${esc(p.desc)}</div>
                <div class="phase__bar"><div class="progress"><div class="progress__bar" style="width:${pr.pct}%"></div></div><span>${pr.read}/${pr.total} bài</span></div>
              </div>
              <div class="phase__pct">${pr.pct}%</div>
            </a>`;
          }).join('')}
        </div>

        ${nextLesson ? `
        <div class="section-title" style="margin-top:26px">🚀 Bắt đầu từ đây</div>
        <a class="continue-item" href="#/learn/${nextLesson.num}">
          <div class="continue-item__ic">${nextLesson.icon}</div>
          <div class="continue-item__body">
            <div class="continue-item__title">Mục ${nextLesson.num}. ${esc(nextLesson.title)}</div>
            <div class="continue-item__meta">Bài học tiếp theo trong lộ trình của bạn</div>
          </div>
          <div class="continue-item__arrow">→</div>
        </a>` : ''}
      </div>

      <div>
        <div class="section-title">🏅 Huy hiệu <span class="chip chip--primary">${unlocked}/${achs.length}</span></div>
        <div class="badges">
          ${achs.map(a => `
            <div class="badge ${a.on ? 'is-on' : ''}" title="${esc(a.t)} — ${esc(a.d)}">
              <div class="badge__ic">${a.on ? a.ic : '🔒'}</div>
              <div class="badge__t">${esc(a.t)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

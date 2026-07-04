/* =========================================================================
   dashboard.js — Trang chủ: tổng quan ngày học, ôn tập, tiếp tục học.
   ========================================================================= */

import { getCachedContent } from '../content.js';
import { getState, isLessonRead, today, addDays } from '../storage.js';
import { counts } from '../srs.js';
import { QUIZZES } from '../data/quizzes.js';
import { EXERCISES } from '../data/exercises.js';
import { esc } from '../util.js';

export const title = 'Trang chủ';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function heatmap(reviewLog) {
  const WEEKS = 16;
  const cells = [];
  const end = today();
  // căn về Chủ nhật gần nhất để cột thẳng hàng
  const total = WEEKS * 7;
  for (let i = total - 1; i >= 0; i--) {
    const d = addDays(end, -i);
    const n = reviewLog[d] || 0;
    const lvl = n === 0 ? 0 : n < 4 ? 1 : n < 10 ? 2 : 3;
    cells.push(`<div class="heat-cell" data-lvl="${lvl}" title="${d}: ${n} lượt ôn"></div>`);
  }
  return `<div class="heatmap">${cells.join('')}</div>
    <div class="heat-legend"><span>Ít</span>
      <div class="heat-cell" data-lvl="0"></div><div class="heat-cell" data-lvl="1"></div>
      <div class="heat-cell" data-lvl="2"></div><div class="heat-cell" data-lvl="3"></div>
      <span>Nhiều</span></div>`;
}

export function render(root) {
  const state = getState();
  const content = getCachedContent();
  const c = counts();
  const lessons = content ? content.lessons.filter(l => l.kind === 'lesson') : [];
  const readCount = lessons.filter(l => isLessonRead(l.id)).length;
  const totalLessons = lessons.length;
  const nextLessons = lessons.filter(l => !isLessonRead(l.id)).slice(0, 3);
  const lessonPct = totalLessons ? Math.round(readCount / totalLessons * 100) : 0;

  // Hero ôn tập
  const heroInner = c.todo > 0 ? `
    <div class="hero__label">Ôn tập hôm nay</div>
    <h2>Đến giờ ôn lại rồi 🧠</h2>
    <p>Học rồi sẽ quên — ôn đúng lúc để nhớ lâu. Hôm nay bạn có thẻ cần xem lại.</p>
    <div class="hero__row">
      <div><div class="hero__due-num">${c.todo}</div><div class="hero__due-sub">${c.due} đến hạn · ${c.fresh} thẻ mới</div></div>
      <a class="btn btn--primary btn--lg" href="#/review">Ôn tập ngay →</a>
    </div>` : `
    <div class="hero__label">Ôn tập hôm nay</div>
    <h2>Xong hết rồi! 🎉</h2>
    <p>Không còn thẻ nào đến hạn hôm nay. Học thêm bài mới để nạp thẻ vào lịch ôn, hoặc quay lại vào ngày mai.</p>
    <div class="hero__row">
      <a class="btn btn--primary btn--lg" href="#/learn">Học bài mới →</a>
    </div>`;

  const continueHTML = nextLessons.length ? nextLessons.map(l => `
    <a class="continue-item" href="#/learn/${l.num}">
      <div class="continue-item__ic">${l.icon}</div>
      <div class="continue-item__body">
        <div class="continue-item__title">Mục ${l.num}. ${esc(l.title)}</div>
        <div class="continue-item__meta">${esc(l.summary || 'Bài học').slice(0, 74)}…</div>
      </div>
      <div class="continue-item__arrow">→</div>
    </a>`).join('') : `
    <div class="continue-item" style="cursor:default">
      <div class="continue-item__ic">✅</div>
      <div class="continue-item__body">
        <div class="continue-item__title">Đã đọc hết mọi bài học!</div>
        <div class="continue-item__meta">Giờ tập trung vào luyện tập và ôn tập nhé.</div>
      </div>
    </div>`;

  root.innerHTML = `
  <div class="page">
    <div class="page-head">
      <div class="eyebrow">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <h1>${greeting()}! 👋</h1>
      <p>Sẵn sàng thành thạo Helix Core cho Unreal Engine chưa? Mỗi ngày một chút, đều đặn là chìa khoá.</p>
    </div>

    <div class="dash-grid">
      <div class="dash-col">
        <div class="hero">${heroInner}</div>

        <div class="card">
          <div class="section-title">📚 Tiếp tục học
            <span class="chip">${readCount}/${totalLessons} bài</span>
          </div>
          <div class="progress" style="margin-bottom:16px"><div class="progress__bar" style="width:${lessonPct}%"></div></div>
          <div style="display:flex;flex-direction:column;gap:10px">${continueHTML}</div>
        </div>

        <div>
          <div class="section-title">⚡ Bắt đầu nhanh</div>
          <div class="quick-grid">
            <a class="quick-card" href="#/learn"><span class="quick-card__ic">📖</span><span class="quick-card__t">Học bài</span><span class="quick-card__d">${totalLessons} bài theo lộ trình</span></a>
            <a class="quick-card" href="#/practice"><span class="quick-card__ic">🎯</span><span class="quick-card__t">Làm quiz</span><span class="quick-card__d">${QUIZZES.length} bộ trắc nghiệm</span></a>
            <a class="quick-card" href="#/practice/exercises"><span class="quick-card__ic">🧩</span><span class="quick-card__t">Bài tập</span><span class="quick-card__d">${EXERCISES.length} tình huống thực hành</span></a>
            <a class="quick-card" href="#/review"><span class="quick-card__ic">🔁</span><span class="quick-card__t">Ôn tập</span><span class="quick-card__d">${c.todo} thẻ chờ hôm nay</span></a>
          </div>
        </div>
      </div>

      <div class="dash-col">
        <div class="mini-stats">
          <div class="mini-stat"><div class="mini-stat__top">🔥 Chuỗi ngày</div><div class="mini-stat__val">${state.streak.current}</div><div class="mini-stat__sub">Dài nhất: ${state.streak.longest} ngày</div></div>
          <div class="mini-stat"><div class="mini-stat__top">⚡ Kinh nghiệm</div><div class="mini-stat__val">${state.xp}</div><div class="mini-stat__sub">XP tích luỹ</div></div>
          <div class="mini-stat"><div class="mini-stat__top">🃏 Đã thuộc</div><div class="mini-stat__val">${c.learned}<span style="font-size:15px;color:var(--text-3)">/${c.total}</span></div><div class="mini-stat__sub">${c.mature} thẻ nhớ lâu</div></div>
          <div class="mini-stat"><div class="mini-stat__top">✅ Hoàn thành</div><div class="mini-stat__val">${lessonPct}%</div><div class="mini-stat__sub">${readCount}/${totalLessons} bài học</div></div>
        </div>

        <div class="card">
          <div class="section-title">🗓️ Lịch sử ôn tập</div>
          ${heatmap(state.reviewLog)}
        </div>

        <div class="card">
          <div class="section-title">💡 Mẹo hôm nay</div>
          <p style="color:var(--text-2);font-size:14px;margin:0">${randomTip()}</p>
        </div>
      </div>
    </div>
  </div>`;
}

function randomTip() {
  const tips = [
    'Asset Unreal (<code>.uasset</code>, <code>.umap</code>) phải là <strong>binary+l</strong> — đây là lý do then chốt dùng Perforce.',
    'Luôn <strong>sync đầu ngày</strong> và <strong>sync lại trước khi submit</strong> để tránh làm trên bản cũ.',
    'Đổi tên/di chuyển asset phải làm <strong>trong Content Browser</strong>, không dùng Explorer hay P4V.',
    'Quy tắc vàng: <strong>1 người + 1 máy = 1 workspace</strong>.',
    'Đừng giữ <strong>lock</strong> một asset quan trọng quá lâu — bạn đang chặn cả team.',
    '<strong>Shelve</strong> giúp chuyển việc dở sang máy khác mà không cần submit.',
    'Với asset nhị phân, resolve chỉ có <strong>Accept Yours / Theirs</strong> — nên lock để tránh conflict từ đầu.',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

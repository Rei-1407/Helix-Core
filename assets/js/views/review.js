/* =========================================================================
   review.js — Phiên ôn tập lặp lại ngắt quãng bằng flashcard.
   ========================================================================= */

import { buildSession, applyGrade, cardById, counts, previewIntervals, GRADE } from '../srs.js';
import { getState } from '../storage.js';
import { esc, toast } from '../util.js';

export const title = 'Ôn tập';

export function render(root) {
  cleanup();                                   // gỡ listener của phiên trước (nếu bấm "Ôn tiếp")
  let queue = buildSession();
  if (!queue.length) return renderEmpty(root);

  const totalPlanned = queue.length;
  let pos = 0, done = 0, again = 0;
  let flipped = false;

  function current() { return cardById(queue[pos]); }

  function paint() {
    const card = current();
    const remaining = queue.length - pos;
    const pct = Math.round(done / (done + remaining) * 100);

    root.innerHTML = `
    <div class="page"><div class="review-stage">
      <div class="review-bar">
        <a class="btn btn--ghost" href="#/dashboard" style="padding:8px 14px">✕</a>
        <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>
        <div class="review-bar__nums"><b>${done}</b> đã ôn · ${remaining} còn lại</div>
      </div>

      <div class="flashcard" id="flashcard">
        <div class="flashcard__inner">
          <div class="flashcard__face flashcard__face--front">
            <div class="flashcard__label">Câu hỏi · Mục ${card.topic}</div>
            <div class="flashcard__q">${card.q}</div>
            <div class="flashcard__hint">👆 Bấm vào thẻ (hoặc phím Space) để xem đáp án</div>
          </div>
          <div class="flashcard__face flashcard__face--back">
            <div class="flashcard__label flashcard__label--a">Đáp án</div>
            <div class="flashcard__a">${card.a}</div>
          </div>
        </div>
      </div>

      <div id="gradeSlot"></div>
    </div></div>`;

    flipped = false;
    root.querySelector('#flashcard').addEventListener('click', flip);
  }

  function flip() {
    if (flipped) return;
    flipped = true;
    root.querySelector('#flashcard').classList.add('is-flipped');
    const iv = previewIntervals(queue[pos]);
    root.querySelector('#gradeSlot').innerHTML = `
      <div class="grade-row">
        <button class="grade-btn grade-btn--again" data-g="0">Quên<small>${iv.again}</small></button>
        <button class="grade-btn grade-btn--hard" data-g="1">Khó<small>${iv.hard}</small></button>
        <button class="grade-btn grade-btn--good" data-g="2">Được<small>${iv.good}</small></button>
        <button class="grade-btn grade-btn--easy" data-g="3">Dễ<small>${iv.easy}</small></button>
      </div>`;
    root.querySelectorAll('.grade-btn').forEach(b => b.addEventListener('click', () => grade(parseInt(b.dataset.g, 10))));
  }

  function grade(g) {
    const id = queue[pos];
    applyGrade(id, g);
    done++;
    if (g === GRADE.AGAIN) { again++; queue.push(id); } // ôn lại cuối phiên
    pos++;
    if (pos >= queue.length) return finish();
    paint();
  }

  function finish() {
    const c = counts();
    root.innerHTML = `
    <div class="page"><div class="quiz-result">
      <div style="font-size:60px;margin-bottom:10px">🎉</div>
      <h2>Hoàn thành phiên ôn tập!</h2>
      <p>Bạn đã ôn <strong>${done}</strong> lượt thẻ${again ? ` (trong đó ${again} thẻ cần xem lại)` : ''}.<br>
      <span style="font-size:13px;color:var(--text-3)">Còn ${c.due} thẻ đến hạn · ${c.fresh} thẻ mới có thể học tiếp</span></p>
      <div class="quiz-result__btns">
        <a class="btn btn--ghost" href="#/dashboard">Về trang chủ</a>
        ${c.todo > 0 ? '<button class="btn btn--primary" id="more">Ôn tiếp →</button>' : '<a class="btn btn--primary" href="#/learn">Học bài mới →</a>'}
      </div>
    </div></div>`;
    root.querySelector('#more')?.addEventListener('click', () => render(root));
    toast('🔁 Đã lưu tiến độ ôn tập. Hẹn gặp lại ngày mai!', 'xp');
  }

  // Phím tắt: Space để lật, 1-4 để chấm
  const onKey = (e) => {
    if (e.code === 'Space') { e.preventDefault(); if (!flipped) flip(); }
    else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade(parseInt(e.key, 10) - 1);
  };
  document.addEventListener('keydown', onKey);
  cleanupKey = () => document.removeEventListener('keydown', onKey);

  paint();
}

function renderEmpty(root) {
  const st = getState();
  const c = counts();
  root.innerHTML = `
  <div class="page"><div class="empty">
    <div class="empty__ic">🌤️</div>
    <h3>Không còn thẻ nào để ôn hôm nay</h3>
    <p>Tuyệt vời! Bạn đã ôn hết các thẻ đến hạn. ${c.learned < c.total ? 'Học thêm bài mới để nạp thẻ vào lịch ôn nhé.' : 'Bạn đã đưa toàn bộ thẻ vào guồng ôn tập.'}</p>
    <div style="display:flex;gap:12px;justify-content:center">
      <a class="btn btn--ghost" href="#/dashboard">Về trang chủ</a>
      <a class="btn btn--primary" href="#/learn">Học bài mới →</a>
    </div>
    <p style="margin-top:24px;font-size:12.5px">🔥 Chuỗi hiện tại: ${st.streak.current} ngày · Đã thuộc ${c.learned}/${c.total} thẻ</p>
  </div></div>`;
}

let cleanupKey = null;
export function cleanup() { if (cleanupKey) { cleanupKey(); cleanupKey = null; } }

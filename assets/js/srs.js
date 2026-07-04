/* =========================================================================
   srs.js — Spaced Repetition (lặp lại ngắt quãng), biến thể SM-2.
   Ý tưởng: thẻ trả lời tốt sẽ giãn cách ngày càng xa; thẻ quên sẽ quay lại sớm.
   Nhờ vậy "học xong rồi quên" được nhắc ôn đúng lúc, mỗi ngày một ít.
   ========================================================================= */

import { getState, save, today, addDays, addXp, touchStreak, logReview, notify } from './storage.js';
import { FLASHCARDS } from './data/flashcards.js';

export const GRADE = { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 3 };

/** Trạng thái mặc định cho thẻ chưa từng học. */
function newCardState() {
  return { ef: 2.5, interval: 0, reps: 0, due: today(), lapses: 0, lastReview: null };
}

/** Áp thuật toán SM-2 khi người dùng chấm điểm một thẻ. */
export function applyGrade(cardId, grade) {
  const st = getState();
  const c = st.srs[cardId] ? { ...st.srs[cardId] } : newCardState();

  if (grade === GRADE.AGAIN) {
    c.reps = 0;
    c.interval = 0;                 // quay lại trong phiên hôm nay
    c.lapses += 1;
    c.ef = Math.max(1.3, c.ef - 0.2);
    c.due = today();
  } else {
    // map sang thang chất lượng q (0..5) của SM-2
    const q = grade === GRADE.HARD ? 3 : grade === GRADE.GOOD ? 4 : 5;
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    c.reps += 1;
    if (c.reps === 1) c.interval = grade === GRADE.EASY ? 2 : 1;
    else if (c.reps === 2) c.interval = grade === GRADE.HARD ? 4 : 6;
    else {
      const factor = grade === GRADE.HARD ? 1.2 : c.ef;
      c.interval = Math.round(c.interval * factor);
    }
    c.interval = Math.min(c.interval, 365);
    c.due = addDays(today(), c.interval);
  }

  c.lastReview = today();
  st.srs[cardId] = c;

  // Thưởng XP + streak + log
  const gained = grade === GRADE.AGAIN ? 2 : grade === GRADE.EASY ? 6 : 5;
  addXp(gained);
  touchStreak();
  logReview(1);
  save(); notify();
  return c;
}

/** Các thẻ đã đến hạn ôn (due <= hôm nay) và đã từng học. */
export function getDueCards() {
  const st = getState();
  const t = today();
  return FLASHCARDS.filter(card => {
    const s = st.srs[card.id];
    return s && s.due <= t;
  });
}

/** Thẻ mới (chưa từng học) — giới hạn theo newPerDay, ưu tiên theo thứ tự bài. */
export function getNewCards(limit) {
  const st = getState();
  const cap = limit ?? st.newPerDay;
  const fresh = FLASHCARDS.filter(card => !st.srs[card.id]);
  return fresh.slice(0, cap);
}

/**
 * Hàng đợi phiên ôn hôm nay = thẻ đến hạn + một ít thẻ mới.
 * Trộn nhẹ để không nhàm nhưng vẫn ưu tiên thẻ đến hạn trước.
 */
export function buildSession(opts = {}) {
  const includeNew = opts.includeNew ?? true;
  const due = getDueCards();
  const fresh = includeNew ? getNewCards(opts.newLimit) : [];
  const queue = [...due, ...fresh];
  return queue.map(c => c.id);
}

/** Đếm nhanh cho badge/dashboard. */
export function counts() {
  const st = getState();
  const due = getDueCards().length;
  const fresh = getNewCards().length;
  const learned = FLASHCARDS.filter(c => st.srs[c.id]).length;
  const mature = FLASHCARDS.filter(c => st.srs[c.id] && st.srs[c.id].interval >= 21).length;
  return { due, fresh, learned, mature, total: FLASHCARDS.length, todo: due + fresh };
}

/** Tra một thẻ theo id. */
export function cardById(id) { return FLASHCARDS.find(c => c.id === id); }

/** Nhãn hạn kế tiếp cho từng mức chấm (hiển thị trên nút). */
export function previewIntervals(cardId) {
  const st = getState();
  const base = st.srs[cardId] ? { ...st.srs[cardId] } : newCardState();
  const fmt = (days) => {
    if (days <= 0) return '<10 phút';
    if (days === 1) return '1 ngày';
    if (days < 30) return `${days} ngày`;
    if (days < 365) return `${Math.round(days / 30)} tháng`;
    return `${(days / 365).toFixed(1)} năm`;
  };
  const sim = (grade) => {
    const c = { ...base };
    if (grade === GRADE.AGAIN) return 0;
    if (c.reps === 0) return grade === GRADE.EASY ? 2 : 1;
    if (c.reps === 1) return grade === GRADE.HARD ? 4 : 6;
    const factor = grade === GRADE.HARD ? 1.2 : c.ef;
    return Math.min(365, Math.round(c.interval * factor));
  };
  return {
    again: fmt(sim(GRADE.AGAIN)),
    hard: fmt(sim(GRADE.HARD)),
    good: fmt(sim(GRADE.GOOD)),
    easy: fmt(sim(GRADE.EASY)),
  };
}

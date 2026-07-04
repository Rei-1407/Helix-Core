/* =========================================================================
   achievements.js — Danh sách huy hiệu (thành tựu) dùng chung cho
   Trang chủ và trang Tiến độ.
   ========================================================================= */

import { getState, isLessonRead, levelInfo } from './storage.js';
import { counts } from './srs.js';
import { getCachedContent } from './content.js';
import { QUIZZES } from './data/quizzes.js';

export function computeAchievements() {
  const state = getState();
  const content = getCachedContent();
  const c = counts();
  const lv = levelInfo();
  const lessons = content ? content.lessons.filter(l => l.kind === 'lesson') : [];
  const read = lessons.filter(l => isLessonRead(l.id)).length;
  const quizDone = Object.keys(state.quizStats).length;
  const perfect = Object.values(state.quizStats).some(s => s.best === 100);

  return [
    { ic: '🌱', t: 'Bước đầu tiên', d: 'Hoàn thành bài học đầu tiên', on: read >= 1 },
    { ic: '🧱', t: 'Nền tảng vững', d: 'Hoàn thành 3 bài học', on: read >= 3 },
    { ic: '📚', t: 'Nửa chặng đường', d: 'Hoàn thành 50% bài học', on: lessons.length && read >= lessons.length / 2 },
    { ic: '🎓', t: 'Đọc trọn tài liệu', d: 'Hoàn thành tất cả bài học', on: lessons.length && read >= lessons.length },
    { ic: '🔥', t: 'Chuỗi 3 ngày', d: 'Học 3 ngày liên tục', on: state.streak.longest >= 3 },
    { ic: '🏅', t: 'Bền bỉ 7 ngày', d: 'Học 7 ngày liên tục', on: state.streak.longest >= 7 },
    { ic: '🎯', t: 'Điểm tuyệt đối', d: 'Đạt 100% một bộ quiz', on: perfect },
    { ic: '🛠️', t: 'Thợ thực hành', d: `Làm ${QUIZZES.length} bộ quiz`, on: quizDone >= QUIZZES.length },
    { ic: '🃏', t: 'Ôn tập kỳ', d: 'Có 10 thẻ nhớ lâu', on: c.mature >= 10 },
    { ic: '💎', t: 'Thuộc trọn tài liệu', d: 'Đưa hết thẻ vào guồng ôn', on: c.total && c.learned >= c.total },
    { ic: '⚡', t: 'Chăm chỉ', d: 'Đạt 300 XP (lên cấp 2)', on: lv.xp >= 300 },
    { ic: '👑', t: 'Bậc thầy Helix', d: 'Đạt 900 XP (cấp 4)', on: lv.xp >= 900 },
  ];
}

/* =========================================================================
   lessons.js — Metadata bổ trợ cho bài học.
   Nội dung CHỮ của bài học được đọc trực tiếp từ content/helix-core.md
   (xem content.js). File này chỉ định nghĩa: icon, cách gom nhóm thành
   "module", và thứ tự học. Khi bạn thay tài liệu, chỉ cần chỉnh icon/nhóm ở đây.
   ========================================================================= */

// Icon cho từng mục (theo số thứ tự "## N." trong tài liệu).
export const LESSON_ICONS = {
  1: '🧭', 2: '🧩', 3: '🔑', 4: '🔌', 5: '🗂️', 6: '⚙️',
  7: '🔄', 8: '🤝', 9: '📦', 10: '🎮', 11: '🚀', 12: '🌿',
  13: '👥', 14: '⭐', 15: '🛠️', 16: '⌨️', 17: '📖',
};

// Gom các mục thành module để sidebar gọn gàng, có lộ trình rõ ràng.
export const MODULES = [
  {
    id: 'm1', title: 'Nền tảng',
    desc: 'Hiểu bản chất Helix Core và các khái niệm cốt lõi.',
    lessons: [1, 2, 3],
  },
  {
    id: 'm2', title: 'Bắt đầu',
    desc: 'Cài đặt, kết nối và cấu hình cho dự án Unreal.',
    lessons: [4, 5, 6],
  },
  {
    id: 'm3', title: 'Vận hành hàng ngày',
    desc: 'Vòng lặp công việc, resolve, shelve, tích hợp editor.',
    lessons: [7, 8, 9, 10],
  },
  {
    id: 'm4', title: 'Nâng cao',
    desc: 'UnrealGameSync và chiến lược branching bằng streams.',
    lessons: [11, 12],
  },
  {
    id: 'm5', title: 'Vai trò & thực hành tốt',
    desc: 'Việc của từng vai trò, best practices, xử lý sự cố.',
    lessons: [13, 14, 15],
  },
  {
    id: 'm6', title: 'Tra cứu nhanh',
    desc: 'Bảng lệnh CLI và thuật ngữ.',
    lessons: [16, 17],
  },
];

// id ổn định cho việc lưu tiến độ.
export const lessonId = (num) => `lesson-${num}`;

// Tra module chứa một bài.
export function moduleOf(num) {
  return MODULES.find(m => m.lessons.includes(num));
}

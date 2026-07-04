/* =========================================================================
   lessons.js — Metadata bổ trợ cho bài học (bám theo tài liệu v2.0, 19 mục).
   Nội dung CHỮ đọc trực tiếp từ content/helix-core.md (xem content.js).
   File này chỉ định nghĩa: icon, cách gom nhóm "module", và thứ tự học.
   ========================================================================= */

// Icon cho từng mục (theo số thứ tự "## N." trong tài liệu).
export const LESSON_ICONS = {
  1: '🧭', 2: '🧩', 3: '🔑', 4: '🔌', 5: '🗂️', 6: '⚙️',
  7: '🔄', 8: '🤝', 9: '📦', 10: '🎮', 11: '🗺️', 12: '🚀',
  13: '🌿', 14: '👥', 15: '🖥️', 16: '⭐', 17: '🛠️', 18: '⌨️', 19: '📖',
};

// Gom các mục thành module để sidebar gọn gàng, có lộ trình rõ ràng.
export const MODULES = [
  {
    id: 'm1', title: 'Nền tảng',
    desc: 'Hiểu bản chất Perforce P4 và các khái niệm cốt lõi.',
    lessons: [1, 2, 3],
  },
  {
    id: 'm2', title: 'Bắt đầu',
    desc: 'Cài đặt, kết nối, tạo workspace và cấu hình cho Unreal.',
    lessons: [4, 5, 6],
  },
  {
    id: 'm3', title: 'Vận hành hàng ngày',
    desc: 'Workflow, resolve, shelve, tích hợp trong Unreal Editor.',
    lessons: [7, 8, 9, 10],
  },
  {
    id: 'm4', title: 'Làm việc nhóm trên UE',
    desc: 'OFPA & World Partition, UnrealGameSync (UGS).',
    lessons: [11, 12],
  },
  {
    id: 'm5', title: 'Nâng cao & vận hành',
    desc: 'Streams/branching, việc theo vai trò, dựng server.',
    lessons: [13, 14, 15],
  },
  {
    id: 'm6', title: 'Thực hành tốt & sự cố',
    desc: 'Best practices và cách xử lý các sự cố thường gặp.',
    lessons: [16, 17],
  },
  {
    id: 'm7', title: 'Tra cứu nhanh',
    desc: 'Bảng lệnh CLI (p4) và thuật ngữ.',
    lessons: [18, 19],
  },
];

// id ổn định cho việc lưu tiến độ.
export const lessonId = (num) => `lesson-${num}`;

// Tra module chứa một bài.
export function moduleOf(num) {
  return MODULES.find(m => m.lessons.includes(num));
}

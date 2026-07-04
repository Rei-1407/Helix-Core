# 🧬 Helix Core Academy

Nền tảng học tập nội bộ giúp thành thạo **Helix Core (Perforce)** cho studio game **Unreal Engine**.
Không chỉ đọc tài liệu — bạn học bằng **quiz**, **bài tập tình huống** và đặc biệt là **ôn tập lặp lại ngắt quãng (spaced repetition)** để *học xong không quên*.

> 🌐 Trang web: **https://rei-1407.github.io/Helix-Core/**
> Toàn bộ là web tĩnh (HTML/CSS/JS thuần) — không cần build, không cần server backend.

---

## ✨ Tính năng

| Khu vực | Mô tả |
|---|---|
| 🏠 **Trang chủ** | Tổng quan mỗi ngày: thẻ cần ôn, chuỗi ngày học (streak), XP, lịch sử ôn tập, gợi ý học tiếp. |
| 📚 **Bài học** | 17 mục tài liệu chia theo module, layout 3 cột (mục lục • nội dung • mục lục trong bài), thanh tiến độ đọc, tự đánh dấu đã đọc. |
| 🎯 **Luyện tập** | 9 bộ **quiz** trắc nghiệm có giải thích + 8 **bài tập tình huống** (sắp xếp bước / chọn nhiều / ra quyết định). |
| 🔁 **Ôn tập** | Flashcard theo thuật toán **SM-2** (giống Anki): thẻ nhớ tốt giãn cách xa dần, thẻ quên quay lại sớm. Luyện hàng ngày. |
| 📊 **Tiến độ** | Thống kê, **thành tựu (achievements)**, mức độ thành thạo theo chủ đề. |

Có sẵn **giao diện tối/sáng** (nút ở góc dưới sidebar). Tối ưu cho **desktop**.

Toàn bộ tiến độ học được lưu trong `localStorage` của trình duyệt — **theo từng máy** (không đồng bộ giữa các máy).

---

## 📂 Cấu trúc dự án

```
Helix-Core/
├── index.html                  # App shell
├── content/
│   └── helix-core.md           # 👈 TÀI LIỆU BÀI HỌC (chỉ cần sửa file này)
├── assets/
│   ├── css/style.css           # Toàn bộ giao diện
│   └── js/
│       ├── app.js              # Router + khởi động
│       ├── content.js          # Nạp & tách Markdown thành bài học
│       ├── storage.js          # Lưu tiến độ (localStorage)
│       ├── srs.js              # Thuật toán ôn tập lặp lại ngắt quãng
│       ├── util.js
│       ├── data/
│       │   ├── lessons.js      # Icon + gom nhóm module cho bài học
│       │   ├── quizzes.js      # 👈 Câu hỏi trắc nghiệm
│       │   ├── flashcards.js   # 👈 Thẻ ôn tập
│       │   └── exercises.js    # 👈 Bài tập tình huống
│       ├── lib/marked.min.js   # Bộ parse Markdown (MIT)
│       └── views/              # dashboard / learn / practice / review / progress
└── .nojekyll                   # Cho GitHub Pages phục vụ đúng file
```

---

## ✏️ Cách bổ sung / thay tài liệu (quan trọng)

Bạn nói sẽ thay tài liệu sau — dưới đây là cách làm, **không cần biết code**:

### 1. Thay nội dung bài học
Chỉ cần **sửa file [`content/helix-core.md`](content/helix-core.md)**. Quy tắc:

- Mỗi bài học là một heading cấp 2 đánh số: `## 1. Tiêu đề`, `## 2. Tiêu đề`, …
- Các mục con dùng `### 1.1 ...` (sẽ tự thành mục lục bên phải).
- Bảng, khối code ```` ``` ````, danh sách, **in đậm**, `code` đều hiển thị đẹp.
- Lưu file → tải lại trang là thấy ngay. Không cần build.

> Nếu **thêm/bớt số mục**, mở [`assets/js/data/lessons.js`](assets/js/data/lessons.js) để chỉnh icon (`LESSON_ICONS`) và cách gom nhóm (`MODULES`) cho khớp.

### 2. Thêm câu hỏi ôn tập
Nội dung "xào đi xào lại" nằm ở 3 file dữ liệu — cứ thêm phần tử mới vào mảng (nhớ **id không trùng**):

- **Flashcard ôn tập** → [`assets/js/data/flashcards.js`](assets/js/data/flashcards.js)
  ```js
  { id: 'c999', topic: 7, q: 'Câu hỏi...', a: 'Đáp án (cho phép <strong>, <code>)' }
  ```
- **Quiz trắc nghiệm** → [`assets/js/data/quizzes.js`](assets/js/data/quizzes.js)
  ```js
  { q: 'Câu hỏi?', options: ['A','B','C','D'], answer: 2, explain: 'Vì sao...' }
  ```
- **Bài tập tình huống** → [`assets/js/data/exercises.js`](assets/js/data/exercises.js) (kiểu `order` / `multi` / `single`).

`topic` / `lessons` là số mục trong tài liệu — dùng để gắn câu hỏi với đúng bài và tính mức thành thạo.

---

## 🚀 Chạy thử ở máy khác / cục bộ

Vì trang dùng `fetch` để nạp Markdown, cần chạy qua **web server** (không mở trực tiếp bằng `file://`).

```bash
# Cách 1: Python (có sẵn trên hầu hết máy)
python -m http.server 4178
# rồi mở http://localhost:4178

# Cách 2: Node
npx serve
```

Hoặc chỉ cần truy cập bản đã deploy: **https://rei-1407.github.io/Helix-Core/**

---

## 🔧 Công nghệ
Web tĩnh thuần: HTML + CSS + JavaScript (ES Modules). Phụ thuộc duy nhất là [marked](https://github.com/markedjs/marked) (đã vendor sẵn, giấy phép MIT) để render Markdown. Không framework, không bước build.

*Tài liệu và sản phẩm dùng lưu hành nội bộ.*

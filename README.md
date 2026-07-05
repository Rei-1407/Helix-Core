# 🧬 Helix Core Academy

Nền tảng học **Helix Core (Perforce)** cho quy trình làm game với Unreal Engine.
Không chỉ đọc tài liệu — bạn học bằng **quiz**, **bài tập tình huống** và **ôn tập lặp lại ngắt quãng (spaced repetition)** để *học xong không quên*.

🔗 **Bản demo:** https://rei-1407.github.io/Helix-Core/

---

## ✨ Tính năng

| Khu vực | Mô tả |
|---|---|
| 🏠 **Trang chủ** | Tổng quan mỗi ngày: thẻ cần ôn, chuỗi ngày học (streak), XP, lịch sử ôn tập, gợi ý học tiếp. |
| 📚 **Bài học** | Nội dung chia theo module, layout 3 cột (mục lục • nội dung • mục lục trong bài), thanh tiến độ đọc, tự đánh dấu đã đọc. |
| 🎯 **Luyện tập** | Nhiều bộ **quiz** trắc nghiệm có giải thích + **bài tập tình huống** (sắp xếp bước / chọn nhiều / ra quyết định). |
| 🔁 **Ôn tập** | Flashcard theo thuật toán **SM-2** (giống Anki): thẻ nhớ tốt giãn cách xa dần, thẻ quên quay lại sớm. |
| 📊 **Tiến độ** | Thống kê, **thành tựu (achievements)**, mức độ thành thạo theo chủ đề. |

Có sẵn **giao diện tối/sáng**, tối ưu cho desktop. Tiến độ học lưu ngay trên trình duyệt (theo từng máy).

## 🛠 Công nghệ

Web tĩnh thuần: HTML + CSS + JavaScript (ES Modules). Dùng [marked](https://github.com/markedjs/marked) (MIT) để render Markdown. Không framework, không bước build.

## 🚀 Chạy thử tại máy

Trang nạp nội dung qua `fetch` nên cần chạy qua một web server (không mở trực tiếp bằng `file://`):

```bash
# Python (có sẵn trên hầu hết máy)
python -m http.server 4178
# rồi mở http://localhost:4178

# hoặc Node
npx serve
```

---

<p align="center"><sub>Sản phẩm của <strong>ReiX&nbsp;Labs</strong> · © 2026 ReiX Labs</sub></p>

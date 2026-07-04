/* =========================================================================
   content.js — Nạp tài liệu Markdown và tách thành các bài học.
   Chỉ cần thay file content/helix-core.md là toàn bộ bài học tự cập nhật.
   ========================================================================= */

import './lib/marked.min.js';           // side-effect: gắn globalThis.marked
import { LESSON_ICONS, lessonId } from './data/lessons.js';

const MD_PATH = 'content/helix-core.md';
const marked = globalThis.marked;

marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });

let _cache = null;   // { course, lessons, byNum }

/** Bỏ dấu tiếng Việt + slug hoá để làm id cho heading. */
function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'sec';
}

/** Render 1 khối markdown → { html, headings } (gán id cho h2/h3 để làm TOC). */
function renderBody(md) {
  const rawHtml = marked.parse(md);
  const div = document.createElement('div');
  div.innerHTML = rawHtml;
  const headings = [];
  const seen = {};
  div.querySelectorAll('h2, h3').forEach(h => {
    let id = slugify(h.textContent);
    if (seen[id]) id = `${id}-${seen[id]++}`; else seen[id] = 1;
    h.id = id;
    headings.push({ id, text: h.textContent, level: h.tagName === 'H2' ? 2 : 3 });
  });
  // Mọi liên kết ngoài mở tab mới
  div.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
  return { html: div.innerHTML, headings };
}

/** Lấy đoạn văn đầu tiên (không markdown) để làm mô tả ngắn. */
function firstParagraph(md) {
  const line = md.split('\n').map(l => l.trim())
    .find(l => l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('|') && !l.startsWith('```') && !l.startsWith('-'));
  if (!line) return '';
  return line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1').replace(/\[(.+?)\]\(.+?\)/g, '$1');
}

/** Nạp và phân tích tài liệu (có cache). */
export async function loadContent() {
  if (_cache) return _cache;

  const res = await fetch(MD_PATH, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Không tải được tài liệu (${res.status})`);
  let raw = await res.text();

  // Dọn dẹp: bỏ neo <a name>, bỏ đường kẻ ngang phân đoạn.
  raw = raw.replace(/^<a name="[^"]*"><\/a>\s*$/gm, '')
           .replace(/^---\s*$/gm, '');

  // Tách theo heading cấp 2 "## ".
  const parts = raw.split(/^## /m);
  const intro = parts.shift() || '';

  // Tiêu đề khoá học + lời mở đầu (phần trước "## " đầu tiên).
  const titleMatch = intro.match(/^#\s+(.+)$/m);
  const course = {
    title: titleMatch ? titleMatch[1].trim() : 'Helix Core',
    intro: firstParagraph(intro.replace(/^#\s+.+$/m, '')),
  };

  const lessons = [];
  let bonusCount = 0;

  for (const part of parts) {
    const nl = part.indexOf('\n');
    const headLine = (nl === -1 ? part : part.slice(0, nl)).trim();
    const body = nl === -1 ? '' : part.slice(nl + 1).trim();

    if (/^mục lục/i.test(headLine)) continue; // bỏ mục lục thủ công

    const numMatch = headLine.match(/^(\d+)\.\s+(.+)$/);
    let num, title, icon, kind;
    if (numMatch) {
      num = parseInt(numMatch[1], 10);
      title = numMatch[2].trim();
      icon = LESSON_ICONS[num] || '📄';
      kind = 'lesson';
    } else {
      // Phần phụ lục / bổ sung → bài "bonus"
      bonusCount += 1;
      num = 100 + bonusCount;
      title = headLine.replace(/^phụ lục:\s*/i, '').trim();
      icon = '🎓';
      kind = 'bonus';
    }

    const { html, headings } = renderBody(body);
    lessons.push({
      num, id: lessonId(num), title, icon, kind,
      summary: firstParagraph(body),
      html, headings,
    });
  }

  lessons.sort((a, b) => a.num - b.num);
  const byNum = Object.fromEntries(lessons.map(l => [l.num, l]));
  _cache = { course, lessons, byNum };
  return _cache;
}

export function getCachedContent() { return _cache; }

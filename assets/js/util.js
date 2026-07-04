/* =========================================================================
   util.js — Hàm tiện ích dùng chung.
   ========================================================================= */

/** Escape HTML để chèn text an toàn. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/** Tạo element từ chuỗi HTML (trả về element đầu tiên). */
export function fromHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Trộn mảng (Fisher–Yates), trả về mảng mới. */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Thông báo nổi (toast). */
let toastHost = null;
export function toast(msg, kind = '') {
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.className = 'toast-host';
    document.body.appendChild(toastHost);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (kind ? ` toast--${kind}` : '');
  t.innerHTML = msg;
  toastHost.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .3s, transform .3s';
    t.style.opacity = '0';
    t.style.transform = 'translateY(8px)';
    setTimeout(() => t.remove(), 320);
  }, 2200);
}

/** Vòng tròn tiến độ SVG (dùng cho kết quả quiz). */
export function progressRing(pct, color = 'var(--primary)') {
  const r = 62, c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return `<svg viewBox="0 0 150 150" width="150" height="150">
    <circle cx="75" cy="75" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="11"/>
    <circle cx="75" cy="75" r="${r}" fill="none" stroke="${color}" stroke-width="11"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
      transform="rotate(-90 75 75)" style="transition:stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)"/>
  </svg>`;
}

/** Định dạng số ngày → nhãn thân thiện. */
export function humanDays(days) {
  if (days <= 0) return 'hôm nay';
  if (days === 1) return 'ngày mai';
  if (days < 30) return `${days} ngày nữa`;
  if (days < 365) return `${Math.round(days / 30)} tháng nữa`;
  return `${(days / 365).toFixed(1)} năm nữa`;
}

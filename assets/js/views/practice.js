/* =========================================================================
   practice.js — Luyện tập: bộ quiz trắc nghiệm + bài tập tình huống.
   ========================================================================= */

import { getState, recordQuiz, addXp, touchStreak } from '../storage.js';
import { QUIZZES, quizById } from '../data/quizzes.js';
import { EXERCISES, exerciseById } from '../data/exercises.js';
import { esc, shuffle, toast, progressRing } from '../util.js';

export const title = 'Luyện tập';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export function render(root, params) {
  const rest = params.rest || [];
  if (rest[0] === 'quiz' && rest[1]) return renderQuiz(root, rest[1]);
  if (rest[0] === 'exercise' && rest[1]) return renderExercise(root, rest[1]);
  return renderHub(root, rest[0] === 'exercises' ? 'ex' : 'quiz');
}

/* ------------------------------ HUB ------------------------------ */
function renderHub(root, tab) {
  const stats = getState().quizStats;

  const quizCards = QUIZZES.map(q => {
    const best = stats[q.id]?.best;
    return `<a class="topic-card" href="#/practice/quiz/${q.id}">
      <div class="topic-card__ic">${q.icon}</div>
      <div class="topic-card__t">${esc(q.title)}</div>
      <div class="topic-card__d">${esc(q.desc)}</div>
      <div class="topic-card__foot">
        <span>${q.questions.length} câu hỏi</span>
        ${best != null ? `<span class="chip ${best >= 80 ? 'chip--success' : 'chip--amber'}">★ ${best}%</span>` : '<span class="chip">Chưa làm</span>'}
      </div>
    </a>`;
  }).join('');

  const exCards = EXERCISES.map(e => {
    const typeLabel = e.type === 'order' ? 'Sắp xếp bước' : e.type === 'multi' ? 'Chọn nhiều' : 'Tình huống';
    return `<a class="topic-card" href="#/practice/exercise/${e.id}">
      <div class="topic-card__ic">${e.icon}</div>
      <div class="topic-card__t">${esc(e.title)}</div>
      <div class="topic-card__d">${esc(e.prompt)}</div>
      <div class="topic-card__foot"><span class="chip chip--accent">${typeLabel}</span></div>
    </a>`;
  }).join('');

  root.innerHTML = `
  <div class="page">
    <div class="page-head">
      <h1>Luyện tập 🎯</h1>
      <p>Kiểm tra kiến thức bằng quiz, rồi rèn phản xạ xử lý tình huống thực tế trong studio.</p>
    </div>
    <div class="practice-tabs">
      <button class="practice-tab ${tab === 'quiz' ? 'is-active' : ''}" data-tab="quiz">📝 Trắc nghiệm (${QUIZZES.length})</button>
      <button class="practice-tab ${tab === 'ex' ? 'is-active' : ''}" data-tab="ex">🧩 Bài tập tình huống (${EXERCISES.length})</button>
    </div>
    <div id="tabQuiz" ${tab === 'quiz' ? '' : 'hidden'}><div class="topic-grid">${quizCards}</div></div>
    <div id="tabEx" ${tab === 'ex' ? '' : 'hidden'}><div class="topic-grid">${exCards}</div></div>
  </div>`;

  root.querySelectorAll('.practice-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tab;
      root.querySelectorAll('.practice-tab').forEach(b => b.classList.toggle('is-active', b === btn));
      root.querySelector('#tabQuiz').hidden = t !== 'quiz';
      root.querySelector('#tabEx').hidden = t !== 'ex';
      location.hash = t === 'ex' ? '#/practice/exercises' : '#/practice';
    });
  });
}

/* ------------------------------ QUIZ RUNNER ------------------------------ */
function renderQuiz(root, id) {
  const quiz = quizById(id);
  if (!quiz) return renderHub(root, 'quiz');

  const questions = shuffle(quiz.questions);
  let i = 0, score = 0, answered = false;

  function paint() {
    const q = questions[i];
    root.innerHTML = `
    <div class="page"><div class="quiz-wrap">
      <div class="quiz-top">
        <a class="btn btn--ghost" href="#/practice" style="padding:8px 14px">← Thoát</a>
        <div class="progress"><div class="progress__bar" style="width:${(i / questions.length) * 100}%"></div></div>
        <div class="quiz-top__count">Câu ${i + 1}/${questions.length}</div>
      </div>
      <div class="quiz-card">
        <div class="quiz-q__tag"><span class="chip">${quiz.icon} ${esc(quiz.title)}</span></div>
        <div class="quiz-q">${esc(q.q)}</div>
        ${q.code ? `<pre class="quiz-code"><code>${esc(q.code)}</code></pre>` : ''}
        <div id="opts">${q.options.map((o, k) =>
          `<button class="opt" data-k="${k}"><span class="opt__key">${LETTERS[k]}</span><span>${esc(o)}</span></button>`
        ).join('')}</div>
        <div id="explainSlot"></div>
        <div class="quiz-actions" id="actions"></div>
      </div>
    </div></div>`;

    answered = false;
    root.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => choose(parseInt(btn.dataset.k, 10))));
  }

  function choose(k) {
    if (answered) return;
    answered = true;
    const q = questions[i];
    const correct = q.answer;
    const opts = root.querySelectorAll('.opt');
    opts.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correct) btn.classList.add('is-correct');
      else if (idx === k) btn.classList.add('is-wrong');
    });
    const ok = k === correct;
    if (ok) score++;
    root.querySelector('#explainSlot').innerHTML = `
      <div class="quiz-explain">
        <div class="quiz-explain__head ${ok ? 'ok' : 'no'}">${ok ? '✓ Chính xác!' : '✗ Chưa đúng'}</div>
        <div>${esc(q.explain)}</div>
      </div>`;
    root.querySelector('#actions').innerHTML =
      `<button class="btn btn--primary" id="nextBtn">${i + 1 < questions.length ? 'Câu tiếp →' : 'Xem kết quả →'}</button>`;
    root.querySelector('#nextBtn').addEventListener('click', () => {
      if (i + 1 < questions.length) { i++; paint(); }
      else finish();
    });
  }

  function finish() {
    const pct = Math.round(score / questions.length * 100);
    const stat = recordQuiz(quiz.id, score, questions.length);
    const xp = score * 5 + (pct === 100 ? 20 : 0);
    addXp(xp);
    const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--amber)' : 'var(--danger)';
    const msg = pct === 100 ? 'Hoàn hảo! Bạn nắm chắc chủ đề này. 🏆'
      : pct >= 80 ? 'Rất tốt! Chỉ còn vài điểm nhỏ cần ôn lại.'
      : pct >= 50 ? 'Khá ổn — ôn lại bài rồi thử lại nhé.'
      : 'Đừng nản! Đọc lại bài học rồi quay lại chinh phục.';

    root.innerHTML = `
    <div class="page"><div class="quiz-result">
      <div class="quiz-result__ring">${progressRing(pct, color)}
        <div class="quiz-result__score"><b>${pct}%</b><span>${score}/${questions.length} đúng</span></div>
      </div>
      <h2>${esc(quiz.title)}</h2>
      <p>${msg}<br><span style="font-size:13px;color:var(--text-3)">+${xp} XP · Điểm cao nhất: ${stat.best}%</span></p>
      <div class="quiz-result__btns">
        <a class="btn btn--ghost" href="#/practice">← Danh sách</a>
        <button class="btn btn--primary" id="retake">Làm lại</button>
      </div>
    </div></div>`;
    root.querySelector('#retake').addEventListener('click', () => renderQuiz(root, id));
    if (pct >= 80) toast(`🎯 Hoàn thành quiz · <strong>+${xp} XP</strong>`, 'xp');
  }

  paint();
}

/* ------------------------------ EXERCISE RUNNER ------------------------------ */
function renderExercise(root, id) {
  const ex = exerciseById(id);
  if (!ex) return renderHub(root, 'ex');
  if (ex.type === 'order') return exOrder(root, ex);
  return exChoice(root, ex);
}

function exShell(inner) {
  return `<div class="page"><div class="quiz-wrap">
    <div class="quiz-top"><a class="btn btn--ghost" href="#/practice/exercises" style="padding:8px 14px">← Thoát</a>
      <div class="quiz-top__count" style="margin-left:auto">🧩 Bài tập tình huống</div></div>
    ${inner}
  </div></div>`;
}

function exReward(ok) {
  if (ok) { addXp(12); touchStreak(); toast('✅ Làm đúng · <strong>+12 XP</strong>', 'xp'); }
}

/* --- Kiểu ORDER: sắp xếp bước --- */
function exOrder(root, ex) {
  let order = shuffle(ex.steps.map((_, k) => k));
  // tránh trùng đúng ngẫu nhiên ngay từ đầu
  if (order.every((v, k) => v === k) && order.length > 1) order.reverse();
  let checked = false;

  function paint() {
    root.innerHTML = exShell(`
      <div class="quiz-q" style="font-size:19px">${ex.icon} ${esc(ex.title)}</div>
      <p style="color:var(--text-2);margin:8px 0 18px">${esc(ex.prompt)}</p>
      <div id="steps">${order.map((si, pos) => stepRow(ex.steps[si], pos)).join('')}</div>
      <div id="exResult"></div>
      <div class="quiz-actions" id="exActions">
        <button class="btn btn--primary" id="checkBtn">Kiểm tra thứ tự</button>
      </div>`);

    root.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
      if (checked) return;
      const pos = parseInt(b.dataset.pos, 10);
      const dir = b.dataset.move === 'up' ? -1 : 1;
      const np = pos + dir;
      if (np < 0 || np >= order.length) return;
      [order[pos], order[np]] = [order[np], order[pos]];
      paint();
    }));
    root.querySelector('#checkBtn').addEventListener('click', check);
  }

  function stepRow(text, pos) {
    return `<div class="opt" style="cursor:default" data-pos="${pos}">
      <span class="opt__key" id="key-${pos}">${pos + 1}</span>
      <span style="flex:1">${esc(text)}</span>
      <span style="display:flex;gap:4px;flex-shrink:0">
        <button class="btn btn--ghost" data-move="up" data-pos="${pos}" style="padding:4px 10px" ${pos === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn btn--ghost" data-move="down" data-pos="${pos}" style="padding:4px 10px" ${pos === order.length - 1 ? 'disabled' : ''}>↓</button>
      </span></div>`;
  }

  function check() {
    checked = true;
    const ok = order.every((si, pos) => si === pos);
    order.forEach((si, pos) => {
      const row = root.querySelector(`.opt[data-pos="${pos}"]`);
      const right = si === pos;
      row.classList.add(right ? 'is-correct' : 'is-wrong');
      row.querySelector(`#key-${pos}`).textContent = right ? '✓' : '✗';
    });
    root.querySelector('#exResult').innerHTML = `
      <div class="quiz-explain"><div class="quiz-explain__head ${ok ? 'ok' : 'no'}">${ok ? '✓ Thứ tự chính xác!' : '✗ Chưa đúng thứ tự'}</div>
      <div>${esc(ex.explain)}</div></div>`;
    root.querySelector('#exActions').innerHTML = ok
      ? `<a class="btn btn--ghost" href="#/practice/exercises">← Danh sách</a>`
      : `<button class="btn btn--primary" id="retryBtn">Thử lại</button>`;
    root.querySelector('#retryBtn')?.addEventListener('click', () => { order = shuffle(ex.steps.map((_, k) => k)); checked = false; paint(); });
    exReward(ok);
  }

  paint();
}

/* --- Kiểu MULTI (chọn nhiều) và SINGLE (chọn một) --- */
function exChoice(root, ex) {
  const multi = ex.type === 'multi';
  const opts = multi ? ex.options.map((o, k) => ({ ...o, k })) : ex.options.map((text, k) => ({ text, k, correct: k === ex.answer }));
  const shown = shuffle(opts);
  const selected = new Set();
  let checked = false;

  function paint() {
    root.innerHTML = exShell(`
      <div class="quiz-q" style="font-size:19px">${ex.icon} ${esc(ex.title)}</div>
      <p style="color:var(--text-2);margin:8px 0 4px">${esc(ex.prompt)}</p>
      <p style="color:var(--text-3);font-size:12.5px;margin-bottom:16px">${multi ? 'Chọn tất cả đáp án đúng, rồi bấm Kiểm tra.' : 'Chọn một phương án đúng nhất.'}</p>
      <div id="choiceOpts">${shown.map((o, idx) =>
        `<button class="opt" data-idx="${idx}"><span class="opt__key">${multi ? '' : LETTERS[idx]}</span><span>${esc(o.text)}</span></button>`
      ).join('')}</div>
      <div id="exResult"></div>
      <div class="quiz-actions" id="exActions">
        ${multi ? '<button class="btn btn--primary" id="checkBtn">Kiểm tra</button>' : ''}
      </div>`);

    root.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => {
      if (checked) return;
      const idx = parseInt(btn.dataset.idx, 10);
      if (multi) {
        if (selected.has(idx)) { selected.delete(idx); btn.classList.remove('is-correct'); btn.querySelector('.opt__key').textContent = ''; }
        else { selected.add(idx); btn.querySelector('.opt__key').textContent = '✓'; btn.style.borderColor = 'var(--primary)'; }
      } else {
        selected.clear(); selected.add(idx); check();
      }
    }));
    root.querySelector('#checkBtn')?.addEventListener('click', check);
  }

  function check() {
    checked = true;
    let ok = true;
    shown.forEach((o, idx) => {
      const btn = root.querySelector(`.opt[data-idx="${idx}"]`);
      btn.disabled = true;
      btn.style.borderColor = '';
      const picked = selected.has(idx);
      if (o.correct) { btn.classList.add('is-correct'); btn.querySelector('.opt__key').textContent = '✓'; if (!picked) ok = false; }
      else if (picked) { btn.classList.remove('is-correct'); btn.classList.add('is-wrong'); btn.querySelector('.opt__key').textContent = '✗'; ok = false; }
    });
    root.querySelector('#exResult').innerHTML = `
      <div class="quiz-explain"><div class="quiz-explain__head ${ok ? 'ok' : 'no'}">${ok ? '✓ Chính xác!' : '✗ Chưa đúng'}</div>
      <div>${esc(ex.explain)}</div></div>`;
    root.querySelector('#exActions').innerHTML = ok
      ? `<a class="btn btn--ghost" href="#/practice/exercises">← Danh sách</a>`
      : `<button class="btn btn--primary" id="retryBtn">Thử lại</button>`;
    root.querySelector('#retryBtn')?.addEventListener('click', () => { selected.clear(); checked = false; paint(); });
    exReward(ok);
  }

  paint();
}

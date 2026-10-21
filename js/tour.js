// tour.js — 首次使用導覽：以高亮＋懸浮文字逐一介紹功能。
// 點擊任意處 = 下一步；右下角「跳過」= 結束。看過（完成或跳過）後記在 localStorage，之後不再自動出現。

const KEY = 'ror-tour-seen';

const STEPS = [
  { target: () => document.querySelector('.record-btn'),
    text: '長按：嗶聲後錄音（至多 20 秒）\n雙擊：播放錄音\n拖曳至標題：刪除' },
  { target: () => document.getElementById('draw-btn'),
    text: '長按：選起始\n每人輪流點　點到紅色就是起始' },
  { target: () => document.getElementById('timer'),
    text: '長按：調整計時時間\n雙擊：開始/暫停計時' },
  { target: () => document.getElementById('back-btn'),
    text: '當刪除/覆蓋錄音想反悔時\n單擊：回上一步\n雙擊：重做\n長按：整個重置' },
  { target: () => document.getElementById('title'),
    text: '長按：功能簡介' },
];

const MARGIN = 12;     // 懸浮文字距離螢幕邊緣
const GAP = 14;        // 懸浮文字與高亮框的距離
const SPOT_PAD = 6;    // 高亮框比目標大一圈
const CLICK_GUARD = 250; // ms，避免剛換步驟就被同一次點擊連跳

let root, spot, tip, stepEl, textEl, nextEl;
let idx = 0, active = false, shownAt = 0;

const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch { /* 無痕模式等：忽略 */ } };

/** 第一次使用才啟動（說明視窗關閉後呼叫） */
export function startTourIfFirstTime() { if (!seen()) startTour(); }

/** 立即開始（「重播介紹」使用） */
export function startTour() {
  if (active) return;
  build();
  active = true;
  idx = 0;
  show();
  requestAnimationFrame(() => root?.classList.add('is-ready'));   // 第一步之後才開啟移動動畫
  window.addEventListener('resize', layout);
  document.addEventListener('keydown', onKey);
}

function build() {
  root = document.createElement('div');
  root.id = 'tour';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', '使用介紹');
  root.innerHTML = `
    <div class="tour-spot"></div>
    <div class="tour-tip">
      <div class="tour-step"></div>
      <div class="tour-text"></div>
      <div class="tour-next"></div>
    </div>
    <button type="button" class="tour-skip">跳過</button>`;
  spot = root.querySelector('.tour-spot');
  tip = root.querySelector('.tour-tip');
  stepEl = root.querySelector('.tour-step');
  textEl = root.querySelector('.tour-text');
  nextEl = root.querySelector('.tour-next');
  root.addEventListener('click', next);
  root.querySelector('.tour-skip').addEventListener('click', (e) => { e.stopPropagation(); end(); });
  document.body.append(root);
}

function show() {
  // 找不到目標（例如元素尚未載入）就略過該步驟
  while (idx < STEPS.length && !STEPS[idx].target()) idx++;
  if (idx >= STEPS.length) { end(); return; }
  stepEl.textContent = `${idx + 1} / ${STEPS.length}`;
  textEl.textContent = STEPS[idx].text;
  nextEl.textContent = idx === STEPS.length - 1 ? '點擊任意處完成' : '點擊任意處繼續';
  shownAt = performance.now();
  layout();
}

function layout() {
  if (!active) return;
  const el = STEPS[idx]?.target();
  if (!el) return;
  const r = el.getBoundingClientRect();

  // 高亮框
  Object.assign(spot.style, {
    left: `${r.left - SPOT_PAD}px`, top: `${r.top - SPOT_PAD}px`,
    width: `${r.width + SPOT_PAD * 2}px`, height: `${r.height + SPOT_PAD * 2}px`,
  });

  // 懸浮文字：先量尺寸，再決定放目標上方或下方（放得下的那側；兩側都放得下則放空間較大的一側）
  tip.style.maxWidth = `${Math.min(300, innerWidth - MARGIN * 2)}px`;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  const need = th + GAP + SPOT_PAD;
  const roomBelow = innerHeight - r.bottom, roomAbove = r.top;
  const below = roomBelow >= need && (roomAbove < need || roomBelow >= roomAbove);
  const top = below ? r.bottom + SPOT_PAD + GAP : Math.max(MARGIN, r.top - SPOT_PAD - GAP - th);
  const cx = r.left + r.width / 2;
  const left = Math.min(Math.max(cx - tw / 2, MARGIN), innerWidth - tw - MARGIN);
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.dataset.side = below ? 'below' : 'above';
  tip.style.setProperty('--arrow-x', `${Math.min(Math.max(cx - left, 20), tw - 20)}px`);
}

function next() {
  if (!active || performance.now() - shownAt < CLICK_GUARD) return;
  idx++;
  if (idx >= STEPS.length) end(); else show();
}

function onKey(e) {
  if (e.key === 'Escape') end();
  else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
}

function end() {
  if (!active) return;
  active = false;
  markSeen();
  window.removeEventListener('resize', layout);
  document.removeEventListener('keydown', onKey);
  root.remove();
  root = null;
}

// record-buttons.js — 8 個符號按鈕：載入 SVG、長按錄音、雙擊播放、拖到標題欄刪除
import { attachGestures } from './gestures.js';
import * as store from './store.js';
import * as playback from './playback.js';
import * as recorder from './recorder.js';
import { sounds, RECORD_BEEP_MS } from './audio.js';
import { confirmDialog } from './confirm-modal.js';
import { setDeleteMode, getBottom } from './top-bar.js';
import { showToast } from './toast.js';
import { pick } from './draw-mode.js';

// 檔名對應 data/symbols/ 內的 SVG（順序即畫面順序）
const SYMBOLS = [
  ['01-salt', '鹽 🜔'], ['02-sulfur', '硫磺 🜍'], ['03-quicklime', '生石灰 🝁'], ['04-sun', '太陽 ☉'],
  ['05-saturn', '土星 ♄'], ['06-earth', '地球 ♁'], ['07-jupiter', '木星 ♃'], ['08-mercury', '水星 ☿'],
];

const buttons = [];
let session = null;   // 目前的錄音流程 { index, released, started, ending }

export async function initRecordButtons() {
  const grid = document.getElementById('grid');
  const svgs = await Promise.all(SYMBOLS.map(([file]) => loadSvg(`data/symbols/${file}.svg`)));

  SYMBOLS.forEach(([, label], i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'record-btn';
    btn.dataset.index = i;
    btn.innerHTML = svgs[i] ?? `<span class="fallback">${label.split(' ')[1]}</span>`;
    grid.append(btn);
    buttons.push(btn);
    bindGestures(btn, i);
  });

  store.subscribe(render);
  render();
}

async function loadSvg(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return await res.text();
  } catch { return null; }   // 失敗時退回文字符號
}

/* ---------- 畫面 ---------- */
function stateOf(i) {
  if (store.isDrawing()) return store.getDrawMark(i) ?? 'draw-idle';   // 抽選模式：只看抽選標記
  return store.getActivity(i) ?? (store.hasRecording(i) ? 'recorded' : 'empty');
}
function render() {
  buttons.forEach((btn, i) => {
    const s = stateOf(i);
    btn.dataset.state = s;
    const text = { empty: '未錄製', recorded: '已錄製', recording: '錄音中', playing: '播放中', 'draw-idle': '待抽選', safe: '未選中', picked: '選中' }[s];
    btn.setAttribute('aria-label', `${SYMBOLS[i][1]}，${text}`);
  });
}

/* ---------- 手勢 ---------- */
function bindGestures(btn, i) {
  attachGestures(btn, {
    longPressMs: 450,
    doubleTapMs: 300,
    canDrag: () => !store.isDrawing() && store.hasRecording(i) && !session,   // 只有已錄製、且沒在錄音時能拖曳刪除
    onTap: () => pick(i),                                // 抽選模式下單擊 = 抽一顆
    onLongPress: () => { if (!store.isDrawing()) startRecord(i); },
    onLongPressEnd: () => releaseRecord(i),
    onDoubleTap: () => {
      if (store.isDrawing()) pick(i);                    // 快速連點也算抽選
      else if (store.hasRecording(i)) playback.play(i);
    },
    onDragStart: () => btn.classList.add('is-dragging'),
    onDrag: ({ y, dx, dy }) => {
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
      setDeleteMode(y < getBottom());                   // 進入標題欄 → 標題欄變紅
    },
    onDragEnd: ({ y, cancelled }) => {
      btn.classList.remove('is-dragging');
      btn.style.transform = '';
      const inDeleteZone = !cancelled && y < getBottom();
      setDeleteMode(false);
      if (inDeleteZone) askDelete(i);                   // 放開後才跳確認
    },
  });
}

async function askDelete(i) {
  if (await confirmDialog('確定刪除此錄音？')) { playback.stopAll(); store.deleteRecording(i); }
}

/* ---------- 錄音流程 ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startRecord(i) {
  if (!recorder.isMicReady()) { showToast('尚未取得麥克風權限，無法錄音'); return; }
  playback.stopAll();
  const s = session = { index: i, released: false, started: false, ending: false };
  store.setActivity(i, 'recording');
  sounds.recordStart();
  await sleep(RECORD_BEEP_MS + 20);                     // 等嗶聲播完再錄，避免錄進嗶聲
  if (s.released) { session = null; store.setActivity(i, null); return; }   // 嗶聲期間已放開
  s.started = recorder.startRecording(() => endRecord(s));                   // 20 秒自動停止
  if (!s.started) { session = null; store.setActivity(i, null); showToast('無法開始錄音'); }
}

function releaseRecord(i) {
  if (session?.index !== i) return;
  session.released = true;
  if (session.started) endRecord(session);
}

async function endRecord(s) {
  if (s.ending) return;
  s.ending = true;
  const result = await recorder.stopRecording();
  sounds.recordStop();
  if (session === s) session = null;
  store.setActivity(s.index, null);
  if (result) store.commitRecording(s.index, result.blob);   // 覆蓋時 store 會自動存復原點
}

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
  ['01', '鹽 🜔'], ['02', '硫磺 🜍'], ['03', '生石灰 🝁'], ['04', '太陽 ☉'],
  ['05', '土星 ♄'], ['06', '地球 ♁'], ['07', '木星 ♃'], ['08', '水星 ☿'],
];

const buttons = [];
let session = null;   // 目前的錄音流程 { index, released, started, ending }

export async function initRecordButtons() {
  const grid = document.getElementById('grid');
  const urls = await Promise.all(SYMBOLS.map(([file]) => checkImage(`data/symbols/${file}.svg`)));

  SYMBOLS.forEach(([, label], i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'record-btn';
    btn.dataset.index = i;
    // 符號是內嵌點陣圖的 SVG：不能直接內嵌進網頁（8 個檔案的內部 id 相同會互相衝突），
    // 改用 CSS mask 把圖形當成遮罩，顏色由按鈕的 color 決定，各狀態配色照舊
    btn.innerHTML = urls[i]
      ? `<span class="symbol" style="--symbol: url('${urls[i]}')"></span>`
      : `<span class="fallback">${label.split(' ')[1]}</span>`;
    grid.append(btn);
    buttons.push(btn);
    bindGestures(btn, i);
  });

  store.subscribe(render);
  render();
}

function checkImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.src);   // 回傳絕對網址：CSS 變數裡的相對路徑會以 css/ 資料夾為基準而找不到檔案
    img.onerror = () => resolve(null);   // 失敗時退回文字符號
    img.src = url;
  });
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

const MIC_MSG = {
  denied: '麥克風權限被拒絕，無法錄音。請在瀏覽器網址列的網站設定中允許麥克風',
  unsupported: '此環境無法錄音（需要 HTTPS 與支援 MediaRecorder 的瀏覽器）',
  error: '無法啟用麥克風，請確認裝置有麥克風且未被其他程式占用',
};

async function startRecord(i) {
  if (session) return;
  playback.stopAll();
  const s = session = { index: i, released: false, started: false, ending: false };
  store.setActivity(i, 'recording');
  sounds.recordStart();
  await sleep(RECORD_BEEP_MS + 20);                     // 等嗶聲播完再錄，避免錄進嗶聲
  if (s.released) { session = null; store.setActivity(i, null); return; }   // 嗶聲期間已放開
  const r = await recorder.startRecording(() => endRecord(s));               // 此刻才開麥克風；20 秒自動停止
  s.started = r.ok;
  if (!r.ok) { session = null; store.setActivity(i, null); showToast(MIC_MSG[r.reason] ?? '無法開始錄音', 3500); return; }
  if (s.released) endRecord(s);                                              // 等授權／啟動時已放開 → 立刻結束（太短會被丟棄）
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

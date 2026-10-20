// draw-mode.js — 抽選起始玩家：長按旗子進入，輪流點 8 個符號，點到紅色者為先手
import { attachGestures } from './gestures.js';
import * as store from './store.js';
import * as playback from './playback.js';
import { sounds } from './audio.js';
import { showToast } from './toast.js';

const GUIDE = '輪流點擊符號，直到出現紅色';
const RESULT_MS = 4000;          // 出現紅色後停留多久自動退出

let btn, title, titleText;
let winner = -1, marks = [], finished = false, timer = null;

export function initDrawMode() {
  btn = document.getElementById('draw-btn');
  title = document.getElementById('title');
  titleText = title.textContent;
  attachGestures(btn, {
    longPressMs: 600,
    onLongPress: enter,
    onTap: () => (store.isDrawing() ? exit() : showToast('長按旗子開始抽選起始玩家')),   // 抽選中點旗子 = 取消
  });
}

/** 均勻亂數：Uint32 對 8 取餘沒有偏差 */
function randomSlot() {
  return crypto.getRandomValues(new Uint32Array(1))[0] % store.SLOT_COUNT;
}

function enter() {
  if (store.isDrawing()) return;
  playback.stopAll();
  winner = randomSlot();                       // 一進入就決定「紅色」是哪一顆，所以點擊順序不影響公平
  marks = new Array(store.SLOT_COUNT).fill(null);
  finished = false;
  store.setDraw(marks.slice());
  btn.classList.add('is-active');
  title.textContent = GUIDE;
  title.classList.add('is-guide');
}

/** 抽選模式下點擊某顆符號（由 record-buttons 呼叫；非抽選模式時不做事） */
export function pick(i) {
  if (!store.isDrawing() || finished || marks[i]) return;
  if (i === winner) {
    marks[i] = 'picked';
    finished = true;
    sounds.drawPicked();
    title.textContent = '起始玩家出爐！';
    timer = setTimeout(exit, RESULT_MS);
  } else {
    marks[i] = 'safe';
    sounds.drawSafe();
  }
  store.setDraw(marks.slice());
}

/** 退出抽選模式，恢復原本的錄音狀態顏色與標題 */
function exit() {
  clearTimeout(timer);
  store.setDraw(null);
  btn.classList.remove('is-active');
  title.classList.remove('is-guide');
  title.textContent = titleText;
}

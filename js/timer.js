// timer.js — 倒數計時核心（以時間戳計算，不會因背景分頁節流而變慢）
import { sounds } from './audio.js';
import { closeAllModals } from './modal-base.js';
import { showGameOver } from './game-over.js';

export const DEFAULT_MINUTES = 15;

let el;
let durationMin = DEFAULT_MINUTES;
let remainingMs = durationMin * 60000;
let endAt = 0, running = false, tickId = null;
let warned3 = false, warned1 = false;

export const getDurationMin = () => durationMin;

/** 遊戲進行中：計時中，或已開始後暫停（剩餘時間介於 0 與設定時間之間） */
export const isInGame = () => running || (remainingMs > 0 && remainingMs < durationMin * 60000);

/** 計時器狀態改變時通知（開始／暫停／重置／歸零；倒數中每次更新也會呼叫） */
const listeners = new Set();
export const onTimerChange = (fn) => { listeners.add(fn); };

export function initTimer() { el = document.getElementById('timer'); reset(); }

function render() {
  const secs = Math.ceil(remainingMs / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  el.textContent = `${mm}:${ss}`;
  el.dataset.state = remainingMs <= 0 ? 'over'
    : running ? 'running'
    : remainingMs < durationMin * 60000 ? 'paused' : 'idle';
  listeners.forEach((fn) => fn());
}

function stopTicking() { clearInterval(tickId); tickId = null; running = false; }

/** 重置為目前設定的時間（並停止） */
export function reset() {
  stopTicking();
  remainingMs = durationMin * 60000;
  warned3 = remainingMs <= 180000;     // 已低於門檻就不再提示
  warned1 = remainingMs <= 60000;
  render();
}

export function setDuration(min) { durationMin = min; reset(); }

/** 整個版面重置時使用：回到預設 15 分 */
export function resetToDefault() { durationMin = DEFAULT_MINUTES; reset(); }

/** 雙擊：開始／暫停 */
export function toggle() {
  if (remainingMs <= 0) return;
  if (running) {
    remainingMs = Math.max(0, endAt - Date.now());
    stopTicking(); render();
  } else {
    endAt = Date.now() + remainingMs;
    running = true;
    tickId = setInterval(tick, 200);
    sounds.timerStart();
    render();
  }
}

function tick() {
  remainingMs = Math.max(0, endAt - Date.now());
  const secs = Math.ceil(remainingMs / 1000);
  if (!warned3 && secs <= 180) { warned3 = true; sounds.warn3(); }
  if (!warned1 && secs <= 60)  { warned1 = true; sounds.warn1(); }
  render();
  if (remainingMs <= 0) finish();
}

function finish() {
  stopTicking();
  render();
  sounds.end();
  closeAllModals();
  showGameOver(() => reset());         // 點遮罩後只重置時間（錄音保留）
}

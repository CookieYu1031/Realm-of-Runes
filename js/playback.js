// playback.js — 播放錄音（同時只播一個）與「點擊空白處停止」
import * as store from './store.js';

let audio = null;
let current = -1;

export function play(i) {
  stopAll();
  const url = store.getUrl(i);
  if (!url) return;
  const a = new Audio(url);
  audio = a; current = i;
  const end = () => { if (audio === a) stopAll(); };
  a.onended = end; a.onerror = end;
  store.setActivity(i, 'playing');
  a.play().catch(end);
}

export function stopAll() {
  if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
  if (current >= 0) { const c = current; current = -1; store.setActivity(c, null); }
}

/** 點擊任何「非操作元件」的空白處就停止播放（用 pointerdown，反應比 click 快） */
export function enableTapToStop() {
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('button, [data-control]')) stopAll();
  }, true);
}

// top-bar.js — 標題欄：返回（短按復原／長按清空）、標題長按顯示說明、刪除區視覺回饋
import { attachGestures } from './gestures.js';
import * as store from './store.js';
import * as playback from './playback.js';
import { confirmDialog } from './confirm-modal.js';
import { openIntro } from './intro-modal.js';
import { resetToDefault } from './timer.js';
import { showToast } from './toast.js';

let bar, backBtn;

export function initTopBar() {
  bar = document.getElementById('top-bar');
  backBtn = document.getElementById('back-btn');

  attachGestures(backBtn, { longPressMs: 700, onTap: undo, onLongPress: clearAll });
  attachGestures(document.getElementById('title'), { longPressMs: 700, onLongPress: openIntro });

  store.subscribe(refreshBackState);
  refreshBackState();
}

/** 供按鈕拖曳使用：標題欄變紅 / 還原 */
export const setDeleteMode = (on) => bar.classList.toggle('is-delete', on);
/** 標題欄下緣 Y 座標（手指超過就算進入刪除區） */
export const getBottom = () => bar.getBoundingClientRect().bottom;

function refreshBackState() { backBtn.classList.toggle('is-empty', !store.canUndo()); }

async function undo() {
  if (!store.canUndo()) { showToast('沒有可復原的動作'); return; }
  if (await confirmDialog('確定復原上一個動作？')) { playback.stopAll(); store.undo(); }
}

async function clearAll() {
  if (await confirmDialog('確定清空所有錄音與時間？')) {
    playback.stopAll();
    store.clearAll();
    resetToDefault();
  }
}

// top-bar.js — 標題欄：返回（單擊復原／雙擊重做／長按清空）、標題長按顯示簡介、刪除區視覺回饋
import { attachGestures } from './gestures.js';
import * as store from './store.js';
import * as playback from './playback.js';
import { confirmDialog } from './confirm-modal.js';
import { openIntro } from './intro-modal.js';
import { resetToDefault } from './timer.js';
import { showToast } from './toast.js';

const DELETE_HINT = '拖曳至此刪除';

let bar, backBtn, title, titleText, deleting = false;

export function initTopBar() {
  bar = document.getElementById('top-bar');
  backBtn = document.getElementById('back-btn');
  title = document.getElementById('title');
  titleText = title.textContent;

  // delayTap：單擊要等雙擊時間窗結束才執行，否則第一下就會跳出確認視窗、第二下點不到返回鍵
  attachGestures(backBtn, {
    longPressMs: 700, doubleTapMs: 300, delayTap: true,
    onTap: undo, onDoubleTap: redo, onLongPress: clearAll,
  });
  attachGestures(title, { longPressMs: 700, onLongPress: openIntro });

  store.subscribe(refreshBackState);
  refreshBackState();
}

/** 供按鈕拖曳使用：標題欄變紅並顯示「拖曳至此刪除」 / 還原 */
export function setDeleteMode(on) {
  if (on === deleting) return;
  deleting = on;
  bar.classList.toggle('is-delete', on);
  title.classList.toggle('is-hint', on);
  title.textContent = on ? DELETE_HINT : titleText;
}
/** 標題欄下緣 Y 座標（手指超過就算進入刪除區） */
export const getBottom = () => bar.getBoundingClientRect().bottom;

/** 沒有可復原、也沒有可重做的動作時變暗（長按清空仍可用） */
function refreshBackState() { backBtn.classList.toggle('is-empty', !store.canUndo() && !store.canRedo()); }

async function undo() {
  if (!store.canUndo()) { showToast('沒有可復原的動作'); return; }
  if (await confirmDialog('確定復原上一個動作？')) { playback.stopAll(); store.undo(); }
}

function redo() {
  if (!store.canRedo()) { showToast('沒有可重做的動作'); return; }
  playback.stopAll();
  store.redo();
  showToast('已重做');
}

async function clearAll() {
  if (await confirmDialog('確定清空所有錄音與時間？')) {
    playback.stopAll();
    store.clearAll();
    resetToDefault();
  }
}

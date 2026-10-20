// bottom-bar.js — 底部計時欄手勢：單擊開始／暫停、長按開設定
import { attachGestures } from './gestures.js';
import { initTimer, toggle } from './timer.js';
import { openTimerSettings } from './timer-modal.js';

export function initBottomBar() {
  initTimer();
  attachGestures(document.getElementById('timer'), {
    longPressMs: 600,
    onTap: toggle,
    onLongPress: openTimerSettings,
  });
}

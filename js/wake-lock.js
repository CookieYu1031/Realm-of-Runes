// wake-lock.js — 螢幕恆亮（Screen Wake Lock API）
// 切到背景時瀏覽器會自動釋放，回到前景時需重新請求；不支援的瀏覽器則靜默略過。
let lock = null;

async function acquire() {
  if (!('wakeLock' in navigator) || lock) return;
  try {
    lock = await navigator.wakeLock.request('screen');
    lock.addEventListener('release', () => { lock = null; });
  } catch { lock = null; }   // 省電模式或權限被拒時會失敗，下次互動再試
}

export function initWakeLock() {
  acquire();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquire();
  });
  // 部分瀏覽器要求使用者互動後才允許，所以第一次點擊時再試一次
  document.addEventListener('pointerdown', acquire);
}

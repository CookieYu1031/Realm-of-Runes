// game-over.js — 時間到的滿版遮罩；必須點擊才能關閉
let el, onClose = null, shownAt = 0;

export function initGameOver() {
  el = document.getElementById('game-over');
  el.addEventListener('click', () => {
    if (performance.now() - shownAt < 500) return;     // 防止剛好手指在點時誤關
    el.hidden = true;
    const cb = onClose; onClose = null;
    cb?.();
  });
}

export function showGameOver(callback) {
  onClose = callback;
  shownAt = performance.now();
  el.hidden = false;
}

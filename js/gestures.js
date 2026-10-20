// gestures.js — 通用手勢：點擊／雙擊／長按／拖曳（Pointer Events，觸控與滑鼠通用）
// 重點：以「放開」判定點擊，所以「長按」「拖曳」「雙擊」三者不會互相誤觸發。

const MOVE_TOLERANCE = 10; // px，超過視為拖曳（或取消長按）

/**
 * @param {HTMLElement} el
 * @param {object} o
 *  longPressMs  長按門檻（ms）
 *  doubleTapMs  雙擊間隔（ms），0 = 不偵測雙擊
 *  canDrag()    是否允許拖曳；不允許時，移動只會取消長按
 *  onTap / onDoubleTap / onLongPress / onLongPressEnd(cancelled)
 *  onDragStart / onDrag({x,y,dx,dy}) / onDragEnd({x,y,cancelled})
 */
export function attachGestures(el, o = {}) {
  const { longPressMs = 500, doubleTapMs = 0, canDrag = () => false } = o;
  let pid = null, phase = 'idle', sx = 0, sy = 0, timer = null, lastTapAt = 0;

  el.addEventListener('pointerdown', (e) => {
    if (pid !== null) return;                       // 只處理第一根手指
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pid = e.pointerId; phase = 'pressing'; sx = e.clientX; sy = e.clientY;
    try { el.setPointerCapture(pid); } catch { /* 指標已消失，忽略 */ }
    timer = setTimeout(() => {
      if (phase !== 'pressing') return;
      phase = 'long'; lastTapAt = 0;
      navigator.vibrate?.(25);
      o.onLongPress?.();
    }, longPressMs);
  });

  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (phase === 'pressing' && Math.hypot(dx, dy) > MOVE_TOLERANCE) {
      clearTimeout(timer);
      if (canDrag()) { phase = 'dragging'; o.onDragStart?.(); }
      else phase = 'cancelled';                     // 滑開 = 取消長按與點擊
    }
    if (phase === 'dragging') o.onDrag?.({ x: e.clientX, y: e.clientY, dx, dy });
  });

  function finish(e, cancelled) {
    if (e.pointerId !== pid) return;
    clearTimeout(timer);
    const p = phase;
    pid = null; phase = 'idle';
    if (p === 'long') o.onLongPressEnd?.(cancelled);
    else if (p === 'dragging') o.onDragEnd?.({ x: e.clientX, y: e.clientY, cancelled });
    else if (p === 'pressing' && !cancelled) {
      const now = performance.now();
      if (doubleTapMs > 0 && now - lastTapAt < doubleTapMs) { lastTapAt = 0; o.onDoubleTap?.(); }
      else { lastTapAt = now; o.onTap?.(); }
    }
  }
  el.addEventListener('pointerup', (e) => finish(e, false));
  el.addEventListener('pointercancel', (e) => finish(e, true));
  el.addEventListener('contextmenu', (e) => e.preventDefault()); // 擋長按選單
}

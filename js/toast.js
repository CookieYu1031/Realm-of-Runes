// toast.js — 簡短提示訊息
let el = null, timer = null;

export function showToast(text, ms = 1800) {
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = text;
  el.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => { el.hidden = true; }, ms);
}

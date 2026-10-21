// timer-modal.js — 計時器設定（10/15/20/30 分 + 重置）；點擊視窗外側即返回主畫面
import { openModal, closeModal } from './modal-base.js';
import { confirmDialog } from './confirm-modal.js';
import { getDurationMin, setDuration, reset } from './timer.js';

const choices = () => document.querySelectorAll('#timer-modal .choice');
let openedAt = 0;

export function initTimerModal() {
  const modal = document.getElementById('timer-modal');
  choices().forEach((btn) => btn.addEventListener('click', () => {
    setDuration(Number(btn.dataset.minutes));
    closeModal('timer-modal');
  }));
  document.getElementById('timer-reset').addEventListener('click', async () => {
    if (await confirmDialog('確定重置計時器？')) { reset(); closeModal('timer-modal'); }
  });
  // 點到半透明背景（不是視窗本體）→ 關閉。剛開啟的 400ms 內忽略，避免長按放開時被誤判
  modal.addEventListener('click', (e) => {
    if (e.target === modal && performance.now() - openedAt > 400) closeModal('timer-modal');
  });
}

export function openTimerSettings() {
  choices().forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.minutes) === getDurationMin())));
  openedAt = performance.now();
  openModal('timer-modal');
}

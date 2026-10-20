// timer-modal.js — 計時器設定（10/15/20/30 分 + 重置）
import { openModal, closeModal } from './modal-base.js';
import { confirmDialog } from './confirm-modal.js';
import { getDurationMin, setDuration, reset } from './timer.js';

const choices = () => document.querySelectorAll('#timer-modal .choice');

export function initTimerModal() {
  choices().forEach((btn) => btn.addEventListener('click', () => {
    setDuration(Number(btn.dataset.minutes));
    closeModal('timer-modal');
  }));
  document.getElementById('timer-reset').addEventListener('click', async () => {
    if (await confirmDialog('確定重置計時器？')) { reset(); closeModal('timer-modal'); }
  });
  document.getElementById('timer-cancel').addEventListener('click', () => closeModal('timer-modal'));
}

export function openTimerSettings() {
  choices().forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.minutes) === getDurationMin())));
  openModal('timer-modal');
}

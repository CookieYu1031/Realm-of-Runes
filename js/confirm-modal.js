// confirm-modal.js — 通用確認視窗：await confirmDialog('...') → true / false
import { openModal, closeModal } from './modal-base.js';

let pending = null;

export function initConfirmModal() {
  document.getElementById('confirm-yes').addEventListener('click', () => pending?.(true));
  document.getElementById('confirm-no').addEventListener('click', () => pending?.(false));
  document.addEventListener('modals:closeall', () => pending?.(false));
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    pending?.(false);                                  // 若已有未回應的，視為取消
    document.getElementById('confirm-text').textContent = message;
    openModal('confirm-modal');
    pending = (value) => { pending = null; closeModal('confirm-modal'); resolve(value); };
  });
}

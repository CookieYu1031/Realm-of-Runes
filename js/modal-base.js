// modal-base.js — Modal 開關的共用工具
export const openModal = (id) => { document.getElementById(id).hidden = false; };
export const closeModal = (id) => { document.getElementById(id).hidden = true; };

/** 關閉所有 Modal，並通知等待中的確認視窗（視為取消） */
export function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach((m) => { m.hidden = true; });
  document.dispatchEvent(new CustomEvent('modals:closeall'));
}

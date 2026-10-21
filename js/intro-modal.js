// intro-modal.js — 操作說明 Modal（長按標題開啟）：簡易操作、「重播介紹」、規則書連結、右上角 × 關閉。
import { openModal, closeModal } from './modal-base.js';
import { initAudio } from './audio.js';
import { startTour } from './tour.js';

export function initIntroModal() {
  // 瀏覽器規定「使用者互動之後」才能發聲：任何點按都順手啟動／恢復 AudioContext（可重複呼叫）
  ['pointerdown', 'pointerup'].forEach((t) => document.addEventListener(t, initAudio, true));

  document.getElementById('intro-close').addEventListener('click', () => closeModal('intro-modal'));
  document.getElementById('intro-replay').addEventListener('click', () => { closeModal('intro-modal'); startTour(); });
}

/** 顯示說明（長按標題時呼叫） */
export const openIntro = () => openModal('intro-modal');

// intro-modal.js — 操作說明 Modal；按下「同意權限並開始」才初始化 AudioContext 與麥克風
import { openModal, closeModal } from './modal-base.js';
import { initAudio } from './audio.js';
import { initMic } from './recorder.js';

const MSG = {
  denied: '麥克風權限被拒絕，無法錄音。請在瀏覽器網址列的網站設定中允許麥克風後再試一次。',
  unsupported: '此環境無法錄音（需要 HTTPS 與支援 MediaRecorder 的瀏覽器）。',
  error: '無法啟用麥克風，請確認裝置有麥克風且未被其他程式占用。',
};

let ready = false;
let startBtn, skipBtn, errorEl;

export function initIntroModal() {
  startBtn = document.getElementById('intro-start');
  skipBtn = document.getElementById('intro-skip');
  errorEl = document.getElementById('intro-error');

  startBtn.addEventListener('click', async () => {
    if (ready) { closeModal('intro-modal'); return; }
    startBtn.disabled = true;
    initAudio();                       // 必須在點擊事件「同步」階段呼叫，才符合自動播放政策
    const r = await initMic();
    startBtn.disabled = false;
    if (r.ok) { ready = true; closeModal('intro-modal'); return; }
    errorEl.textContent = MSG[r.reason] ?? MSG.error;
    errorEl.hidden = false;
    startBtn.textContent = '重新嘗試';
    skipBtn.hidden = false;
  });
  skipBtn.addEventListener('click', () => closeModal('intro-modal'));
}

/** 顯示說明（開站時由 HTML 預設顯示；長按標題時再次呼叫） */
export function openIntro() {
  startBtn.textContent = ready ? '我知道了' : '同意權限並開始';
  errorEl.hidden = true;
  skipBtn.hidden = true;
  openModal('intro-modal');
}

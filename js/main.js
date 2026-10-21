// main.js — 程式進入點：把各功能模組組裝起來
import { initConfirmModal } from './confirm-modal.js';
import { initIntroModal } from './intro-modal.js';
import { initTimerModal } from './timer-modal.js';
import { initGameOver } from './game-over.js';
import { initTopBar } from './top-bar.js';
import { initBottomBar } from './bottom-bar.js';
import { initRecordButtons } from './record-buttons.js';
import { enableTapToStop } from './playback.js';
import { initWakeLock } from './wake-lock.js';
import { initDrawMode } from './draw-mode.js';
import { startTourIfFirstTime } from './tour.js';

initConfirmModal();
initIntroModal();      // 操作說明（長按標題開啟）；同時負責在第一次點按時啟動音訊
initTimerModal();
initGameOver();
initTopBar();
initBottomBar();
enableTapToStop();
initWakeLock();
initDrawMode();        // 選起始玩家
await initRecordButtons();   // 麥克風不在這裡要權限，改成長按錄音時才開
startTourIfFirstTime();      // 第一次使用：按鈕載入完成後開始導覽

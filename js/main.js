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
import { primeMic } from './recorder.js';

initConfirmModal();
initIntroModal();      // 操作說明（長按標題開啟）；同時負責在第一次點按時啟動音訊
initTimerModal();
initGameOver();
initTopBar();
initBottomBar();
enableTapToStop();
initWakeLock();
initDrawMode();        // 選起始玩家
primeMic();                  // 一進站就先詢問一次麥克風權限（不等結果，錄音時才真正開麥克風）
await initRecordButtons();
startTourIfFirstTime();      // 第一次使用：按鈕載入完成後開始導覽

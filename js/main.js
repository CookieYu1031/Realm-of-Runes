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

initConfirmModal();
initIntroModal();      // 說明 Modal 由 HTML 預設顯示，同意後才啟動音訊與麥克風
initTimerModal();
initGameOver();
initTopBar();
initBottomBar();
enableTapToStop();
initRecordButtons();
initWakeLock();
initDrawMode();       // 抽選起始玩家      // 螢幕恆亮

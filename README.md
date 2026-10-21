# 符文之境 桌遊輔助 Web App

## 結構
    index.html            頁面骨架（含所有 Modal 標記）
    manifest.json         PWA 設定（orientation: portrait）
    css/                  一個區塊一個檔：base / top-bar / grid / bottom-bar / draw-mode / modal / toast / landscape-overlay / game-over / tour
    js/                   一個功能一個檔（ES Module，main.js 組裝）
      gestures.js           通用手勢（點擊／雙擊／長按／拖曳，Pointer Events；delayTap 讓單擊等待雙擊）
      audio.js              AudioContext 與合成嗶聲
      recorder.js           MediaRecorder（麥克風只在長按錄音期間開啟）
      history.js / store.js 復原＋重做堆疊 / 8 個錄音槽狀態
      playback.js           播放與點空白處停止
      record-buttons.js     8 顆按鈕邏輯
      top-bar.js            返回鍵（單擊復原／雙擊重做／長按清空）、標題長按、刪除區（顯示「拖曳至此刪除」）
      timer.js / timer-modal.js / bottom-bar.js   計時器核心 / 設定視窗（點外側關閉）/ 手勢（雙擊開始暫停）
      draw-mode.js          選起始玩家（旗子按鈕；選完 2 秒自動離開；計時開始後停用）
      tour.js               首次使用導覽（高亮＋懸浮文字，可跳過／從標題長按選單重播）
      wake-lock.js          螢幕恆亮
      intro-modal.js        操作說明（長按標題開啟，右上 × 關閉，含「重播介紹」「遊戲規則書.pdf」）
      confirm-modal.js / modal-base.js / toast.js / game-over.js
    data/symbols/         8 個符號 SVG（01～08，內嵌透明底黑色圖形，以 CSS mask 上色）
    data/rulebook.pdf     規則書（由規則簡介視窗開啟）
    data/icon*.png|svg    PWA 圖示

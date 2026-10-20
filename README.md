# 符文之境 桌遊輔助 Web App

純前端 PWA（無後端），可直接部署到 GitHub Pages（HTTPS）。

## 本機執行
麥克風與 ES Module 都需要 `http://localhost` 或 HTTPS，不能直接雙擊開 index.html：

    cd baobaopai
    python3 -m http.server 8000     # 然後開 http://localhost:8000

## 部署到 GitHub Pages
把整個資料夾內容推到 repo → Settings → Pages → 選分支與根目錄即可。

## 結構
    index.html            頁面骨架（含所有 Modal 標記）
    manifest.json         PWA 設定（orientation: portrait）
    css/                  一個區塊一個檔：base / top-bar / grid / bottom-bar / modal / toast / landscape-overlay / game-over
    js/                   一個功能一個檔（ES Module，main.js 組裝）
      gestures.js           通用手勢（點擊／雙擊／長按／拖曳，Pointer Events）
      audio.js              AudioContext 與合成嗶聲
      recorder.js           麥克風權限 + MediaRecorder
      history.js / store.js 復原堆疊 / 8 個錄音槽狀態
      playback.js           播放與點空白處停止
      record-buttons.js     8 顆按鈕邏輯
      top-bar.js            返回鍵（短按復原／長按清空）、標題長按、刪除區
      timer.js / timer-modal.js / bottom-bar.js   計時器核心 / 設定視窗 / 手勢
      draw-mode.js          抽選起始玩家（旗子按鈕）
      wake-lock.js          螢幕恆亮
      intro-modal.js / confirm-modal.js / modal-base.js / toast.js / game-over.js
    data/symbols/         8 個符號 SVG（純線條路徑，不依賴字型）
    data/icon*.png|svg    PWA 圖示

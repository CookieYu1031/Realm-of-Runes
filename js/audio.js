// audio.js — AudioContext 與合成音效（不需外部音檔）

let ctx = null;

/** 必須在使用者點擊的事件內呼叫（瀏覽器自動播放政策）。可重複呼叫。 */
export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
  }
  if (ctx.state !== 'running') ctx.resume();
  return true;
}

/** 播放一個嗶聲；delay 為延後秒數 */
function beep({ freq = 800, duration = 0.12, type = 'sine', volume = 0.4, delay = 0 } = {}) {
  if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume();
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // 淡入淡出，避免「啪」的爆音
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** 錄音開始嗶聲的長度（ms）：錄音器會等它播完才啟動，避免錄進嗶聲 */
export const RECORD_BEEP_MS = 130;

export const sounds = {
  recordStart: () => beep({ freq: 880, duration: 0.1 }),
  recordStop:  () => beep({ freq: 440, duration: 0.14 }),
  timerStart:  () => { beep({ freq: 660, duration: 0.12 }); beep({ freq: 880, duration: 0.15, delay: 0.14 }); },
  warn3:       () => { beep({ freq: 740, duration: 0.25 }); },
  warn1:       () => { beep({ freq: 740, duration: 0.15 }); beep({ freq: 740, duration: 0.15, delay: 0.22 }); },
  drawSafe:    () => beep({ freq: 520, duration: 0.1 }),
  drawPicked:  () => { beep({ freq: 660, duration: 0.12 }); beep({ freq: 880, duration: 0.12, delay: 0.13 }); beep({ freq: 1180, duration: 0.3, delay: 0.26 }); },
  end:         () => beep({ freq: 300, duration: 1.8, type: 'square', volume: 0.35 }),
};

// recorder.js — 麥克風權限與 MediaRecorder 錄音（每次錄音新建一個 recorder）

const MAX_MS = 20000;     // 最長 20 秒
const MIN_MS = 250;       // 太短視為誤觸，丟棄

let stream = null;
let session = null;       // { rec, done, timer, startedAt }

export const isMicReady = () => !!stream;
export const isRecording = () => !!session;

/** 請求麥克風。回傳 { ok, reason? }；可重複呼叫。 */
export async function initMic() {
  if (stream) return { ok: true };
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    return { ok: false, reason: 'unsupported' };   // 非 HTTPS 或瀏覽器太舊
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.name === 'NotAllowedError' ? 'denied' : 'error' };
  }
}

/** 挑選瀏覽器真正支援的格式（Chrome=webm、Safari=mp4），不再寫死 */
function pickMime() {
  const list = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
  return list.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
}

/** 開始錄音；達 20 秒呼叫 onLimit。回傳是否成功啟動。 */
export function startRecording(onLimit) {
  if (!stream || session) return false;
  const mime = pickMime();
  let rec;
  try { rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
  catch { return false; }
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
  // 先綁好 onstop 再 start，避免競態
  const done = new Promise((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }));
  });
  rec.start();
  session = { rec, done, startedAt: performance.now(), timer: setTimeout(() => onLimit?.(), MAX_MS) };
  return true;
}

/** 停止錄音。回傳 { blob, duration } 或 null（太短／沒在錄） */
export async function stopRecording() {
  if (!session) return null;
  const s = session; session = null;
  clearTimeout(s.timer);
  const duration = performance.now() - s.startedAt;
  if (s.rec.state !== 'inactive') s.rec.stop();
  const blob = await s.done;
  return duration >= MIN_MS && blob.size > 0 ? { blob, duration } : null;
}

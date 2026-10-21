// recorder.js — MediaRecorder 錄音。麥克風只在「長按錄音」期間開啟，錄完立刻釋放（瀏覽器的錄音指示燈會跟著熄滅）。

const MAX_MS = 20000;     // 最長 20 秒
const MIN_MS = 250;       // 太短視為誤觸，丟棄

let stream = null;        // 只在錄音期間存在
let session = null;       // { rec, done, timer, startedAt }
let starting = false;     // 正在等麥克風授權／啟動

/** 取得麥克風。回傳 { ok, stream } 或 { ok:false, reason: 'unsupported' | 'denied' | 'error' } */
async function openMic() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    return { ok: false, reason: 'unsupported' };   // 非 HTTPS 或瀏覽器太舊
  }
  try {
    return { ok: true, stream: await navigator.mediaDevices.getUserMedia({ audio: true }) };
  } catch (err) {
    return { ok: false, reason: err.name === 'NotAllowedError' ? 'denied' : 'error' };
  }
}

function closeMic() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}

/** 進站時先要一次麥克風權限（iOS 每個網站第一次都會詢問），拿到後立刻釋放，不開始錄音。 */
export async function primeMic() {
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {   // 已經允許或拒絕過就不必再問（不支援查詢的瀏覽器會直接往下走）
    const st = await navigator.permissions?.query({ name: 'microphone' });
    if (st && st.state !== 'prompt') return;
  } catch { /* 部分瀏覽器不支援查詢麥克風權限，忽略 */ }
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
  } catch { /* 拒絕或失敗都不處理，長按錄音時會再提示 */ }
}

/** 挑選瀏覽器真正支援的格式（Chrome=webm、Safari=mp4），不再寫死 */
function pickMime() {
  const list = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
  return list.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
}

/** 開啟麥克風並開始錄音；達 20 秒呼叫 onLimit。回傳 { ok } 或 { ok:false, reason } */
export async function startRecording(onLimit) {
  if (session || starting) return { ok: false, reason: 'busy' };
  starting = true;
  const m = await openMic();
  starting = false;
  if (!m.ok) return m;
  stream = m.stream;

  const mime = pickMime();
  let rec;
  try { rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
  catch { closeMic(); return { ok: false, reason: 'error' }; }
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
  // 先綁好 onstop 再 start，避免競態
  const done = new Promise((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }));
  });
  rec.start();
  session = { rec, done, startedAt: performance.now(), timer: setTimeout(() => onLimit?.(), MAX_MS) };
  return { ok: true };
}

/** 停止錄音並釋放麥克風。回傳 { blob, duration } 或 null（太短／沒在錄） */
export async function stopRecording() {
  if (!session) return null;
  const s = session; session = null;
  clearTimeout(s.timer);
  const duration = performance.now() - s.startedAt;
  if (s.rec.state !== 'inactive') s.rec.stop();
  const blob = await s.done;
  closeMic();
  return duration >= MIN_MS && blob.size > 0 ? { blob, duration } : null;
}

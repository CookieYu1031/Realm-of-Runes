// store.js — 8 個錄音槽的資料與狀態（單一資料來源）
import * as history from './history.js';

export const SLOT_COUNT = 8;

let slots = new Array(SLOT_COUNT).fill(null);          // { blob, url } | null
const activity = new Array(SLOT_COUNT).fill(null);     // 'recording' | 'playing' | null
const created = new Set();                             // 曾建立的錄音，用來回收 Blob URL
const listeners = new Set();

export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => listeners.forEach((fn) => fn());

export const hasRecording = (i) => !!slots[i];
export const getUrl = (i) => slots[i]?.url ?? null;
export const getActivity = (i) => activity[i];
export const setActivity = (i, a) => { activity[i] = a; notify(); };
export const canUndo = history.canUndo;
export const canRedo = history.canRedo;

// 抽選起始玩家模式：null = 未進入；否則為 8 格標記陣列（null | 'safe' | 'picked'）
let draw = null;
export const isDrawing = () => draw !== null;
export const getDrawMark = (i) => draw?.[i] ?? null;
export const setDraw = (marks) => { draw = marks; notify(); };

/** 存入新錄音；若是「覆蓋」，先把舊狀態放進復原堆疊（第一次錄音不可復原） */
export function commitRecording(i, blob) {
  if (slots[i]) history.push(slots.slice());
  else history.clearRedo();                     // 第一次錄音不可復原，但仍會讓重做失效
  const rec = { blob, url: URL.createObjectURL(blob) };
  created.add(rec);
  slots[i] = rec;
  collect(); notify();
}

export function deleteRecording(i) {
  if (!slots[i]) return;
  history.push(slots.slice());
  slots[i] = null;
  collect(); notify();
}

export function undo() {
  const snap = history.undo(slots.slice());
  if (!snap) return false;
  slots = snap;
  collect(); notify();
  return true;
}

export function redo() {
  const snap = history.redo(slots.slice());
  if (!snap) return false;
  slots = snap;
  collect(); notify();
  return true;
}

export function clearAll() {
  slots = new Array(SLOT_COUNT).fill(null);
  history.clear();
  collect(); notify();
}

/** 回收：不在目前槽位、也不在復原堆疊裡的錄音，釋放 Blob URL */
function collect() {
  const live = new Set(slots.filter(Boolean));
  history.all().forEach((snap) => snap.forEach((r) => r && live.add(r)));
  for (const r of created) {
    if (!live.has(r)) { URL.revokeObjectURL(r.url); created.delete(r); }
  }
}

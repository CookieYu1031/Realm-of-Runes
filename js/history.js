// history.js — 復原／重做堆疊（只存「刪除／覆蓋」之前的狀態快照）

const LIMIT = 10;
const undoStack = [];
const redoStack = [];

/** 記錄一個新動作之前的狀態；新動作會讓「重做」失效 */
export const push = (snapshot) => {
  undoStack.push(snapshot);
  if (undoStack.length > LIMIT) undoStack.shift();
  redoStack.length = 0;
};
/** 不需要存復原點、但會改變狀態的動作（例如第一次錄音）也要讓重做失效 */
export const clearRedo = () => { redoStack.length = 0; };

/** 復原：把「目前狀態」放進重做堆疊，回傳要還原成的快照 */
export function undo(current) {
  const snap = undoStack.pop();
  if (!snap) return null;
  redoStack.push(current);
  return snap;
}
/** 重做：把「目前狀態」放回復原堆疊，回傳要重做成的快照 */
export function redo(current) {
  const snap = redoStack.pop();
  if (!snap) return null;
  undoStack.push(current);
  return snap;
}

export const clear = () => { undoStack.length = 0; redoStack.length = 0; };
export const canUndo = () => undoStack.length > 0;
export const canRedo = () => redoStack.length > 0;
/** 所有仍被引用的快照（供 store 回收 Blob URL 用） */
export const all = () => [...undoStack, ...redoStack];

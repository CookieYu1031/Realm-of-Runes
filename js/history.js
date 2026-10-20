// history.js — 復原堆疊（只存「刪除／覆蓋」之前的狀態快照）

const LIMIT = 10;
const stack = [];

export const push = (snapshot) => { stack.push(snapshot); if (stack.length > LIMIT) stack.shift(); };
export const pop = () => stack.pop() ?? null;
export const clear = () => { stack.length = 0; };
export const canUndo = () => stack.length > 0;
export const all = () => stack;

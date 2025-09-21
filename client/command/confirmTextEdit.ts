import { HandleCommand } from "./type.ts";

export const confirmTextEdit: HandleCommand = (appState) => {
  // <textarea> になにを入力したかの状態がない
  return { ...appState, isTextEdit: false };
};

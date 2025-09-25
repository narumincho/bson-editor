import { HandleCommand } from "./type.ts";

export const cancelTextEdit: HandleCommand = (appState) => {
  return { ...appState, isTextEdit: false };
};

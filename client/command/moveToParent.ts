import type { HandleCommand } from "./type.ts";
import type { Selection } from "../appState.ts";

export const moveToParent: HandleCommand = (appState) => {
  if (appState.isTextEdit) {
    return appState;
  }
  return { ...appState, selection: moveToParentLoop(appState.selection) };
};

const moveToParentLoop = (
  selection: Selection,
): Selection => {
  switch (selection.type) {
    case "self":
      return { type: "self" };
    case "child":
      switch (selection.selection.type) {
        case "self":
          return { type: "self" };
        case "child":
          return {
            type: "child",
            childIndex: selection.childIndex,
            selection: moveToParentLoop(selection.selection),
          };
      }
  }
};

import { ElementValueWithError } from "../../bson/fromBsonBinary.ts";
import { elementValueWithErrorToText } from "../text.ts";
import { HandleCommand } from "./type.ts";
import type { Selection } from "../appState.ts";

export const startTextEdit: HandleCommand = (appState) => {
  return {
    ...appState,
    textEditModeText: startTextEditLoop({
      type: "document",
      value: appState.document,
    }, appState.selection),
  };
};

const startTextEditLoop = (
  element: ElementValueWithError,
  selection: Selection,
): string => {
  switch (selection.type) {
    case "self":
      return elementValueWithErrorToText(element);
    case "child":
      switch (element.type) {
        case "string":
          return elementValueWithErrorToText(element);
        case "double":
          return elementValueWithErrorToText(element);
        case "document": {
          const child = element.value.value.at(selection.childIndex);
          if (child) {
            return startTextEditLoop(child.value, selection.selection);
          }
          return elementValueWithErrorToText(element);
        }
        case "int32":
          return elementValueWithErrorToText(element);
      }
  }
};

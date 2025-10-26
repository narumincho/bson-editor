import { ElementValueWithError } from "../../bson/fromBsonBinary.ts";
import { textWithTypeToElementValueWithError } from "../text.ts";
import { HandleCommand } from "./type.ts";
import { Selection } from "../appState.ts";

export const confirmTextEdit: HandleCommand = (appState) => {
  if (!appState.textEditModeText) {
    return appState;
  }
  const newElement = confirmTextEditLoop(
    { type: "document", value: appState.document },
    appState.selection,
    appState.textEditModeText,
  );
  return {
    document: newElement.type === "document" ? newElement.value : {
      lastUnsupportedType: undefined,
      value: [{
        name: {
          notFoundEndOfFlag: false,
          originalIfInvalidUtf8Error: undefined,
          value: "???",
        },
        value: newElement,
      }],
    },
    selection: appState.selection,
    textEditModeText: undefined,
  };
};

const confirmTextEditLoop = (
  element: ElementValueWithError,
  selection: Selection,
  text: string,
): ElementValueWithError => {
  switch (selection.type) {
    case "self":
      return textWithTypeToElementValueWithError(element, text);
    case "child":
      switch (element.type) {
        case "string":
          return textWithTypeToElementValueWithError(element, text);
        case "double":
          return textWithTypeToElementValueWithError(element, text);
        case "document": {
          const child = element.value.value.at(selection.childIndex);
          if (child) {
            return confirmTextEditLoop(child.value, selection.selection, text);
          }
          return textWithTypeToElementValueWithError(element, text);
        }
        case "int32":
          return textWithTypeToElementValueWithError(element, text);
      }
  }
};

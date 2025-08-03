import { DocumentWithError } from "../bson/fromBsonBinary.ts";
import type { Selection } from "./selection.ts";

export const languages = ["en", "ja"] as const;

export const commands = [
  "moveToParent",
] as const;

export type Command = typeof commands[number];

export const handleCommand = (
  { command, selection }: {
    readonly command: Command;
    readonly selection: Selection;
    readonly document: DocumentWithError;
  },
): Selection => {
  switch (command) {
    case "moveToParent":
      return moveToParent(selection);
  }
};

export const moveToParent = (
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
            selection: moveToParent(selection.selection),
          };
      }
  }
};

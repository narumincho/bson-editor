import { DocumentWithError } from "../bson/fromBsonBinary.ts";

export type AppState = {
  readonly selection: Selection;
  readonly document: DocumentWithError;
  readonly textEditModeText: string | undefined;
};

export type Selection = { readonly type: "self" } | {
  readonly type: "child";
  readonly childIndex: number;
  readonly selection: Selection;
};

export type Selection = { readonly type: "self" } | {
  readonly type: "child";
  readonly childIndex: number;
  readonly selection: Selection;
};

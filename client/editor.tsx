import React from "react";

import { Document, Element, fromBson } from "../bson/main.ts";

type Selection = {
  readonly type: "tree";
} | {
  readonly type: "binary";
};

export const Editor = (props: {
  value: Uint8Array;
}): React.ReactElement => {
  const [editorWidth, setEditorWidth] = React.useState(400);
  const [selection, setSelection] = React.useState<ReadonlySet<number>>(
    new Set(),
  );

  const structuredBson = React.useMemo(() => fromBson(props.value), [
    props.value,
  ]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${editorWidth}px 2px 1fr`,
      }}
    >
      <div>
        <DocumentView structuredBson={structuredBson} />
      </div>
      <div
        style={{
          backgroundColor: "#444",
        }}
      >
        <div
          style={{
            width: 12,
            backgroundColor: "#888",
          }}
        >
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr ".repeat(8),
        }}
      >
        {[...props.value].map((byte, index) => (
          <div
            key={index}
            style={{
              padding: 4,
              color: index % 2 === 0 ? "#ababab" : "#c7c7c7",
              backgroundColor: selection.has(index) ? "#444" : "transparent",
            }}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                const newSelection = new Set(selection);
                if (selection.has(index)) {
                  newSelection.delete(index);
                } else {
                  newSelection.add(index);
                }
                setSelection(newSelection);
              } else {
                setSelection(new Set([index]));
              }
            }}
          >
            {byte.toString(16).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentView = ({ structuredBson }: {
  structuredBson: Document;
}): React.ReactElement => {
  return (
    <div>
      {Object.entries(structuredBson).map(([name, element], index) => (
        <div
          key={`${name}-${index}`}
          style={{
            padding: 16,
          }}
        >
          <div style={{ whiteSpace: "pre" }}>
            "{name}"
          </div>
          <div
            style={{
              padding: 8,
            }}
          >
            <ElementView element={element} />
          </div>
        </div>
      ))}
    </div>
  );
};

const ElementView = ({ element }: {
  element: Element;
}): React.ReactElement => {
  switch (typeof element) {
    case "number":
      return (
        <div>
          double {element}
        </div>
      );
    case "string":
      return (
        <div>
          string {element}
        </div>
      );
    default:
      return (
        <div>
          unsupported type
        </div>
      );
  }
};

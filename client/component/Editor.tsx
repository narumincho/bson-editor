import React, { useState } from "react";

import {
  DocumentWithError,
  ElementValueWithError as ElementValueWithError,
} from "../../bson/fromBsonBinary.ts";
import { Controller } from "./Controller.tsx";

type Selection = { readonly type: "self" } | {
  readonly type: "child";
  readonly childIndex: number;
  readonly selection: Selection;
};

export const Editor = ({ value, onChange }: {
  readonly value: DocumentWithError;
  readonly onChange: (value: DocumentWithError) => void;
}): React.ReactElement => {
  const [selection, setSelection] = useState<Selection>({ type: "self" });

  return (
    <div>
      <DocumentView
        value={value}
        selection={selection}
        onChange={onChange}
        onSelectionChange={setSelection}
      />
      <div style={{ position: "fixed", bottom: 0, width: "100%" }}>
        <Controller onReplace={onChange} />
      </div>
    </div>
  );
};

const DocumentView = ({ value, selection, onChange, onSelectionChange }: {
  readonly value: DocumentWithError;
  readonly selection: Selection | undefined;
  readonly onChange: (value: DocumentWithError) => void;
  readonly onSelectionChange: (selection: Selection) => void;
}): React.ReactElement => {
  return (
    <div>
      document
      {value.value.map((element, index) => (
        <div
          key={`${element.name.value}-${index}`}
          style={{
            padding: 16,
          }}
        >
          <div style={{ whiteSpace: "pre" }}>
            "{element.name.value}"
          </div>
          <div
            style={{
              padding: 8,
            }}
          >
            <ElementViewContainer
              value={element.value}
              selection={selection?.type === "child" &&
                  selection.childIndex === index
                ? selection.selection
                : undefined}
              onChange={(element) => {
                onChange({
                  lastUnsupportedType: value.lastUnsupportedType,
                  value: [
                    ...value.value.slice(0, index),
                    {
                      name: {
                        value: "",
                        notFoundEndOfFlag: false,
                        originalIfInvalidUtf8Error: undefined,
                      },
                      value: element,
                    },
                    ...value.value.slice(index + 1),
                  ],
                });
              }}
              onSelectionChange={function (selection: Selection): void {
                onSelectionChange({
                  type: "child",
                  childIndex: index,
                  selection,
                });
              }}
            />
          </div>
        </div>
      ))}
      {value.lastUnsupportedType !== undefined
        ? (
          <div
            key={`${value.lastUnsupportedType.name.value}-lastUnsupportedType`}
            style={{
              padding: 16,
            }}
          >
            <div style={{ whiteSpace: "pre" }}>
              "{value.lastUnsupportedType.name.value}"
            </div>
            <div
              style={{
                padding: 8,
              }}
            >
              unsupported type
            </div>
          </div>
        )
        : undefined}
      <button
        type="button"
        onClick={() => {
          onChange({
            lastUnsupportedType: value.lastUnsupportedType,
            value: [
              ...value.value,
              {
                name: {
                  value: "",
                  notFoundEndOfFlag: false,
                  originalIfInvalidUtf8Error: undefined,
                },
                value: { type: "double", value: 0 },
              },
            ],
          });
        }}
      >
        +
      </button>
    </div>
  );
};

const ElementViewContainer = (
  { value, selection, onChange, onSelectionChange }: {
    readonly value: ElementValueWithError;
    readonly selection: Selection | undefined;
    readonly onChange: (value: ElementValueWithError) => void;
    readonly onSelectionChange: (selection: Selection) => void;
  },
): React.ReactElement => {
  return (
    <div
      onClick={(e) => {
        console.log("onClick", e);
        onSelectionChange({ type: "self" });
      }}
      style={selection?.type === "self"
        ? {
          outline: "skyblue",
          outlineStyle: "solid",
        }
        : {}}
    >
      <ElementView
        value={value}
        selection={selection}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

const ElementView = (
  { value, selection, onChange, onSelectionChange }: {
    readonly value: ElementValueWithError;
    readonly selection: Selection | undefined;
    readonly onChange: (value: ElementValueWithError) => void;
    readonly onSelectionChange: (selection: Selection) => void;
  },
): React.ReactElement => {
  switch (value.type) {
    case "double":
      return (
        <div>
          double {value.value}
        </div>
      );
    case "int32":
      return (
        <div>
          int32 {value.value}
        </div>
      );
    case "string":
      return (
        <div>
          string {value.value.value}
        </div>
      );
    case "document":
      return (
        <DocumentView
          value={value.value}
          selection={selection}
          onChange={(value) => {
            onChange({
              type: "document",
              value,
            });
          }}
          onSelectionChange={onSelectionChange}
        />
      );
    default:
      return <div>unsupported type</div>;
  }
};

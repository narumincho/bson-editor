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
  const selection = useState<Selection>({ type: "self" });

  return (
    <div>
      <DocumentView value={value} selection={selection} onChange={onChange} />
      <div style={{ position: "fixed", bottom: 0, width: "100%" }}>
        <Controller onReplace={() => {}} />
      </div>
    </div>
  );
};

const DocumentView = ({ value, selection, onChange }: {
  readonly value: DocumentWithError;
  readonly selection: Selection;
  readonly onChange: (value: DocumentWithError) => void;
}): React.ReactElement => {
  return (
    <div
      style={{
        background: selection.type === "self" ? "skyblue" : undefined,
      }}
    >
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
            <ElementView
              value={element.value}
              selection={selection.type === "child" &&
                  selection.childIndex === index
                ? selection.selection
                : { type: "self" }}
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

const ElementView = (props: {
  value: ElementValueWithError;
  readonly selection: Selection;
  onChange: (value: ElementValueWithError) => void;
}): React.ReactElement => {
  switch (props.value.type) {
    case "double":
      return (
        <div>
          double {props.value.value}
        </div>
      );
    case "int32":
      return (
        <div>
          int32 {props.value.value}
        </div>
      );
    case "string":
      return (
        <div>
          string {props.value.value.value}
        </div>
      );
    case "document":
      return (
        <div>
          <DocumentView
            value={props.value.value}
            onChange={(value) => {
              props.onChange({
                type: "document",
                value,
              });
            }}
          />
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

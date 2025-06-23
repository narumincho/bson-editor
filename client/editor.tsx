import React from "react";

import {
  DocumentWithError,
  ElementValueWithError as ElementValueWithError,
} from "../bson/fromBsonBinary.ts";

type Selection = {
  readonly type: "tree";
};

export const Editor = ({ value, onChange }: {
  readonly value: DocumentWithError;
  readonly onChange: (value: DocumentWithError) => void;
}): React.ReactElement => {
  return <DocumentView value={value} onChange={onChange} />;
};

const DocumentView = ({ value, onChange }: {
  readonly value: DocumentWithError;
  readonly onChange: (value: DocumentWithError) => void;
}): React.ReactElement => {
  return (
    <div>
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

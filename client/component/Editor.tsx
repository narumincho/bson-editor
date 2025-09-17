import React, { useCallback, useEffect, useRef } from "react";

import {
  DocumentWithError,
  ElementValueWithError as ElementValueWithError,
} from "../../bson/fromBsonBinary.ts";
import { Controller } from "./Controller.tsx";
import type { AppState, Selection } from "../appState.ts";

const replace = (
  selection: Selection,
  element: ElementValueWithError,
  document: DocumentWithError,
): DocumentWithError => {
  switch (selection.type) {
    case "self":
      if (element.type === "document") {
        return element.value;
      }
      return document;
    case "child": {
      const nameElementPair = document.value[selection.childIndex];
      if (nameElementPair === undefined) {
        return document;
      }
      return {
        value: document.value.with(
          selection.childIndex,
          {
            name: {
              value: nameElementPair.name.value ?? "???",
              notFoundEndOfFlag: nameElementPair.name
                .notFoundEndOfFlag ?? false,
              originalIfInvalidUtf8Error:
                nameElementPair.name.originalIfInvalidUtf8Error,
            },
            value: selection.selection.type === "child" &&
                nameElementPair.value.type === "document"
              ? {
                type: "document",
                value: replace(
                  selection.selection,
                  element,
                  nameElementPair.value.value,
                ),
              }
              : element,
          },
        ),
        lastUnsupportedType: document.lastUnsupportedType,
      };
    }
  }
};

export const Editor = ({ appState, onChange, onSelectionChange }: {
  readonly appState: AppState;
  readonly onChange: (value: DocumentWithError) => void;
  readonly onSelectionChange: (selection: Selection) => void;
}): React.ReactElement => {
  return (
    <div>
      <DocumentView
        value={appState.document}
        selection={appState.selection}
        isTextEdit={appState.isTextEdit}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
      />
      {appState.isTextEdit
        ? undefined
        : (
          <div style={{ position: "fixed", bottom: 0, width: "100%" }}>
            <Controller
              onReplace={(e) => {
                onChange(replace(appState.selection, e, appState.document));
              }}
            />
          </div>
        )}
    </div>
  );
};

const DocumentView = (
  { value, selection, isTextEdit, onChange, onSelectionChange }: {
    readonly value: DocumentWithError;
    readonly selection: Selection | undefined;
    readonly isTextEdit: boolean;
    readonly onChange: (value: DocumentWithError) => void;
    readonly onSelectionChange: (selection: Selection) => void;
  },
): React.ReactElement => {
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
              isTextEdit={isTextEdit}
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
  { value, selection, isTextEdit, onChange, onSelectionChange }: {
    readonly value: ElementValueWithError;
    readonly selection: Selection | undefined;
    readonly isTextEdit: boolean;
    readonly onChange: (value: ElementValueWithError) => void;
    readonly onSelectionChange: (selection: Selection) => void;
  },
): React.ReactElement => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
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
        isTextEdit={isTextEdit}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

const ElementView = (
  { value, selection, isTextEdit, onChange, onSelectionChange }: {
    readonly value: ElementValueWithError;
    readonly selection: Selection | undefined;
    readonly isTextEdit: boolean;
    readonly onChange: (value: ElementValueWithError) => void;
    readonly onSelectionChange: (selection: Selection) => void;
  },
): React.ReactElement => {
  if (selection?.type === "self" && isTextEdit) {
    return <TextEdit initialValue={elementValueWithErrorToText(value)} />;
  }
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
          isTextEdit={isTextEdit}
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

const elementValueWithErrorToText = (
  element: ElementValueWithError,
): string => {
  switch (element.type) {
    case "string":
      return element.value.value;
    case "double":
      return `${element.value}`;
    case "document":
      return `${
        JSON.stringify(element.value.value.map((
          { name, value },
        ) => [name, elementValueWithErrorToText(value)]))
      }`;
    case "int32":
      return `${element.value}`;
  }
};

const TextEdit = ({ initialValue }: { initialValue: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
      // console.log("Resized:", textarea.scrollHeight, "px");
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();

    const observer = new ResizeObserver(resize);

    observer.observe(textarea);

    return () => observer.disconnect();
  }, []);

  return (
    <textarea
      ref={textareaRef}
      onInput={resize}
      defaultValue={initialValue}
    />
  );
};

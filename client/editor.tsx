import React from "react";

import {
  DocumentWithInvalid,
  ElementValueWithInvalid,
  fromBsonBinary,
} from "../bson/fromBsonBinary.ts";

type Selection = {
  readonly type: "tree";
} | {
  readonly type: "binary";
};

export const Editor = (props: {
  value: Uint8Array;
}): React.ReactElement => {
  const structuredBson = React.useMemo(() =>
    fromBsonBinary(
      new Uint8Array(props.value),
    ), [props.value]);

  return <DocumentView structuredBson={structuredBson} />;
};

const DocumentView = (props: {
  structuredBson: DocumentWithInvalid;
}): React.ReactElement => {
  return (
    <div>
      {props.structuredBson.value.map((element, index) => (
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
            <ElementView value={element.value} />
          </div>
        </div>
      ))}
      {props.structuredBson.lastUnsupportedType !== undefined
        ? (
          <div
            key={`${props.structuredBson.lastUnsupportedType.name.value}-lastUnsupportedType`}
            style={{
              padding: 16,
            }}
          >
            <div style={{ whiteSpace: "pre" }}>
              "{props.structuredBson.lastUnsupportedType.name.value}"
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
    </div>
  );
};

const ElementView = (props: {
  value: ElementValueWithInvalid;
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
            structuredBson={props.value.value}
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

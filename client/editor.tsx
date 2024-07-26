import React from "https://esm.sh/react@18.3.1?pin=v135";
import { WithLocation } from "../bson/location.ts";

import {
  bsonBinaryToStructuredBson,
  DocumentWithInvalid,
  ElementValueWithInvalid,
} from "../bson/main.ts";

export const Editor = (props: {
  value: Uint8Array;
}): React.ReactElement => {
  const [editorWidth, setEditorWidth] = React.useState(400);

  const structuredBson = React.useMemo(() =>
    bsonBinaryToStructuredBson(
      new Uint8Array(props.value),
    ), [props.value]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${editorWidth}px 2px 1fr`,
      }}
    >
      <div>
        <DocumentView structuredBson={structuredBson.value} />
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
            }}
          >
            {byte.toString(16).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentView = (props: {
  structuredBson: DocumentWithInvalid;
}): React.ReactElement => {
  return (
    <div>
      {props.structuredBson.unsupportedTypesError
        ? <div>unsupported types</div>
        : undefined}
      {props.structuredBson.value.map((element) => (
        <div
          key={element.value.name.value.value}
          style={{
            padding: 16,
          }}
        >
          {element.value.name.value.value}
          <div
            style={{
              padding: 8,
            }}
          >
            <ElementView
              value={element.value.value.value}
            />
          </div>
        </div>
      ))}
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

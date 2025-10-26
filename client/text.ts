import {
  ElementValueWithError,
  NameElementPair,
} from "../bson/fromBsonBinary.ts";
import { jsonStringToJsonValue, jsonValueToJsonString } from "./json.ts";

export const elementValueWithErrorToText = (
  element: ElementValueWithError,
): string => {
  switch (element.type) {
    case "string":
      return element.value.value;
    case "double":
      return `${element.value}`;
    case "document":
      return `${
        jsonValueToJsonString(element.value.value.map((
          { name, value },
        ) => [name.value, elementValueWithErrorToText(value)]))
      }`;
    case "int32":
      return `${element.value}`;
  }
};

/**
 * 前回の要素をヒントに文字列から要素を生成する
 */
export const textWithTypeToElementValueWithError = (
  prevValue: ElementValueWithError,
  text: string,
): ElementValueWithError => {
  switch (prevValue.type) {
    case "string":
      return {
        type: "string",
        value: { value: text, originalIfError: undefined },
      };
    case "double": {
      try {
        return {
          type: "double",
          value: Number.parseFloat(text),
        };
      } catch {
        // 変換に失敗したら「doubleとして解釈できなかったため文字列に変換しました」って表示したい
        return {
          type: "string",
          value: { value: text, originalIfError: undefined },
        };
      }
    }
    case "int32": {
      try {
        return {
          type: "int32",
          value: Number.parseInt(text),
        };
      } catch {
        try {
          return {
            type: "double",
            value: Number.parseFloat(text),
          };
        } catch {
          return {
            type: "string",
            value: { value: text, originalIfError: undefined },
          };
        }
      }
    }
    case "document": {
      const json = jsonStringToJsonValue(text);
      if (json === undefined) {
        return {
          type: "string",
          value: { value: text, originalIfError: undefined },
        };
      }
      if (typeof json === "number") {
        return {
          type: "double",
          value: json,
        };
      }
      if (typeof json === "string") {
        return {
          type: "string",
          value: {
            originalIfError: undefined,
            value: json,
          },
        };
      }
      if (typeof json !== "object" || json === null) {
        return {
          type: "string",
          value: { value: text, originalIfError: undefined },
        };
      }
      return {
        type: "document",
        value: {
          value: Object.entries(json).map(
            ([name, value]): NameElementPair => {
              const prev = prevValue.value.value.find((e) =>
                e.name.value === name
              );
              return {
                name: {
                  value: name,
                  notFoundEndOfFlag: false,
                  originalIfInvalidUtf8Error: undefined,
                },
                value: prev
                  ? textWithTypeToElementValueWithError(
                    prev.value,
                    JSON.stringify(value),
                  )
                  : {
                    type: "string",
                    value: { value: "", originalIfError: undefined },
                  },
              };
            },
          ),
          lastUnsupportedType: prevValue.value.lastUnsupportedType,
        },
      };
    }
  }
};

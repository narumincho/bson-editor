import React, { useEffect } from "react";
import {
  ElementValueWithError,
  fromBsonBinary,
} from "../../bson/fromBsonBinary.ts";

const getFileFromDataTransferItemList = (itemList: DataTransferItemList) => {
  const items = [...itemList];
  // getAsFile で File として解釈できるものを優先
  // - バイナリとして解釈成功するものを優先
  // - つぎにテキストとして解釈成功するものを優先
  // 次に, getAsString で 解釈できるものを優先

  items.find((e) => e.getAsFile());
};

export const Controller = (
  { onReplace }: { onReplace: (document: ElementValueWithError) => void },
) => {
  useEffect(() => {
    const listener = (e: ClipboardEvent) => {
      if (!e.clipboardData) {
        return;
      }
      const items = [...e.clipboardData.items];
      items.find((e) => e.getAsFile());
      for (const item of e.clipboardData.items) {
        console.log(item.type, item.kind);
        item.getAsString((data) => {
          console.log("string", item.type, data);
        });
        console.log("file", item.getAsFile());
      }
      e.preventDefault();
    };
    document.addEventListener("paste", listener);

    return () => {
      document.removeEventListener("paste", listener);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 8,
      }}
    >
      <button
        type="button"
        onClick={() => {
          onReplace({
            type: "document",
            value: { value: [], lastUnsupportedType: undefined },
          });
        }}
      >
        from empty
      </button>
      <button
        type="button"
        onClick={() => {
          onReplace({
            type: "document",
            value: {
              value: [
                {
                  name: {
                    value: "text",
                    notFoundEndOfFlag: false,
                    originalIfInvalidUtf8Error: undefined,
                  },
                  value: {
                    type: "string",
                    value: { value: "hello world", originalIfError: undefined },
                  },
                },
                {
                  name: {
                    value: "64bit floating number",
                    notFoundEndOfFlag: false,
                    originalIfInvalidUtf8Error: undefined,
                  },
                  value: {
                    type: "double",
                    value: 123.456,
                  },
                },
              ],
              lastUnsupportedType: undefined,
            },
          });
        }}
      >
        from sample data
      </button>
      <div>from clipboard (Ctrl+V)</div>
      <label>
        from file
        <input
          type="file"
          onChange={async (e) => {
            const bsonFile = await e.target.files?.[0]?.arrayBuffer();
            if (bsonFile !== undefined) {
              onReplace({
                type: "document",
                value: fromBsonBinary(new Uint8Array(bsonFile)),
              });
            }
          }}
        />
      </label>
    </div>
  );
};

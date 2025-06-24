import React from "react";

export const Header = (
  { onOpenFile }: { onOpenFile: (binary: Uint8Array) => void },
) => {
  return (
    <header
      style={{
        display: "flex",
        gap: 8,
        padding: 8,
        alignItems: "center",
        backgroundColor: "#434242",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24 }}>
        nBSON Editor
      </h1>
      <label>
        open file
        <input
          type="file"
          onChange={async (e) => {
            const bsonFile = await e.target.files?.[0]?.arrayBuffer();
            if (bsonFile !== undefined) {
              onOpenFile(new Uint8Array(bsonFile));
            }
          }}
          onPaste={(e) => {
            console.log("test paste", e);
            for (const item of e.clipboardData.items) {
              console.log(item.type, item.kind);
              item.getAsString((data) => {
                console.log("string", item.type, data);
              });
              console.log("file", item.getAsFile());
            }
            e.preventDefault();
          }}
        />
      </label>
      <div style={{ flexGrow: 1 }} />
      <a href="https://github.com/narumincho/bson-editor">GitHub</a>
    </header>
  );
};

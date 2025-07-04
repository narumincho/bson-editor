import type { WebviewApi } from "npm:@types/vscode-webview@1.57.5";
import React from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./editor.tsx";
import { ToBsonBinary } from "../bson/serialize.ts";

const getAcquireVsCodeApi = (): WebviewApi<unknown> | undefined => {
  if (typeof globalThis.acquireVsCodeApi === "function") {
    return globalThis.acquireVsCodeApi();
  }
  return undefined;
};

const vscodeWebviewApi = getAcquireVsCodeApi();

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

const App = (): React.ReactElement => {
  const [bsonFile, setBsonFile] = React.useState<
    Uint8Array | undefined
  >(undefined);

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 8,
          alignItems: "center",
          backgroundColor: "#434242",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
          }}
        >
          nBSON Editor
        </h1>
        {vscodeWebviewApi === undefined
          ? <a href="https://github.com/narumincho/bson-editor">GitHub</a>
          : undefined}
      </header>
      <div
        style={{
          padding: 12,
        }}
      >
        <input
          type="file"
          onChange={async (e) => {
            console.log(e);
            const bsonFile = await e.target.files?.[0]?.arrayBuffer();
            if (bsonFile !== undefined) {
              setBsonFile(new Uint8Array(bsonFile));
            }
          }}
        />
      </div>
      {bsonFile === undefined
        ? (
          <div
            style={{
              padding: 12,
            }}
          >
            <button
              type="button"
              style={{
                padding: 8,
              }}
              onClick={() => {
                setBsonFile(ToBsonBinary(new Map()));
              }}
            >
              create from empty file
            </button>
          </div>
        )
        : <Editor value={bsonFile} />}
    </div>
  );
};

root.render(<App />);

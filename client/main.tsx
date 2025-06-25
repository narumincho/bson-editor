import type { WebviewApi } from "npm:@types/vscode-webview@1.57.5";
import React from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError } from "../bson/fromBsonBinary.ts";
import { Header } from "./component/Header.tsx";

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
    DocumentWithError
  >({ value: [], lastUnsupportedType: undefined });

  return (
    <div>
      {vscodeWebviewApi === undefined
        ? (
          <div style={{ position: "fixed", top: 0, width: "100%" }}>
            <Header />
          </div>
        )
        : undefined}
      <Editor
        value={bsonFile}
        onChange={setBsonFile}
      />
    </div>
  );
};

root.render(<App />);

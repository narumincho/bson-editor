/** @jsx jsx */
import type { WebviewApi } from "npm:@types/vscode-webview@1.57.1";
import React from "https://esm.sh/react@18.2.0?pin=v130";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?pin=v130";
import { jsx } from "https://esm.sh/@emotion/react@11.11.1?pin=v130";

const getAcquireVsCodeApi = (): WebviewApi<unknown> | undefined => {
  if (typeof window.acquireVsCodeApi === "function") {
    return window.acquireVsCodeApi();
  }
  return undefined;
};

const vscodeWebviewApi = getAcquireVsCodeApi();

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

const App = (): React.ReactElement => {
  return (
    <div>
      {vscodeWebviewApi === undefined
        ? <a href="https://github.com/narumincho/bson-editor">GitHub</a>
        : undefined}
      <div>普通にWebサイトでも動作するBsonエディターを作りたい</div>
      <input
        type="file"
        onChange={(e) => {
          console.log(e);
        }}
      />
    </div>
  );
};

root.render(<App />);

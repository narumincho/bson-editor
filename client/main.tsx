/** @jsx jsx */
import type {} from "npm:@types/vscode-webview@1.57.1";
import React from "https://esm.sh/react@18.2.0?pin=v130";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?pin=v130";
import { jsx } from "https://esm.sh/@emotion/react@11.11.1?pin=v130";

if (typeof window.acquireVsCodeApi === "function") {
  const vscode = window.acquireVsCodeApi();
  console.log(vscode);
}

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

root.render(<div>普通にWebサイトでも動作するBsonエディターを作りたい</div>);

import type { WebviewApi } from "npm:@types/vscode-webview@1.57.1";
import React from "https://esm.sh/react@18.2.0?pin=v132";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client?pin=v132";
import {
  bsonBinaryToStructuredBson,
  DocumentWithInvalid,
} from "../bson/main.ts";
import { WithLocation } from "../bson/location.ts";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const [structuredBson, setStructuredBson] = React.useState<
    WithLocation<DocumentWithInvalid> | undefined
  >(undefined);

  return (
    <div>
      {vscodeWebviewApi === undefined
        ? <a href="https://github.com/narumincho/bson-editor">GitHub</a>
        : undefined}
      <div>普通にWebサイトでも動作するBsonエディターを作りたい</div>
      <input
        type="file"
        disabled={isLoading}
        onChange={(e) => {
          console.log(e);
          setIsLoading(true);
          e.target.files?.[0]?.arrayBuffer().then((binary) => {
            setIsLoading(false);
            const structuredBson = bsonBinaryToStructuredBson(
              new Uint8Array(binary),
            );
            console.log(structuredBson);
            setStructuredBson(structuredBson);
          });
        }}
      />
      {isLoading ? <div>読み込み中</div> : undefined}
      {structuredBson === undefined
        ? undefined
        : <code>{JSON.stringify(structuredBson, null, 2)}</code>}
    </div>
  );
};

root.render(<App />);

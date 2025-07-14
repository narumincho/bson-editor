import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError, fromBsonBinary } from "../bson/fromBsonBinary.ts";
import { Header } from "./component/Header.tsx";
import {
  handleMessageFromVsCode,
  isInVsCode,
  sendMessageToVsCode,
} from "./vscode.ts";

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

const App = (): React.ReactElement => {
  const [bsonFile, setBsonFile] = React.useState<
    DocumentWithError
  >({ value: [], lastUnsupportedType: undefined });

  useEffect(() => {
    sendMessageToVsCode({
      type: "requestFile",
    });
    sendMessageToVsCode({
      type: "debugShowMessage",
      message: `デバッグメッセージテスト`,
    });

    return handleMessageFromVsCode((message) => {
      switch (message.type) {
        case "initialFile":
          setBsonFile(fromBsonBinary(message.binary));
          sendMessageToVsCode({
            type: "debugShowMessage",
            message: `バイナリを受け取ったよ ${message.binary.length}`,
          });

          break;
      }
    });
  }, []);

  return (
    <div>
      {isInVsCode() === undefined ? <Header /> : undefined}
      <Editor
        value={bsonFile}
        onChange={setBsonFile}
      />
    </div>
  );
};

root.render(<App />);

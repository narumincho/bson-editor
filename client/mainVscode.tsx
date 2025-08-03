import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError, fromBsonBinary } from "../bson/fromBsonBinary.ts";
import { handleMessageFromVsCode, sendMessageToVsCode } from "./vscode.ts";
import { Selection } from "./selection.ts";
import { handleCommand } from "./command.ts";

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

const App = (): React.ReactElement => {
  const [bsonFile, setBsonFile] = useState<
    DocumentWithError | undefined
  >(undefined);
  const [selection, setSelection] = useState<Selection>({ type: "self" });

  useEffect(() => {
    if (bsonFile === undefined) {
      sendMessageToVsCode({ type: "requestFile" });
    }

    return handleMessageFromVsCode((message) => {
      switch (message.type) {
        case "initialFile":
          setBsonFile(fromBsonBinary(message.binary));
          sendMessageToVsCode({
            type: "debugShowMessage",
            message: `バイナリを受け取ったよ ${message.binary.length}`,
          });
          return;
        case "moveToParent":
          if (bsonFile) {
            setSelection(
              handleCommand({
                command: "moveToParent",
                selection,
                document: bsonFile,
              }),
            );
            return;
          }
      }
    });
  }, [bsonFile]);

  if (bsonFile === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Editor
        value={bsonFile}
        selection={selection}
        onChange={setBsonFile}
        onChangeSelection={setSelection}
      />
    </div>
  );
};

root.render(<App />);

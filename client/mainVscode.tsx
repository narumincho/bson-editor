import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError, fromBsonBinary } from "../bson/fromBsonBinary.ts";
import { handleMessageFromVsCode, sendMessageToVsCode } from "./vscode.ts";
import { AppState, Selection } from "./appState.ts";
import { handleCommand } from "./command.ts";

const App = (): React.ReactElement => {
  const [appState, setAppState] = useState<AppState | undefined>(undefined);

  useEffect(() => {
    if (appState === undefined) {
      sendMessageToVsCode({ type: "requestFile" });
    }

    return handleMessageFromVsCode((message) => {
      switch (message.type) {
        case "initialFile":
          setAppState({
            document: fromBsonBinary(message.binary),
            selection: { type: "self" },
            isTextEdit: false,
          });
          sendMessageToVsCode({
            type: "debugShowMessage",
            message: `バイナリを受け取ったよ ${message.binary.length}`,
          });
          return;
        case "command":
          if (appState) {
            setAppState(handleCommand({ command: message.command, appState }));
          }
          return;
      }
    });
  }, [appState]);

  if (appState === undefined) {
    return <div>Loading...</div>;
  }

  const handleChange = useCallback((document: DocumentWithError): void => {
    setAppState((prev) => (prev ? { ...prev, document } : undefined));
  }, []);

  const handleChangeSelection = useCallback((selection: Selection): void => {
    setAppState((prev) => (prev ? { ...prev, selection } : undefined));
  }, []);

  return (
    <Editor
      appState={appState}
      onChange={handleChange}
      onSelectionChange={handleChangeSelection}
    />
  );
};

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

root.render(<App />);

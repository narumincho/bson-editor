import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError, fromBsonBinary } from "../bson/fromBsonBinary.ts";
import { toBsonBinary } from "../bson/toBsonBinary.ts";
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
            textEditModeText: undefined,
          });
          sendMessageToVsCode({
            type: "debugShowMessage",
            message: `バイナリを受け取ったよ ${message.binary.length}`,
          });
          return;
        case "requestFileForSave": {
          if (appState === undefined) {
            sendMessageToVsCode({
              type: "debugShowMessage",
              message: "保存用データがありません",
            });
            return;
          }
          // convert DocumentWithError -> ToBsonBinary input
          const convertDocument = (
            doc: DocumentWithError,
          ): ReadonlyMap<string, any> => {
            const m = new Map<string, any>();
            for (const pair of doc.value) {
              const name = pair.name.value;
              const v = pair.value;
              switch (v.type) {
                case "double":
                  m.set(name, { type: "double", value: v.value ?? 0 });
                  break;
                case "string":
                  m.set(name, { type: "string", value: v.value.value });
                  break;
                case "document":
                  m.set(name, {
                    type: "document",
                    value: convertDocument(v.value),
                  });
                  break;
                case "int32":
                  m.set(name, { type: "int32", value: v.value ?? 0 });
                  break;
              }
            }
            return m;
          };
          try {
            const binary = toBsonBinary(convertDocument(appState.document));
            sendMessageToVsCode({ type: "fileForSave", binary });
          } catch (e) {
            sendMessageToVsCode({
              type: "debugShowMessage",
              message: `保存用データ作成に失敗: ${String(e)}`,
            });
          }
          return;
        }
        case "command":
          if (appState) {
            sendMessageToVsCode({
              type: "debugShowMessage",
              message: `コマンドを受け取ったよ ${message.command}`,
            });
            setAppState(handleCommand({ command: message.command, appState }));
          }
          return;
      }
    });
  }, [appState]);

  useEffect(() => {
    const focus = () => {
      sendMessageToVsCode({ type: "focus" });
    };
    const blur = () => {
      sendMessageToVsCode({ type: "blur" });
    };
    addEventListener("focus", focus);
    addEventListener("blur", blur);

    return () => {
      removeEventListener("focus", focus);
      removeEventListener("blur", blur);
    };
  }, []);

  const handleChange = useCallback((document: DocumentWithError): void => {
    setAppState((prev) => (prev ? { ...prev, document } : undefined));
  }, []);

  const handleChangeSelection = useCallback((selection: Selection): void => {
    setAppState((prev) => (prev ? { ...prev, selection } : undefined));
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setAppState((
      prev,
    ) => (prev ? { ...prev, textEditModeText: text } : undefined));
  }, []);

  if (appState === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Editor
      appState={appState}
      onChange={handleChange}
      onSelectionChange={handleChangeSelection}
      onChangeText={handleChangeText}
    />
  );
};

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

root.render(<App />);

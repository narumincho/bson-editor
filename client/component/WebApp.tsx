import React, { useCallback, useEffect, useState } from "react";
import type { DocumentWithError } from "../../bson/fromBsonBinary.ts";
import type { Selection } from "../appState.ts";
import { Header } from "./Header.tsx";
import { Editor } from "./Editor.tsx";
import { handleCommand } from "../command.ts";
import { AppState } from "../appState.ts";

export const WebApp = (): React.ReactElement => {
  const [appState, setAppState] = useState<AppState>({
    document: { value: [], lastUnsupportedType: undefined },
    selection: { type: "self" },
    isTextEdit: false,
  });

  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      console.log(event.code);
      if (event.code === "KeyQ") {
        setAppState(handleCommand({
          command: "moveToParent",
          appState,
        }));
      }
      if (event.code === "Enter") {
        setAppState(handleCommand({
          command: "startTextEdit",
          appState,
        }));
      }
    };
    addEventListener("keydown", keydownHandler);

    return () => {
      removeEventListener("keydown", keydownHandler);
    };
  });

  const handleChange = useCallback((document: DocumentWithError): void => {
    setAppState((prev) => ({ ...prev, document }));
  }, []);

  const handleChangeSelection = useCallback((selection: Selection): void => {
    setAppState((prev) => ({ ...prev, selection }));
  }, []);

  return (
    <div>
      <Header />
      <Editor
        appState={appState}
        onChange={handleChange}
        onSelectionChange={handleChangeSelection}
      />
    </div>
  );
};

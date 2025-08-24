import React, { useEffect, useState } from "react";
import { DocumentWithError } from "../../bson/fromBsonBinary.ts";
import { Selection } from "../selection.ts";
import { Header } from "./Header.tsx";
import { Editor } from "./Editor.tsx";
import { handleCommand } from "../command.ts";

export const App = (): React.ReactElement => {
  const [bsonFile, setBsonFile] = useState<
    DocumentWithError
  >({ value: [], lastUnsupportedType: undefined });
  const [selection, setSelection] = useState<Selection>({ type: "self" });

  useEffect(() => {
    const keydownHandler = (event: KeyboardEvent) => {
      console.log(event.code);
      if (event.code === "KeyQ") {
        setSelection(handleCommand({
          command: "moveToParent",
          selection,
          document: bsonFile,
        }));
      }
    };
    addEventListener("keydown", keydownHandler);

    return () => {
      removeEventListener("keydown", keydownHandler);
    };
  });

  return (
    <div>
      <Header />
      <Editor
        value={bsonFile}
        selection={selection}
        onChange={setBsonFile}
        onChangeSelection={setSelection}
      />
    </div>
  );
};

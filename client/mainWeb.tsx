import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError } from "../bson/fromBsonBinary.ts";
import { Header } from "./component/Header.tsx";
import { Selection } from "./selection.ts";

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

const App = (): React.ReactElement => {
  const [bsonFile, setBsonFile] = useState<
    DocumentWithError
  >({ value: [], lastUnsupportedType: undefined });
  const [selection, setSelection] = useState<Selection>({ type: "self" });

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

root.render(<App />);

import React from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./component/Editor.tsx";
import { DocumentWithError } from "../bson/fromBsonBinary.ts";
import { Header } from "./component/Header.tsx";

document.getElementById("loading")?.remove();
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const root = createRoot(rootElement);

const App = (): React.ReactElement => {
  const [bsonFile, setBsonFile] = React.useState<
    DocumentWithError
  >({ value: [], lastUnsupportedType: undefined });

  return (
    <div>
      <Header />
      <Editor
        value={bsonFile}
        onChange={setBsonFile}
      />
    </div>
  );
};

root.render(<App />);

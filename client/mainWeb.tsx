import React from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./component/App.tsx";

hydrateRoot(document.body, <App />);

import { hydrateRoot } from "react-dom/client";
import React from "react";
import { WebApp } from "./component/WebApp.tsx";

hydrateRoot(document.body, <WebApp />);

import type { WebviewApi } from "vscode-webview";
import { Command } from "./command.ts";

export type MessageFromVsCode = {
  readonly type: "initialFile";
  readonly binary: Uint8Array;
} | {
  readonly type: "command";
  readonly command: Command;
};

export const handleMessageFromVsCode = (
  handler: (message: MessageFromVsCode) => void,
): () => void => {
  const eventHandler = (e: WindowEventMap["message"]) => {
    const message: MessageFromVsCode = e.data;
    handler(message);
  };
  addEventListener("message", eventHandler);
  return () => {
    removeEventListener("message", eventHandler);
  };
};

export type MessageToVsCode = {
  readonly type: "requestFile";
} | {
  readonly type: "debugShowMessage";
  readonly message: string;
} | {
  readonly type: "focus";
} | {
  readonly type: "blur";
};

export const sendMessageToVsCode = (message: MessageToVsCode): void => {
  vscodeApi.postMessage(message);
};

const vscodeApi: WebviewApi<unknown> = globalThis.acquireVsCodeApi();

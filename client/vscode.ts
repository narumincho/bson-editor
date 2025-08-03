import { WebviewApi } from "npm:@types/vscode-webview@1.57.5";

export type MessageFromVsCode = {
  readonly type: "initialFile";
  readonly binary: Uint8Array;
} | {
  readonly type: "moveToParent";
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
};

export const sendMessageToVsCode = (message: MessageToVsCode): void => {
  if (vscodeApi) {
    vscodeApi.postMessage(message);
  }
};

export const isInVsCode = (): boolean => {
  return !!vscodeApi;
};

const vscodeApi: WebviewApi<unknown> | undefined =
  typeof globalThis.acquireVsCodeApi === "function"
    ? globalThis.acquireVsCodeApi()
    : undefined;

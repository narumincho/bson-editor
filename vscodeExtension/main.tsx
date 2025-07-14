import {
  CancellationToken,
  CustomDocument,
  CustomDocumentBackup,
  CustomDocumentBackupContext,
  CustomDocumentContentChangeEvent,
  CustomDocumentOpenContext,
  CustomEditorProvider,
  ExtensionContext,
  importVsCodeApi,
  Uri,
  Webview,
  WebviewPanel,
} from "@narumincho/vscode";
import { scriptFileName, viewType } from "./lib.ts";
import { renderToString } from "react-dom/server";
import React from "react";
import { MessageFromVsCode, MessageToVsCode } from "../client/vscode.ts";

export function activate(context: ExtensionContext) {
  const vscode = importVsCodeApi();
  if (vscode === undefined) {
    throw new Error(
      "Could not import vscode api because it was not working within the extension",
    );
  }

  const eventEmitter = new vscode.EventEmitter<
    CustomDocumentContentChangeEvent<BsonEditorDocument>
  >();

  const webviewList: Array<{ readonly uri: Uri; readonly webview: Webview }> =
    [];

  // const watcher = vscode.workspace.createFileSystemWatcher("**/*.bson");
  // watcher.onDidChange(async (e) => {
  //   console.log("onDidChangeTextDocument", e.toString());
  //   for (const { uri, webview } of webviewList) {
  //     if (uri.toString() === e.toString()) {
  //       const message: MessageFromVsCode = {
  //         type: "initialFile",
  //         binary: await vscode.workspace.fs.readFile(e),
  //       };
  //       webview.postMessage(message);
  //     }
  //   }
  // });

  // setInterval(async () => {
  //   console.log("送信 in vscode", webviewList);
  //   for (const { uri, webview } of webviewList) {
  //     const message: MessageFromVsCode = {
  //       type: "initialFile",
  //       binary: await vscode.workspace.fs.readFile(uri),
  //     };
  //     webview.postMessage(message);
  //   }
  // }, 5000);

  /**
   * https://code.visualstudio.com/api/extension-guides/custom-editors
   */
  const customEditorProvider: CustomEditorProvider<BsonEditorDocument> = {
    // deno-lint-ignore require-await
    backupCustomDocument: async (
      document: BsonEditorDocument,
      _context: CustomDocumentBackupContext,
      _cancellation: CancellationToken,
    ): Promise<CustomDocumentBackup> => {
      return {
        id: document.uri.toString(),
        delete: () => {},
      };
    },
    onDidChangeCustomDocument: eventEmitter.event,
    openCustomDocument: async (
      uri: Uri,
      _openContext: CustomDocumentOpenContext,
      _token: CancellationToken,
    ): Promise<BsonEditorDocument> => {
      console.log("openCustomDocument");
      const file = await vscode.workspace.fs.readFile(uri);

      webviewList.filter((e) => e.uri.toString() === uri.toString()).forEach(
        ({ webview }) => {
          webview.postMessage({
            type: "initialFile",
            binary: file,
          });
        },
      );

      return {
        uri,
        originalBinary: file,
        dispose: () => {},
      };
    },
    resolveCustomEditor: async (
      document: BsonEditorDocument,
      webviewPanel: WebviewPanel,
      _token: CancellationToken,
    ): Promise<void> => {
      console.log("resolveCustomEditor");
      webviewPanel.webview.options = {
        enableScripts: true,
      };
      const scriptUri = webviewPanel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, scriptFileName),
      );
      webviewPanel.webview.html = "<!doctype html>\n" + renderToString(
        <html lang="ja">
          <head>
            <meta charSet="UTF-8" />
            <title>Bson Editor</title>
            <script type="module" src={scriptUri.toString()} />
          </head>
          <body>
            <div id="loading">Bson Editor loading</div>
          </body>
        </html>,
      );
      webviewPanel.webview.onDidReceiveMessage(
        async (message: MessageToVsCode) => {
          switch (message.type) {
            case "requestFile":
              await webviewPanel.webview.postMessage({
                type: "initialFile",
                binary: document.originalBinary,
              });
              return;
            case "debugShowMessage":
              console.log("Web viewからのメッセージ", message);
          }
        },
      );
      webviewList.push({ uri: document.uri, webview: webviewPanel.webview });
    },
    saveCustomDocument: async (
      document: BsonEditorDocument,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      await vscode.workspace.fs.writeFile(
        document.uri,
        document.originalBinary,
      );
    },
    saveCustomDocumentAs: async (
      document: BsonEditorDocument,
      destination: Uri,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      await vscode.workspace.fs.writeFile(destination, document.originalBinary);
    },
    revertCustomDocument: async (
      document: BsonEditorDocument,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      const file = await vscode.workspace.fs.readFile(document.uri);
      document.originalBinary = file;
    },
  };
  const provider = vscode.window.registerCustomEditorProvider(
    viewType,
    customEditorProvider,
  );
  context.subscriptions.push(provider);
}

export type BsonEditorDocument = CustomDocument & {
  originalBinary: Uint8Array;
};

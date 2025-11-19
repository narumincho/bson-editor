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
import { bsonEditorBlur, scriptFileName, viewType } from "./lib.ts";
import { renderToString } from "react-dom/server";
import React from "react";
import { MessageToVsCode } from "../client/vscode.ts";
import { registerCommands } from "./command.ts";

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

  // pending resolvers for save requests from the extension to the webview
  const pendingFileRequests = new Map<string, (binary: Uint8Array) => void>();

  const webviewList: Array<{ readonly uri: Uri; readonly webview: Webview }> =
    [];

  registerCommands(vscode, (command) => {
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
    if (!(activeTab?.input instanceof vscode.TabInputCustom)) {
      return;
    }
    if (activeTab.input.viewType !== viewType) {
      return;
    }
    for (const webView of webviewList) {
      if (webView.uri.toString() === activeTab.input.uri.toString()) {
        webView.webview.postMessage({ type: "command", command });
        return;
      }
    }
    vscode.window.showErrorMessage(`not found: ${activeTab.input.uri}`);
  });

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
    // deno-lint-ignore require-await
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
            <div id="loading">Bson Editor script loading...</div>
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
              vscode.window.showInformationMessage(
                `viewからのメッセージ: ${message.message}`,
              );

              console.log("Web viewからのメッセージ", message);
              return;
            case "focus":
              vscode.commands.executeCommand(
                "setContext",
                bsonEditorBlur,
                false,
              );
              return;
            case "blur":
              vscode.commands.executeCommand(
                "setContext",
                bsonEditorBlur,
                true,
              );
              return;
            case "fileForSave":
              // webview replied with current binary for saving
              {
                const resolver = pendingFileRequests.get(
                  document.uri.toString(),
                );
                if (resolver) {
                  pendingFileRequests.delete(document.uri.toString());
                  resolver(message.binary);
                }
              }
              return;
          }
        },
      );
      webviewList.push({ uri: document.uri, webview: webviewPanel.webview });
    },
    saveCustomDocument: async (
      document: BsonEditorDocument,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      // request current content from webview then write
      const webview = webviewList.find((e) =>
        e.uri.toString() === document.uri.toString()
      );
      if (webview === undefined) {
        // fallback to existing binary
        await vscode.workspace.fs.writeFile(
          document.uri,
          document.originalBinary,
        );
        return;
      }
      const timeoutMs = 2000;
      const fileBinary: Uint8Array = await new Promise<Uint8Array>(
        (resolve, reject) => {
          const key = document.uri.toString();
          pendingFileRequests.set(key, (binary) => resolve(binary));
          webview.webview.postMessage({ type: "requestFileForSave" });
          setTimeout(() => {
            if (pendingFileRequests.has(key)) {
              pendingFileRequests.delete(key);
              reject(new Error("timeout waiting for webview fileForSave"));
            }
          }, timeoutMs);
        },
      ).catch(() => document.originalBinary);
      await vscode.workspace.fs.writeFile(document.uri, fileBinary);
    },
    saveCustomDocumentAs: async (
      document: BsonEditorDocument,
      destination: Uri,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      const webview = webviewList.find((e) =>
        e.uri.toString() === document.uri.toString()
      );
      if (webview === undefined) {
        await vscode.workspace.fs.writeFile(
          destination,
          document.originalBinary,
        );
        return;
      }
      const timeoutMs = 2000;
      const fileBinary: Uint8Array = await new Promise<Uint8Array>(
        (resolve, reject) => {
          const key = document.uri.toString();
          pendingFileRequests.set(key, (binary) => resolve(binary));
          webview.webview.postMessage({ type: "requestFileForSave" });
          setTimeout(() => {
            if (pendingFileRequests.has(key)) {
              pendingFileRequests.delete(key);
              reject(new Error("timeout waiting for webview fileForSave"));
            }
          }, timeoutMs);
        },
      ).catch(() => document.originalBinary);
      await vscode.workspace.fs.writeFile(destination, fileBinary);
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
    {
      // supportsMultipleEditorsPerDocument: true,
      webviewOptions: { enableFindWidget: true },
    },
  );
  context.subscriptions.push(provider);
}

export type BsonEditorDocument = CustomDocument & {
  originalBinary: Uint8Array;
};

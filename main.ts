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
  WebviewPanel,
} from "https://deno.land/x/vscode@1.81.0/mod.ts";
import { viewType } from "./lib.ts";
import { bsonBinaryToStructuredBson } from "./bson/main.ts";

export function activate(context: ExtensionContext) {
  const vscode = importVsCodeApi();
  if (vscode === undefined) {
    throw new Error(
      "Could not import vscode api because it was not working within the extension",
    );
  }

  const eventEmitter = new vscode.EventEmitter<
    CustomDocumentContentChangeEvent<DocumentWithInvalid>
  >();
  /**
   * https://code.visualstudio.com/api/extension-guides/custom-editors
   */
  const customEditorProvider: CustomEditorProvider<DocumentWithInvalid> = {
    // deno-lint-ignore require-await
    backupCustomDocument: async (
      document: DocumentWithInvalid,
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
    ): Promise<DocumentWithInvalid> => {
      const file = await vscode.workspace.fs.readFile(uri);
      return {
        uri,
        data: bsonBinaryToStructuredBson(
          file,
        ),
        originalBinary: file,
        dispose: () => {},
      };
    },
    // deno-lint-ignore require-await
    resolveCustomEditor: async (
      document: DocumentWithInvalid,
      webviewPanel: WebviewPanel,
      _token: CancellationToken,
    ): Promise<void> => {
      webviewPanel.webview.options = {
        enableScripts: true,
      };
      webviewPanel.webview.html = `<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <title>Bson Editor</title>
</head>
<body>
  <h1>Bson Editor</h1>
  <div>${JSON.stringify(document.data)}</div>
</body>
</html>
`;
    },
    saveCustomDocument: async (
      document: DocumentWithInvalid,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      await vscode.workspace.fs.writeFile(
        document.uri,
        document.originalBinary,
      );
    },
    saveCustomDocumentAs: async (
      document: DocumentWithInvalid,
      destination: Uri,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      await vscode.workspace.fs.writeFile(
        destination,
        document.originalBinary,
      );
    },
    revertCustomDocument: async (
      document: DocumentWithInvalid,
      _cancellation: CancellationToken,
    ): Promise<void> => {
      const file = await vscode.workspace.fs.readFile(document.uri);
      document.originalBinary = file;
      document.data = bsonBinaryToStructuredBson(file);
    },
  };
  const provider = vscode.window.registerCustomEditorProvider(
    viewType,
    customEditorProvider,
  );
  context.subscriptions.push(provider);
}

type DocumentWithInvalid = CustomDocument & {
  data: DocumentWithInvalid;
  originalBinary: Uint8Array;
};

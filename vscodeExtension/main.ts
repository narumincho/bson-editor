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
} from "https://deno.land/x/vscode@1.90.0/mod.ts";
import { viewType } from "./lib.ts";

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
      const file = await vscode.workspace.fs.readFile(uri);
      return {
        uri,
        originalBinary: file,
        dispose: () => {},
      };
    },
    // deno-lint-ignore require-await
    resolveCustomEditor: async (
      _document: BsonEditorDocument,
      webviewPanel: WebviewPanel,
      _token: CancellationToken,
    ): Promise<void> => {
      webviewPanel.webview.options = {
        enableScripts: true,
      };
      const scriptUri = webviewPanel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "client.js"),
      );
      webviewPanel.webview.html = `<!doctype html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <title>Bson Editor</title>
  <script type="module" src="${scriptUri}"></script>
</head>
<body>
  <div id="loading">Bson Editor loading</div>
</body>
</html>`;
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

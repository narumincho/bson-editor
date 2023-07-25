import {
  CancellationToken,
  CustomDocument,
  CustomDocumentBackup,
  CustomDocumentBackupContext,
  CustomDocumentContentChangeEvent,
  CustomDocumentEditEvent,
  CustomDocumentOpenContext,
  CustomEditorProvider,
  Event,
  ExtensionContext,
  TextDocument,
  Thenable,
  Uri,
  WebviewPanel,
  importVsCodeApi,
} from "https://deno.land/x/vscode@1.80.0/mod.ts";
import { viewType } from "./lib.ts";

export function activate(context: ExtensionContext) {
  const vscode = importVsCodeApi();
  if (vscode === undefined) {
    throw new Error(
      "Could not import vscode api because it was not working within the extension"
    );
  }

  const eventEmitter = new vscode.EventEmitter<
    CustomDocumentContentChangeEvent<CustomDocument>
  >();

  const customEditorProvider: CustomEditorProvider<CustomDocument> = {
    backupCustomDocument: async (
      document: CustomDocument,
      context: CustomDocumentBackupContext,
      cancellation: CancellationToken
    ): Promise<CustomDocumentBackup> => {
      return {
        id: document.uri.toString(),
        delete: () => {},
      };
    },
    onDidChangeCustomDocument: eventEmitter.event,
    openCustomDocument: async (
      uri: Uri,
      openContext: CustomDocumentOpenContext,
      token: CancellationToken
    ): Promise<CustomDocument> => {
      return {
        uri,
        dispose: () => {},
      };
    },
    resolveCustomEditor: async (
      document: CustomDocument,
      webviewPanel: WebviewPanel,
      token: CancellationToken
    ): Promise<void> => {
      webviewPanel.webview.options = {
        enableScripts: true,
      };
      webviewPanel.webview.html = `<!DOCTYPE html>
<html lang="ja">
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <title>Bson Editor</title>
</head>
<body>
  <h1>Bson Editor</h1>
</body>

</html>
`;
    },
    saveCustomDocument: async (
      document: CustomDocument,
      cancellation: CancellationToken
    ): Promise<void> => {},
    saveCustomDocumentAs: async (
      document: CustomDocument,
      destination: Uri,
      cancellation: CancellationToken
    ): Promise<void> => {},
    revertCustomDocument: async (
      document: CustomDocument,
      cancellation: CancellationToken
    ): Promise<void> => {},
  };
  const provider = vscode.window.registerCustomEditorProvider(
    viewType,
    customEditorProvider
  );
  context.subscriptions.push(provider);
}

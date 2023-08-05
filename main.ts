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
import {
  bsonBinaryToStructuredBson,
  DeserializeResult,
  StructuredBson,
  StructuredBsonArray,
} from "./bson.ts";

export function activate(context: ExtensionContext) {
  const vscode = importVsCodeApi();
  if (vscode === undefined) {
    throw new Error(
      "Could not import vscode api because it was not working within the extension",
    );
  }

  const eventEmitter = new vscode.EventEmitter<
    CustomDocumentContentChangeEvent<BsonDocument>
  >();
  /**
   * https://code.visualstudio.com/api/extension-guides/custom-editors
   */
  const customEditorProvider: CustomEditorProvider<BsonDocument> = {
    backupCustomDocument: async (
      document: BsonDocument,
      context: CustomDocumentBackupContext,
      cancellation: CancellationToken,
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
      token: CancellationToken,
    ): Promise<BsonDocument> => {
      return {
        uri,
        data: bsonBinaryToStructuredBson(
          await vscode.workspace.fs.readFile(uri),
        ),
        dispose: () => {},
      };
    },
    resolveCustomEditor: async (
      document: BsonDocument,
      webviewPanel: WebviewPanel,
      token: CancellationToken,
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
      document: BsonDocument,
      cancellation: CancellationToken,
    ): Promise<void> => {},
    saveCustomDocumentAs: async (
      document: BsonDocument,
      destination: Uri,
      cancellation: CancellationToken,
    ): Promise<void> => {},
    revertCustomDocument: async (
      document: BsonDocument,
      cancellation: CancellationToken,
    ): Promise<void> => {},
  };
  const provider = vscode.window.registerCustomEditorProvider(
    viewType,
    customEditorProvider,
  );
  context.subscriptions.push(provider);
}

type BsonDocument = CustomDocument & {
  data: DeserializeResult<StructuredBsonArray>;
};

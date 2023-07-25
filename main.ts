import {
  ExtensionContext,
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

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(viewType, {
      openCustomDocument: async (uri) => {},
    })
  );
}

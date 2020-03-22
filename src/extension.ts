import * as vscode from 'vscode';
import { registerExplorer } from './shortcutExplorer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {
	// register a content provider for the cowsay-scheme
	const myScheme = 'hyper-shortcut';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.path, 'base64').toString();
		}
	};

	subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));
	registerExplorer();
}

// this method is called when your extension is deactivated
export function deactivate() {}

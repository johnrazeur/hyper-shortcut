import * as assert from 'assert';
import { TreeDataProvider } from '../../shortcutExplorer';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', async (): Promise<void> => {
	vscode.window.showInformationMessage('Start all tests.');
	let provider: TreeDataProvider;
	setup('extension', function (this: Mocha.IHookCallbackContext, done: MochaDone): void {
		this.timeout(15000);
		async function mySetup(): Promise<void> {
			let extension = vscode.extensions.getExtension('johnrazeur.hyper-shortcut');
			assert(extension, "Extension not found");
			await extension!.activate();
		}

		mySetup().then(done, (err) => {
			assert.fail(`Setup failed: ${err.message}`);
		});
	});

	test('Sample test', () => {
		console.log(process.cwd());
		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});

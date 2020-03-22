import * as fs from 'fs';
import * as mustache from 'mustache';
import * as path from 'path';
import * as vscode from 'vscode';

import { ShortcutItem } from "./shortcutItem";
import { InsertType, Shortcut } from './shortcutExplorer';
import { State } from './multiStepInput';

export class Renderer
{
    // private templatesPath: string;

    public constructor()
    {
        // this.templatesPath = templatesPath;
    }

    public async render(values: State, item: ShortcutItem)
    {
        const { shortcut } = item;
        if (!shortcut) {
            return;
        }

        const contentTemplate = path.join(item.workspaceFolder, shortcut.templatesPath, `${shortcut.template}.tpl`);
        const renderedTemplate = this.getRendererContent(contentTemplate, values);

        switch (shortcut.type) {
            case InsertType.Create:
                await this.create(values, shortcut, item.workspaceFolder, renderedTemplate);
                break;
            case InsertType.Insert:
                await this.insert(renderedTemplate);
                break;
        }
    }

    private async create(values: State, shortcut: Shortcut, workspaceFolder: string, content: string)
    {
        const filename = shortcut.path.replace('{{name}}', values.name);
        const insertPath = path.join(workspaceFolder, filename);
        fs.writeFileSync(insertPath, content);
        const document = await vscode.workspace.openTextDocument(insertPath);
        await vscode.window.showTextDocument(document);
    
        // If we provide an information file
        if (shortcut.info) {
            const infoFile = path.join(workspaceFolder, shortcut.templatesPath, `${shortcut.info}.tpl`);
            const renderInfo = this.getRendererContent(infoFile, values);
        
            const uri = vscode.Uri.parse('hyper-shortcut:' + Buffer.from(renderInfo).toString('base64'));
            const infoDocument = await vscode.workspace.openTextDocument(uri);
            vscode.languages.setTextDocumentLanguage(infoDocument, "markdown");
            await vscode.window.showTextDocument(infoDocument, { preview: false, viewColumn: vscode.ViewColumn.Beside });
        }
    }

    private async insert(content: string)
    {
        const textEditor = vscode.window.activeTextEditor;
        const position = textEditor?.selection.active;

        if (!position) {
            return;
        }

        textEditor?.edit(editBuilder => {
            editBuilder.insert(position, content);
        });
    }

    private getRendererContent(templatePath: string, values: State)
    {
        const file = fs.readFileSync(templatePath, 'utf8');
        return mustache.render(file, values);
    }
}
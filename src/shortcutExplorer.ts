import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MultiStepInput } from './multiStepInput';
import { Renderer } from './renderer';
import { ShortcutItem } from './shortcutItem';


export interface Shortcut {
  type: InsertType;
  name: string; 
  group: string;
  prompt: string;
  path: string;
  info: string;
  template: string;
  templatesPath: string;
  actions: Action[];
}

export enum InsertType {
  Create = 'create',
  Insert = 'insert'
}

export interface Action {
  type: string;
  name: string;
  prompt: string;
}


export function registerExplorer() {
  const treeDataProvider = new TreeDataProvider(vscode.workspace.workspaceFolders);
	vscode.commands.registerCommand('hyper-shortcut.refresh', () => treeDataProvider.refresh(vscode.workspace.workspaceFolders));
  vscode.window.registerTreeDataProvider('hyper-shortcut', treeDataProvider);
  vscode.commands.registerCommand("hyper-shortcut.selectNode", async (item: ShortcutItem) => {
    const { shortcut } = item;
    if (!shortcut) {
      return;
    }

    const multiStepInput = new MultiStepInput();
    if (shortcut.actions) {
      multiStepInput.registerActions(shortcut.actions);
    }
    const values = await multiStepInput.run(item.label);
    const renderer = new Renderer();
    await renderer.render(values, item);
  });
}

export class TreeDataProvider implements vscode.TreeDataProvider<ShortcutItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ShortcutItem | null> = new vscode.EventEmitter<ShortcutItem | null>();
  readonly onDidChangeTreeData: vscode.Event<ShortcutItem|null> = this._onDidChangeTreeData.event;

  data: ShortcutItem[] = [];

  public constructor(workspaces: vscode.WorkspaceFolder[] | undefined) {
    this.build(workspaces);
  }

  public getTreeItem(element: ShortcutItem): ShortcutItem|Thenable<ShortcutItem> {
    return element;
  }

  public getChildren(element?: ShortcutItem|undefined): vscode.ProviderResult<ShortcutItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  public refresh(workspaces: vscode.WorkspaceFolder[] | undefined) {
    this.data = [];
    this.build(workspaces);
    this._onDidChangeTreeData.fire();
  }

  private getShortcuts(workspace: vscode.WorkspaceFolder, shortcutPath: string): ShortcutItem[] {
    const configPath = path.join(workspace.uri.fsPath, shortcutPath);
    const shortcutsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const items = shortcutsConfig.shortcuts.map((shortcut: Shortcut) => {
      shortcut = {
        ...shortcut,
        templatesPath: shortcutsConfig.templatesPath
      };
      return new ShortcutItem(shortcut.name, workspace.uri.fsPath, shortcut);
    });

    return items;
  }

  private build(workspaces: vscode.WorkspaceFolder[] | undefined) {
    if (!workspaces) {
      return;
    }

    workspaces.map(workspace => {
      const shortcuts = this.getShortcuts(workspace, 'hyper-shortcut.json');
      const groups = [ ...new Set(shortcuts.map(shortcut => shortcut.group)) ];
      let shortcutItems: ShortcutItem[] = [];
      groups.map(group => {
        if (!group) {
          return;
        }
        shortcutItems = [
          ...shortcutItems,
          new ShortcutItem(group, '', undefined, shortcuts.filter(shortcut => shortcut.group === group))
        ];
      });

      // Create workspace item
      this.data = [
        ...this.data,
        new ShortcutItem(workspace.name, '', undefined, shortcutItems)
      ];
    });
  }
}

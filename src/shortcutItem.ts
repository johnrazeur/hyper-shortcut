import * as vscode from 'vscode';
import { Shortcut } from './shortcutExplorer';

export class ShortcutItem extends vscode.TreeItem {
    children: ShortcutItem[]|undefined;
    group?: string;
    workspaceFolder: string;
    shortcut?: Shortcut;
    label: string;
  
    public constructor(label: string, workspaceFolder: string, shortcut?: Shortcut, children?: ShortcutItem[]) {
      super(
          label,
          children === undefined ? vscode.TreeItemCollapsibleState.None :
                                   vscode.TreeItemCollapsibleState.Expanded);
      this.children = children;
      this.shortcut = shortcut;
      this.workspaceFolder = workspaceFolder;
      this.label = label;

      if (this.shortcut) {
        this.group = this.shortcut.group;
        if (this.shortcut.type === 'create') {
            this.shortcut.actions = this.shortcut.actions ?? [];
            this.shortcut.actions.unshift({
            name: 'name',
            prompt: 'Name of the file',
            type: 'input'
            });
        }
      }
      
      if (!children) {
        this.command = {
            command: 'hyper-shortcut.selectNode',
            title: 'Select Shortcut',
            arguments: [this]
        };
      }
    }
  }
  
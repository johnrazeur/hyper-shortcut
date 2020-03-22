import * as vscode from 'vscode';
import { QuickPickItem, QuickInputButton, QuickInput, Disposable, QuickInputButtons } from 'vscode';
import { Action } from './shortcutExplorer';

class InputFlowAction {
	private constructor() { }
	static back = new InputFlowAction();
	static cancel = new InputFlowAction();
	static resume = new InputFlowAction();
}

enum InputType {
	Input = 'input',
	QuickPick = 'quickPick'
}

interface QuickPickParameters<T extends QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	placeholder: string;
	buttons?: QuickInputButton[];
}

interface InputBoxParameters {
	title: string;
	step: number;
	totalSteps: number;
	value: string;
	prompt: string;
	buttons?: QuickInputButton[];
}

interface UserVariable {
    name: string;
    value: string;
}

interface ActionShortcut {
    type: string;
    name: string; 
	prompt: string;
	items?: string[];
}

export interface State {
	[key: string]: string
}

export class MultiStepInput {
	private current?: QuickInput;
    private actions: ActionShortcut[] = [];
	private variables: UserVariable[] = [];
	private step = 0;
	private totalSteps = 0;

	public registerActions(actions: Action[]) {
		this.actions = actions;
		this.totalSteps = actions.length;
	}

	public async run(title: string): Promise<State> {
		let action = this.actions[0];
		let state: State = {
			name: ''
		};

		while (action) {
			try {
				let value = '';
				if (action.type === InputType.Input) {
					value = await this.showInputBox({ title, step: this.step + 1 , totalSteps: this.totalSteps, value: '', prompt: action.prompt });
				} else if (action.type === InputType.QuickPick) {
					if (action.items) {
						const items = action.items.map<QuickPickItem>(item =>  ({label: item}) );
						const quickPickItem = await this.showQuickPick({ title, step: this.step + 1 , totalSteps: this.totalSteps, items, placeholder: action.prompt});
						value = quickPickItem.label;
					}
				}
				state = {
					...state,
					[action.name]: value
				};
				this.step++;
				if (this.step === this.totalSteps) {
					break;
				}
				action = this.actions[this.step];
			} catch (err) {
				if (err === InputFlowAction.back) {
					this.step--;
					action = this.actions[this.step];
				}
			}

		}
		this.current?.dispose();

		return state;
	}
    
    public registerAction(action: ActionShortcut, variableName: string) {
        this.actions.push(action);
        this.variables.push({
            name: variableName,
            value: ''
        });
    }

	async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder, buttons }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = vscode.window.createQuickPick<T>();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.actions.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

    async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, buttons }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = vscode.window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.buttons = [
					...(this.actions.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidAccept(async () => {
						resolve(input.value);
						input.enabled = true;
						input.busy = false;
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}
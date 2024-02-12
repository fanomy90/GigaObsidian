import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { sendToChatGPT } from './gptInteraction';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	llmProviderSetting: string;
	apiKeySetting: string;
	basePathSetting: string;
	modelSetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	llmProviderSetting: 'default',
	apiKeySetting: 'default',
	basePathSetting: 'default',
	modelSetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		//добавляем свой функционал
		//добавим контекстное меню
		this.addContextMenu();
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	addContextMenu() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item.setTitle('Обработать текст в ChatGPT');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						await this.processSelectText();
					});
				});
			})
		);
	}

	async processSelectText() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			const editor = activeView.editor;
			const selectedText = editor.getSelection();
			if (selectedText.trim() !== '') {
				try {
					//отправка на обработку
					const gptResponse = await this.sendToChatGPT(selectedText);
					//вставка ответа
					editor.replaceSelection(gptResponse);
					//втсавка строчкой ниже
					const currentPosition = editor.getCursor();
					editor.replaceRange(gptResponse, currentPosition);
				} catch (error) {
					console.error('Ошибка обработки текста: ', error);
					new Notice('Ошибка обработки текста. Подробности в консоли');
				}
			}
		}
	}

	async sendToChatGPT(text: string): Promise<string> {
		//добавить логику отправки текста в chatGpt
		const apiUrl = '';
		const response = await fetch(apiUrl,  {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text: text }),
		});
		const data = await response.json();
		return data.response;
	}
	//конец эксперимента

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	//мой неработающий код для отслеживания текста и передачи его в chatgpt
	private addTextSelectionHandler() {
		this.registerEvent(
			this.app.workspace.on('selectionChanged', (view, selection) => {
				// Проверяем, что это MarkdownView
				if (view instanceof MarkdownView) {
					// Обработка изменения выделения текста
					const selectedText = selection;
					if (selectedText.trim() !== '') {
						// Отправка текста на обработку модели GPT
						sendToChatGPT(selectedText)
							.then((gptResponse) => {
								// Вставка ответа в редактор заметок
								view.editor.replaceSelection(gptResponse);
							});
					}
				}
			})
		);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Настройки плагина GigaObsidian'});
		new Setting(containerEl)
			.setName('LLM Provider')
			.setDesc('LLM Provider')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.llmProviderSetting)
				.onChange(async (value) => {
					this.plugin.settings.llmProviderSetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('API Key')
			.setDesc('API Key')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.apiKeySetting)
				.onChange(async (value) => {
					this.plugin.settings.apiKeySetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Base Path')
			.setDesc('Base Path')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.basePathSetting)
				.onChange(async (value) => {
					this.plugin.settings.basePathSetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Model')
			.setDesc('Model')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.modelSetting)
				.onChange(async (value) => {
					this.plugin.settings.modelSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
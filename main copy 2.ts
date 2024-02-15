import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
//import sendChatCompletionRequest from './gigachat.js';
// Remember to rename these classes and interfaces!
import axios from 'axios';
import https from 'https';

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
		//this.addSettingTab(new SampleSettingTab(this.app, this));

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
					//const gptResponse = await this.sendToChatGPT(selectedText);
					const gigaResponse = await sendChatCompletionRequest(selectedText);
					//вставка ответа
					//editor.replaceSelection(gptResponse);
					editor.replaceSelection(gigaResponse)
					//втсавка строчкой ниже
					const currentPosition = editor.getCursor();
					//editor.replaceRange(gptResponse, currentPosition);
					editor.replaceRange(gigaResponse, currentPosition);
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
	//обработка получения токена
	
	async function getAccessToken() {
		let accessTokenInfo = null;
		if (accessTokenInfo) {
			const expirationTime = new Date(accessTokenInfo.expires_at).getTime();
			const currentTime = new Date().getTime();
			console.log('Expiration Time:', expirationTime);
			console.log('Current Time:', currentTime);
			if (expirationTime > currentTime) {
				// Возвращаем действующий токен, если он еще действителен
				console.log('Возврат сформированного ранее токена: ', accessTokenInfo.access_token);
				return accessTokenInfo.access_token;
			} else {
				console.log('Токен истек или недействителен. Формирование нового токена.');
			}
		} else {
			console.log('accessTokenInfo не определён или равен null. Запрашиваем новый токен.');
		}
		// Иначе запрашиваем новый токен
		const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
		const requestBody = {
			scope: 'GIGACHAT_API_PERS',
		};
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
			'Authorization': 'N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
		};
		const axiosConfig = {
			headers,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Добавляем эту опцию для обхода проблемы с самоподписанным сертификатом
		};
		try {
			const response = await axios.post(apiUrl, requestBody, axiosConfig);
			if (response.status === 200) {
				accessTokenInfo = {
					access_token: response.data.access_token,
					expires_at: response.data.expires_at,
				};
				console.log('Получен новый токен: ', accessTokenInfo.access_token);
				console.log('Новый токен будет доступен до: ', new Date(accessTokenInfo.expires_at));
				//console.log('Текущее время ', int64Timestamp);
				console.log('Время токена ', accessTokenInfo.expires_at);
				return accessTokenInfo.access_token;
			} else {
				console.error('Error:', response.status, response.statusText);
				return null;
			}
		} catch (error) {
			console.error('Error:', error.message);
			return null;
		}
	}
	
	//работа с сообщениями GigaChat
	async function sendChatCompletionRequest(messageContent) {
	    //получим токен из функции выше 
		const accessToken = await getAccessToken();
		const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
		const requestData = {
			model: 'GigaChat:latest',
			messages: [
				{
					role: 'user',
					content: messageContent,
				},
			],
			temperature: 1.0,
			top_p: 0.1,
			n: 1,
			stream: false,
			max_tokens: 512,
			repetition_penalty: 1,
		};
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `Bearer ${accessToken}`,
		};
		const axiosConfig = {
			headers,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
		};
		try {
			const response = await axios.post(apiUrl, requestData, axiosConfig);
			return response.data;
		} catch (error) {
			console.error('Error:', error.message);
			return null;
		}
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
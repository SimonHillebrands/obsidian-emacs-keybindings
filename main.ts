import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class EmacsKeybindings extends Plugin {
	settings: MyPluginSettings;

  private isComposing(view: MarkdownView): boolean {
    // @ts-expect-error TS2339: Property 'cm' does not exist on type 'Editor'
    const editorView = view.editor.cm as EditorView
    return editorView.composing
  }

	async onload() {

		await this.loadSettings();


		//Movement commands
		this.addCommand({
			id: "cursor-forward-char",
			name: "Cursor forward char (Move the cursor one character to the right)",
			hotkeys: [{ modifiers: ["Ctrl"], key: "f" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  if (this.isComposing(view))
				return;
				const currentPosition = editor.getCursor(); // Get the current cursor position
				const newPosition = { line: currentPosition.line, ch: currentPosition.ch + 1 }; // Move one character forward
				editor.setCursor(newPosition); 
			}
		  });

		  this.addCommand({
			id: "cursor-backward-char",
			name: "Cursor backward char (Move the cursor one character to the left)",
			hotkeys: [{ modifiers: ["Ctrl"], key: "b" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  if (this.isComposing(view))
				return;
				const currentPosition = editor.getCursor(); // Get the current cursor position
				const newPosition = { line: currentPosition.line, ch: currentPosition.ch - 1 }; // Move one character forward
				editor.setCursor(newPosition); 
			}
		  });

		  this.addCommand({
			id: "cursor-forward-word",
			name: "Cursor forward word (Move the cursor one word to the right)",
			hotkeys: [{ modifiers: ["Alt"], key: "f" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  if (this.isComposing(view))
				return;
				const currentPosition = editor.getCursor(); // Get the current cursor position
				const newPosition = { line: currentPosition.line, ch: currentPosition.ch + 1 }; // Move one character forward
				editor.moveByGroup(0, 1, true); 
			}
		  });		  

		  this.addCommand({
			id: "cursor-up-line",
			name: "Cursor forward word (Move the cursor one word to the right)",
			hotkeys: [{ modifiers: ["Ctrl"], key: "p" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  if (this.isComposing(view))
				return;
				const currentPosition = editor.getCursor(); // Get the current cursor position
				const newPosition = { line: currentPosition.line, ch: currentPosition.ch + 1 }; // Move one character forward
				editor.moveVertically(0, true, 1);
			}
		  });	

		  this.addCommand({
			id: "cursor-down-line",
			name: "Cursor forward word (Move the cursor one word to the right)",
			hotkeys: [{ modifiers: ["Ctrl"], key: "n" }],
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  if (this.isComposing(view))
				return;
				const currentPosition = editor.getCursor(); // Get the current cursor position
				const newPosition = { line: currentPosition.line, ch: currentPosition.ch + 1 }; // Move one character forward
				editor.moveVertically(0, false, 1);
			}
		  });	 
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
	}

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
	plugin: EmacsKeybindings;

	constructor(app: App, plugin: EmacsKeybindings) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

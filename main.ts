import { App, Plugin, PluginSettingTab, Setting, Modal, Editor, EditorPosition, Notice } from 'obsidian';
import Anthropic from '@anthropic-ai/sdk';

// ==================== AGENT SYSTEM ====================

interface Agent {
	id: string;
	name: string;
	type: 'claude' | 'custom';
	model?: string;
	systemPrompt?: string;
	isAvailable(): boolean;
	executePrompt(prompt: string): Promise<string>;
}

interface AgentDefinition {
	id: string;
	name: string;
	type: 'claude' | 'custom';
	model?: string;
	systemPrompt?: string;
	apiKey?: string;
	enabled: boolean;
}

class AgentRegistry {
	private agents: Map<string, Agent> = new Map();

	register(agent: Agent): void {
		this.agents.set(agent.id, agent);
	}

	getAgent(idOrName: string): Agent | null {
		if (this.agents.has(idOrName)) {
			return this.agents.get(idOrName) || null;
		}

		for (const agent of this.agents.values()) {
			if (agent.name === idOrName) {
				return agent;
			}
		}

		return null;
	}

	getAvailableAgents(): Agent[] {
		return Array.from(this.agents.values()).filter(a => a.isAvailable());
	}

	getDefaultAgent(defaultId: string): Agent | null {
		return this.getAgent(defaultId);
	}

	getAllAgents(): Agent[] {
		return Array.from(this.agents.values());
	}

	unregister(id: string): void {
		this.agents.delete(id);
	}
}

// Claude implementation of Agent interface
class ClaudeAgent implements Agent {
	id: string;
	name: string;
	type: 'claude' = 'claude';
	model: string;
	systemPrompt: string;
	private claudeClient: Anthropic | null = null;
	private apiKey: string;

	constructor(
		id: string,
		name: string,
		model: string,
		apiKey: string,
		systemPrompt: string
	) {
		this.id = id;
		this.name = name;
		this.model = model;
		this.apiKey = apiKey;
		this.systemPrompt = systemPrompt;
		this.initializeClient();
	}

	private initializeClient() {
		if (this.apiKey) {
			this.claudeClient = new Anthropic({
				apiKey: this.apiKey,
			});
		}
	}

	isAvailable(): boolean {
		return this.claudeClient !== null && this.apiKey !== '';
	}

	async executePrompt(prompt: string): Promise<string> {
		if (!this.claudeClient) {
			throw new Error('Claude client not initialized');
		}

		try {
			const message = await this.claudeClient.messages.create({
				model: this.model,
				max_tokens: 2048,
				system: this.systemPrompt,
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
			});

			const textContent = message.content.find((block) => block.type === 'text');
			if (textContent && textContent.type === 'text') {
				return textContent.text;
			}

			throw new Error('No text content in Claude response');
		} catch (error) {
			console.error('Claude execution error:', error);
			throw error;
		}
	}
}

interface ClaudePluginSettings {
	apiKey: string;
	model: string;
	maxTokens: number;
	temperature: number;
	systemPrompt: string;
	agents: AgentDefinition[];
	defaultAgent: string;
}

const DEFAULT_SETTINGS: ClaudePluginSettings = {
	apiKey: '',
	model: 'claude-3-5-sonnet-20241022',
	maxTokens: 2048,
	temperature: 0.7,
	systemPrompt: 'You are a helpful AI assistant integrated with Obsidian. Help the user enhance their notes with clarity, structure, and insights.',
	agents: [
		{
			id: 'claude-sonnet',
			name: 'Claude Sonnet',
			type: 'claude',
			model: 'claude-3-5-sonnet-20241022',
			systemPrompt: 'You are a helpful AI assistant integrated with Obsidian.',
			enabled: true,
		},
		{
			id: 'claude-opus',
			name: 'Claude Opus',
			type: 'claude',
			model: 'claude-3-opus-20250219',
			systemPrompt: 'You are a helpful AI assistant integrated with Obsidian.',
			enabled: true,
		},
	],
	defaultAgent: 'claude-sonnet',
};

export default class ClaudeIntegrationPlugin extends Plugin {
	settings: ClaudePluginSettings;
	claudeClient: Anthropic | null = null;
	agentRegistry: AgentRegistry = new AgentRegistry();

	async onload() {
		console.log('Loading Claude Integration Plugin');

		// Load settings
		await this.loadSettings();

		// Initialize Claude client if API key is present
		if (this.settings.apiKey) {
			this.initializeClaudeClient();
		}

		// Initialize agents from settings
		this.initializeAgents();

		// Add commands
		this.addCommands();

		// Add settings tab
		this.addSettingTab(new ClaudeSettingTab(this.app, this));

		// Register UI handlers
		this.registerEditorCallbacks();
	}

	onunload() {
		console.log('Unloading Claude Integration Plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Reinitialize Claude client and agents with new settings
		if (this.settings.apiKey) {
			this.initializeClaudeClient();
			this.initializeAgents();
		}
	}

	private initializeClaudeClient() {
		try {
			this.claudeClient = new Anthropic({
				apiKey: this.settings.apiKey,
			});
			new Notice('Claude client initialized successfully');
		} catch (error) {
			new Notice('Failed to initialize Claude client. Check your API key.');
			console.error('Claude initialization error:', error);
		}
	}

	private initializeAgents() {
		// Clear existing agents
		this.agentRegistry.getAllAgents().forEach(agent => {
			this.agentRegistry.unregister(agent.id);
		});

		// Register agents from settings
		for (const agentDef of this.settings.agents) {
			if (!agentDef.enabled) continue;

			if (agentDef.type === 'claude') {
				const agent = new ClaudeAgent(
					agentDef.id,
					agentDef.name,
					agentDef.model || 'claude-3-5-sonnet-20241022',
					this.settings.apiKey,
					agentDef.systemPrompt || this.settings.systemPrompt
				);
				this.agentRegistry.register(agent);
			}
			// Future: Add support for custom agent types here
		}

		console.log(`Initialized ${this.agentRegistry.getAllAgents().length} agents`);
	}

	private addCommands() {
		// /ain slash command - handles inline REPL-style responses
		this.addCommand({
			id: 'execute-ain-command',
			name: 'Execute /ain command',
			editorCallback: (editor: Editor) => this.executeAinCommand(editor),
			hotkeys: [
				{
					modifiers: ['Shift'],
					key: 'Enter',
				},
			],
		});

		// Enhance selected text with Claude
		this.addCommand({
			id: 'enhance-text',
			name: 'Enhance selected text',
			editorCallback: (editor: Editor) => this.enhanceSelectedText(editor),
		});

		// Summarize selected text
		this.addCommand({
			id: 'summarize-text',
			name: 'Summarize selected text',
			editorCallback: (editor: Editor) => this.summarizeSelectedText(editor),
		});

		// Expand selected text with more detail
		this.addCommand({
			id: 'expand-text',
			name: 'Expand selected text',
			editorCallback: (editor: Editor) => this.expandSelectedText(editor),
		});

		// Generate outline from selection
		this.addCommand({
			id: 'generate-outline',
			name: 'Generate outline from text',
			editorCallback: (editor: Editor) => this.generateOutline(editor),
		});

		// Ask Claude about selected text
		this.addCommand({
			id: 'ask-claude',
			name: 'Ask Claude about selected text',
			editorCallback: (editor: Editor) => this.askClaudeAboutText(editor),
		});

		// Chat with Claude
		this.addCommand({
			id: 'claude-chat',
			name: 'Open Claude chat window',
			callback: () => new ClaudeChatModal(this.app, this).open(),
		});
	}

	private registerEditorCallbacks() {
		// Register change event to detect /ain commands
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor: Editor) => {
				this.detectAndHandleSlashCommand(editor);
			})
		);

		this.registerInterval(
			window.setInterval(() => {
				if (this.claudeClient) {
					console.log('Claude plugin active and ready');
				}
			}, 60000) // Check every minute
		);
	}

	private detectAndHandleSlashCommand(editor: Editor) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);

		// Only check if we're at the end of the line (typing)
		if (cursor.ch < line.length - 1) return;

		// Detect if /ain command is being typed at start of line
		if (this.detectSlashCommandAtCursor(line, cursor.ch)) {
			// Parse the complete command when line ends with space or on Enter
			const parsed = this.parseSlashCommand(line);
			if (parsed) {
				// Don't trigger yet - wait for Enter key
				console.log('Slash command detected, ready to execute:', parsed);
			}
		}
	}

	private parseSlashCommand(text: string): { agentTag: string | null; prompt: string } | null {
		// Match: /ain [agent:name] prompt
		// or: /ain [sonnet] prompt
		// or: /ain prompt (no agent specified)
		const match = text.match(/^\/ain\s+(?:\[([^\]]+)\]\s+)?(.+)$/);
		if (!match) return null;

		const agentTag = match[1] || null;
		const prompt = match[2].trim();

		if (!prompt) return null;

		return { agentTag, prompt };
	}

	private parseAgentTag(tag: string): { type?: string; agent: string } {
		// Formats: "claude", "agent:claude", "model:gpt4", etc.
		const colonMatch = tag.match(/^([^:]+):(.+)$/);
		if (colonMatch) {
			return {
				type: colonMatch[1],
				agent: colonMatch[2],
			};
		}

		// Simple format: just agent name
		return { agent: tag };
	}

	private detectSlashCommandAtCursor(line: string, cursorPos: number): boolean {
		const textBeforeCursor = line.substring(0, cursorPos);
		const trimmed = textBeforeCursor.trimStart();
		// Must have complete /ain (4 characters minimum) at line start
		return trimmed.startsWith('/ain') && trimmed.length >= 4;
	}

	private formatReplResponse(prompt: string, response: string): string {
		return `> ${prompt}\n${response}`;
	}

	private async executeAinCommand(editor: Editor) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);

		// Check if this line contains /ain command
		const parsed = this.parseSlashCommand(line);
		if (!parsed) {
			return; // Not a /ain command
		}

		// Determine which agent to use
		let agent: Agent | null = null;

		if (parsed.agentTag) {
			// User specified an agent tag
			const tagParsed = this.parseAgentTag(parsed.agentTag);
			agent = this.agentRegistry.getAgent(tagParsed.agent);

			if (!agent) {
				new Notice(`Agent not found: ${parsed.agentTag}`);
				return;
			}
		} else {
			// Use default agent
			agent = this.agentRegistry.getDefaultAgent(this.settings.defaultAgent);

			if (!agent) {
				new Notice('No default agent configured');
				return;
			}
		}

		if (!agent.isAvailable()) {
			new Notice(`Agent "${agent.name}" is not available`);
			return;
		}

		new Notice(`Calling ${agent.name}...`);

		try {
			const response = await agent.executePrompt(parsed.prompt);
			const formatted = this.formatReplResponse(parsed.prompt, response);

			// Replace the /ain command line with REPL-formatted response
			editor.setLine(cursor.line, formatted);

			// Move cursor to end of response
			const lines = formatted.split('\n');
			editor.setCursor({
				line: cursor.line + lines.length - 1,
				ch: lines[lines.length - 1].length,
			});

			new Notice(`${agent.name} response inserted (REPL style)`);
		} catch (error) {
			new Notice(`Error calling ${agent.name}`);
			console.error('Agent execution error:', error);
		}
	}

	private async enhanceSelectedText(editor: Editor) {
		if (!this.claudeClient) {
			new Notice('Claude API key not configured');
			return;
		}

		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('Please select text to enhance');
			return;
		}

		const prompt = `Please enhance the following text to improve clarity, grammar, and overall quality. Preserve the original meaning and intent:\n\n${selectedText}`;

		await this.callClaudeAndInsert(editor, prompt);
	}

	private async summarizeSelectedText(editor: Editor) {
		if (!this.claudeClient) {
			new Notice('Claude API key not configured');
			return;
		}

		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('Please select text to summarize');
			return;
		}

		const prompt = `Please provide a concise summary of the following text:\n\n${selectedText}`;

		await this.callClaudeAndInsert(editor, prompt);
	}

	private async expandSelectedText(editor: Editor) {
		if (!this.claudeClient) {
			new Notice('Claude API key not configured');
			return;
		}

		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('Please select text to expand');
			return;
		}

		const prompt = `Please expand on the following text with more detail, examples, and explanation:\n\n${selectedText}`;

		await this.callClaudeAndInsert(editor, prompt);
	}

	private async generateOutline(editor: Editor) {
		if (!this.claudeClient) {
			new Notice('Claude API key not configured');
			return;
		}

		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('Please select text to outline');
			return;
		}

		const prompt = `Generate a detailed outline for the following text:\n\n${selectedText}\n\nFormat the outline as a hierarchical list using markdown.`;

		await this.callClaudeAndInsert(editor, prompt);
	}

	private async askClaudeAboutText(editor: Editor) {
		if (!this.claudeClient) {
			new Notice('Claude API key not configured');
			return;
		}

		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('Please select text to ask about');
			return;
		}

		new AskClaudeModal(this.app, this, selectedText).open();
	}

	async callClaudeAPI(prompt: string): Promise<string> {
		if (!this.claudeClient) {
			throw new Error('Claude client not initialized');
		}

		try {
			const message = await this.claudeClient.messages.create({
				model: this.settings.model,
				max_tokens: this.settings.maxTokens,
				system: this.settings.systemPrompt,
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
			});

			const textContent = message.content.find((block) => block.type === 'text');
			if (textContent && textContent.type === 'text') {
				return textContent.text;
			}

			throw new Error('No text content in Claude response');
		} catch (error) {
			console.error('Claude API error:', error);
			throw error;
		}
	}

	private async callClaudeAndInsert(editor: Editor, prompt: string) {
		new Notice('Calling Claude...');

		try {
			const response = await this.callClaudeAPI(prompt);
			const cursor = editor.getCursor();
			editor.replaceSelection(response);
			new Notice('Claude response inserted');
		} catch (error) {
			new Notice('Error calling Claude API');
			console.error('Error:', error);
		}
	}
}

class ClaudeSettingTab extends PluginSettingTab {
	plugin: ClaudeIntegrationPlugin;

	constructor(app: App, plugin: ClaudeIntegrationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Claude Integration Settings' });

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Your Anthropic Claude API key')
			.addText((text) =>
				text
					.setPlaceholder('Enter your API key')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Claude model to use')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet')
					.addOption('claude-3-opus-20250219', 'Claude 3 Opus')
					.addOption('claude-3-haiku-20250307', 'Claude 3 Haiku')
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc('Maximum tokens in Claude response')
			.addText((text) =>
				text
					.setPlaceholder('2048')
					.setValue(String(this.plugin.settings.maxTokens))
					.onChange(async (value) => {
						this.plugin.settings.maxTokens = parseInt(value) || 2048;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Response creativity (0-1)')
			.addText((text) =>
				text
					.setPlaceholder('0.7')
					.setValue(String(this.plugin.settings.temperature))
					.onChange(async (value) => {
						this.plugin.settings.temperature = parseFloat(value) || 0.7;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc('Instructions for Claude behavior')
			.addTextArea((text) =>
				text
					.setPlaceholder('Enter system prompt')
					.setValue(this.plugin.settings.systemPrompt)
					.onChange(async (value) => {
						this.plugin.settings.systemPrompt = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

class ClaudeChatModal extends Modal {
	plugin: ClaudeIntegrationPlugin;
	messages: Array<{ role: string; content: string }> = [];

	constructor(app: App, plugin: ClaudeIntegrationPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Chat with Claude' });

		const chatArea = contentEl.createEl('div', { cls: 'claude-chat-area' });
		chatArea.style.height = '300px';
		chatArea.style.overflowY = 'auto';
		chatArea.style.border = '1px solid var(--background-secondary-alt)';
		chatArea.style.padding = '10px';
		chatArea.style.marginBottom = '10px';

		const inputContainer = contentEl.createEl('div', { cls: 'claude-input-container' });
		inputContainer.style.display = 'flex';
		inputContainer.style.gap = '10px';

		const input = inputContainer.createEl('textarea', { cls: 'claude-input' });
		input.placeholder = 'Ask Claude something...';
		input.style.flex = '1';
		input.style.minHeight = '60px';

		const sendButton = inputContainer.createEl('button', { text: 'Send' });
		sendButton.style.padding = '10px 20px';

		sendButton.onclick = async () => {
			const userMessage = input.value.trim();
			if (!userMessage) return;

			// Add user message to chat
			const userEl = chatArea.createEl('div', { cls: 'message user-message' });
			userEl.style.marginBottom = '10px';
			userEl.style.paddingLeft = '10px';
			userEl.style.borderLeft = '3px solid var(--interactive-accent)';
			userEl.createEl('strong', { text: 'You: ' });
			userEl.createEl('span', { text: userMessage });

			input.value = '';

			// Call Claude
			try {
				const response = await this.plugin.callClaudeAPI(userMessage);

				const assistantEl = chatArea.createEl('div', { cls: 'message assistant-message' });
				assistantEl.style.marginBottom = '10px';
				assistantEl.style.marginTop = '10px';
				assistantEl.style.paddingLeft = '10px';
				assistantEl.style.borderLeft = '3px solid var(--interactive-accent)';
				assistantEl.createEl('strong', { text: 'Claude: ' });
				assistantEl.createEl('span', { text: response });

				chatArea.scrollTop = chatArea.scrollHeight;
			} catch (error) {
				const errorEl = chatArea.createEl('div', { cls: 'message error-message' });
				errorEl.style.color = 'var(--text-error)';
				errorEl.createEl('strong', { text: 'Error: ' });
				errorEl.createEl('span', { text: 'Failed to get response from Claude' });
			}
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class AskClaudeModal extends Modal {
	plugin: ClaudeIntegrationPlugin;
	selectedText: string;

	constructor(app: App, plugin: ClaudeIntegrationPlugin, selectedText: string) {
		super(app);
		this.plugin = plugin;
		this.selectedText = selectedText;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Ask Claude' });

		contentEl.createEl('p', { text: 'Selected text:', cls: 'setting-item-description' });
		contentEl.createEl('blockquote', { text: this.selectedText });

		contentEl.createEl('p', { text: 'Your question:', cls: 'setting-item-description' });
		const input = contentEl.createEl('textarea');
		input.placeholder = 'What would you like to know about this text?';
		input.style.width = '100%';
		input.style.minHeight = '100px';

		const buttonContainer = contentEl.createEl('div', { cls: 'button-container' });
		buttonContainer.style.marginTop = '10px';
		buttonContainer.style.display = 'flex';
		buttonContainer.style.gap = '10px';

		const askButton = buttonContainer.createEl('button', { text: 'Ask Claude' });
		const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });

		askButton.onclick = async () => {
			const question = input.value.trim();
			if (!question) return;

			const prompt = `Here is some text:\n\n${this.selectedText}\n\nThe user's question: ${question}`;

			try {
				const response = await this.plugin.callClaudeAPI(prompt);
				const editor = this.app.workspace.activeEditor?.editor;
				if (editor) {
					const cursor = editor.getCursor();
					editor.setCursor(cursor.line + 1);
					editor.replaceSelection(`\n\n**Claude's Response:**\n${response}`);
				}
				this.close();
			} catch (error) {
				new Notice('Error calling Claude API');
			}
		};

		cancelButton.onclick = () => this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

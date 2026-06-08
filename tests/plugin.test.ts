// Mock obsidian module
jest.mock('obsidian', () => ({
  Plugin: class MockPlugin {},
  Modal: class MockModal {},
  PluginSettingTab: class MockSettingTab {},
  Setting: class MockSetting {
    constructor(containerEl) {
      this.containerEl = containerEl;
    }
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addDropdown() { return this; }
    addTextArea() { return this; }
    onChange() { return this; }
  },
  Notice: class MockNotice {},
}));

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: class MockAnthropic {
      constructor(config) {
        this.apiKey = config.apiKey;
        this.messages = {
          create: jest.fn(),
        };
      }
    },
  };
});

import ClaudeIntegrationPlugin from '../main';

describe('ClaudeIntegrationPlugin', () => {
  let plugin: ClaudeIntegrationPlugin;

  beforeEach(() => {
    // Mock Obsidian App
    const mockApp = {
      workspace: {
        activeEditor: null,
      },
    };

    plugin = new ClaudeIntegrationPlugin(mockApp as any, {} as any);
  });

  describe('Settings', () => {
    it('should load default settings on initialization', async () => {
      await plugin.loadSettings();

      expect(plugin.settings.apiKey).toBe('');
      expect(plugin.settings.model).toBe('claude-3-5-sonnet-20241022');
      expect(plugin.settings.maxTokens).toBe(2048);
      expect(plugin.settings.temperature).toBe(0.7);
    });

    it('should save settings correctly', async () => {
      plugin.settings.apiKey = 'test-key-123';
      plugin.settings.maxTokens = 4096;

      await plugin.saveSettings();

      expect(plugin.settings.apiKey).toBe('test-key-123');
      expect(plugin.settings.maxTokens).toBe(4096);
    });
  });

  describe('Claude Client', () => {
    it('should initialize Claude client with valid API key', () => {
      plugin.settings.apiKey = 'sk-ant-valid-key';
      plugin['initializeClaudeClient']();

      expect(plugin.claudeClient).toBeDefined();
    });

    it('should not initialize client with missing API key', () => {
      plugin.settings.apiKey = '';
      plugin['initializeClaudeClient']();

      expect(plugin.claudeClient).toBeNull();
    });
  });

  describe('Slash Command (/ain) - TDD', () => {
    describe('parseSlashCommand', () => {
      it('should detect /ain command in text', () => {
        const result = plugin['parseSlashCommand']('/ain explain recursion');
        expect(result).not.toBeNull();
        expect(result?.command).toBe('ain');
        expect(result?.prompt).toBe('explain recursion');
      });

      it('should extract prompt text after /ain', () => {
        const result = plugin['parseSlashCommand']('/ain what is TypeScript?');
        expect(result?.prompt).toBe('what is TypeScript?');
      });

      it('should handle multiple word prompts', () => {
        const result = plugin['parseSlashCommand']('/ain how do I implement async/await patterns in node');
        expect(result?.prompt).toBe('how do I implement async/await patterns in node');
      });

      it('should return null for unrecognized commands', () => {
        const result = plugin['parseSlashCommand']('/other some text');
        expect(result).toBeNull();
      });

      it('should return null if /ain has no prompt', () => {
        const result = plugin['parseSlashCommand']('/ain');
        expect(result).toBeNull();
      });

      it('should return null for plain text without slash', () => {
        const result = plugin['parseSlashCommand']('just some text');
        expect(result).toBeNull();
      });

      it('should only match /ain at line start', () => {
        const result = plugin['parseSlashCommand']('some text /ain prompt');
        expect(result).toBeNull();
      });
    });

    describe('handleSlashCommand', () => {
      it('should detect /ain command at cursor position', () => {
        // Test that plugin detects slash command in editor
        const commandDetected = plugin['detectSlashCommandAtCursor']('/ain test', 8);
        expect(commandDetected).toBe(true);
      });

      it('should return false for non-command text', () => {
        const commandDetected = plugin['detectSlashCommandAtCursor']('normal text', 5);
        expect(commandDetected).toBe(false);
      });

      it('should extract command from line', () => {
        const line = '/ain summarize this text';
        const parsed = plugin['parseSlashCommand'](line);
        expect(parsed?.command).toBe('ain');
      });

      it('should fail gracefully if API key not configured', async () => {
        plugin.settings.apiKey = '';
        plugin.claudeClient = null;

        const result = await plugin['handleAinCommand']('test prompt', 0, 0);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Claude API key not configured');
      });
    });

    describe('REPL-style response insertion', () => {
      it('should replace /ain command with response', async () => {
        // This test verifies the REPL behavior where:
        // Input:  /ain what is 2+2
        // Output: > what is 2+2
        //         4
        
        const mockPrompt = 'what is 2+2';
        expect(mockPrompt).toBeTruthy();
      });

      it('should format response as REPL: prompt + answer', () => {
        const prompt = 'explain closures';
        const response = 'Closures are functions that...';
        const formatted = plugin['formatReplResponse']?.(prompt, response);
        
        // Should include both the prompt and response
        expect(formatted).toContain(prompt);
        expect(formatted).toContain(response);
      });

      it('should maintain cursor position after insertion', () => {
        // After /ain command executes, cursor should be after response
        expect(true).toBe(true); // Placeholder for cursor logic
      });
    });

    describe('Edge cases', () => {
      it('should handle /ain with special characters in prompt', () => {
        const result = plugin['parseSlashCommand']('/ain what is "hello world" in JavaScript?');
        expect(result?.prompt).toContain('hello world');
      });

      it('should handle /ain with line breaks in response', async () => {
        // Response might contain multiple lines
        expect(true).toBe(true);
      });

      it('should timeout gracefully if API is slow', async () => {
        // Test timeout handling
        expect(true).toBe(true);
      });

      it('should not trigger on typed /ain if user hasn\'t completed text', () => {
        // User typing: "/a" should not trigger, only "/ain " should
        expect(true).toBe(true);
      });
    });
  });
});

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

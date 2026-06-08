# Development Guide

## Setting Up Your Development Environment

### Prerequisites
- Node.js 16+ and npm
- TypeScript knowledge (plugin is written in TypeScript)
- Familiarity with Obsidian API
- Basic understanding of the Anthropic Claude API

### Clone and Install
```bash
git clone https://github.com/yourusername/obsidian-claude-integration.git
cd obsidian-claude-integration
npm install
```

## Project Structure

```
├── main.ts                      # Main plugin implementation
├── manifest.json                # Plugin metadata
├── styles.css                   # UI styling
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tests/
│   ├── plugin.test.ts          # Plugin tests
│   ├── api.test.ts             # API integration tests
│   └── fixtures/               # Test data
└── docs/
    ├── DEVELOPMENT.md          # This file
    ├── API.md                  # API documentation
    └── EXAMPLES.md             # Usage examples
```

## Build & Development

### Watch Mode (Development)
```bash
npm run dev
```
- Rebuilds on file changes
- Source maps included for debugging
- Output: `main.js`

### Production Build
```bash
npm run build
```
- Minified output
- No source maps
- Production-ready

### Testing
```bash
npm run test
```
Runs Jest test suite. See `tests/` directory for test files.

### Linting
```bash
npm run lint
```
Runs ESLint with TypeScript support.

## Understanding the Plugin Architecture

### Main Plugin Class (`ClaudeIntegrationPlugin`)

Extends Obsidian's `Plugin` class with:

#### Lifecycle Methods
```typescript
async onload() {
  // Called when plugin loads
  // - Initialize settings
  // - Set up Claude client
  // - Register commands
  // - Add UI elements
}

onunload() {
  // Called when plugin unloads
  // Cleanup code
}
```

#### Settings Management
```typescript
async loadSettings() {
  // Loads plugin settings from Obsidian
}

async saveSettings() {
  // Saves and applies new settings
}
```

#### Claude Integration
```typescript
private initializeClaudeClient() {
  // Creates Anthropic SDK client with API key
}

async callClaudeAPI(prompt: string): Promise<string> {
  // Core method that calls Claude API
  // Returns text response
}
```

### Modal Classes

#### ClaudeChatModal
- Provides interactive chat interface
- Manages message history within modal
- Handles send/receive flow

Key methods:
- `onOpen()` - Builds UI elements
- `onClose()` - Cleanup

#### AskClaudeModal
- Specialized for asking questions about selected text
- Wraps text in prompt context
- Inserts response into note

### Settings Tab (`ClaudeSettingTab`)

Extends Obsidian's `PluginSettingTab`:
- API Key input
- Model selection dropdown
- Token and temperature sliders
- System prompt textarea

Uses Obsidian's `Setting` class for each field.

## Adding New Features

### Adding a New Command

1. **Define the command logic** in `ClaudeIntegrationPlugin`:

```typescript
private async myNewFeature(editor: Editor) {
  if (!this.claudeClient) {
    new Notice('Claude API key not configured');
    return;
  }

  const selectedText = editor.getSelection();
  if (!selectedText) {
    new Notice('Please select text');
    return;
  }

  const prompt = `Do something with: ${selectedText}`;
  await this.callClaudeAndInsert(editor, prompt);
}
```

2. **Register the command** in `addCommands()`:

```typescript
this.addCommand({
  id: 'my-new-feature',
  name: 'My New Feature',
  editorCallback: (editor: Editor) => this.myNewFeature(editor),
});
```

3. **Optional: Add keyboard shortcut** to manifest or settings

### Adding a New Setting

1. **Update `ClaudePluginSettings` interface**:

```typescript
interface ClaudePluginSettings {
  // ... existing settings ...
  myNewSetting: string;
}
```

2. **Add default value**:

```typescript
const DEFAULT_SETTINGS: ClaudePluginSettings = {
  // ... existing defaults ...
  myNewSetting: 'defaultValue',
};
```

3. **Add to settings UI** in `ClaudeSettingTab.display()`:

```typescript
new Setting(containerEl)
  .setName('My Setting')
  .setDesc('Description')
  .addText((text) =>
    text
      .setValue(this.plugin.settings.myNewSetting)
      .onChange(async (value) => {
        this.plugin.settings.myNewSetting = value;
        await this.plugin.saveSettings();
      })
  );
```

## API Integration Details

### Making Claude API Calls

The `callClaudeAPI()` method handles all API communication:

```typescript
async callClaudeAPI(prompt: string): Promise<string> {
  const message = await this.claudeClient.messages.create({
    model: this.settings.model,
    max_tokens: this.settings.maxTokens,
    system: this.settings.systemPrompt,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // Extract text from response
  const textContent = message.content.find((block) => block.type === 'text');
  return textContent.text;
}
```

### Response Types
Claude API returns `message.content` array with blocks:
- `TextBlock` - Regular text responses (type: 'text')
- `ToolUseBlock` - Tool calls (type: 'tool_use')
- `ToolResultBlock` - Tool results (type: 'tool_result')

Currently plugin handles `TextBlock` only.

### Error Handling
```typescript
try {
  const response = await this.callClaudeAPI(prompt);
  // Process response
} catch (error) {
  console.error('Claude API error:', error);
  new Notice('Error calling Claude API');
}
```

## Testing

### Running Tests
```bash
npm run test
```

### Test Structure
```typescript
describe('ClaudeIntegrationPlugin', () => {
  let plugin: ClaudeIntegrationPlugin;

  beforeEach(() => {
    // Setup
  });

  test('should initialize with default settings', () => {
    // Test logic
  });
});
```

### Mocking Claude Client
```typescript
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});
```

## Debugging

### Console Logging
The plugin logs to browser console:
```bash
Obsidian → Settings → About → Show debug info (toggle Console)
```

### Debug Plugin Instance
```typescript
console.log('Settings:', this.settings);
console.log('Claude client:', this.claudeClient);
```

### Obsidian Dev Tools
Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) in Obsidian for DevTools.

## Performance Considerations

### Token Usage
- Higher `maxTokens` = longer responses but higher API costs
- Monitor your Anthropic usage dashboard
- Consider using Haiku for frequent, simple operations

### Response Time
- Claude API typically responds in 1-5 seconds
- Network conditions affect latency
- UI blocks during API calls (consider spinner UX)

### Memory Management
- Chat history stored only in modal (cleared on close)
- No persistent cache of responses
- Consider caching for frequently used prompts

## Deployment & Distribution

### Building for Release
```bash
npm run build
npm run lint
npm run test
```

### Creating a Release
1. Update version in `manifest.json` and `package.json`
2. Create git tag: `git tag v1.0.0`
3. Push to GitHub
4. Create GitHub Release with built `main.js`

### Publishing to Community Plugins
1. Fork [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
2. Follow their release process
3. Submit to [Community Plugins list](https://github.com/obsidianmd/obsidian-releases)

## Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Use TypeScript (no JavaScript)
- Test on both desktop and mobile

## Resources

- [Obsidian Plugin Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Anthropic API Docs](https://docs.anthropic.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Common Issues

### "Cannot find module 'obsidian'"
```bash
npm install
```
Ensure all dependencies are installed.

### Plugin doesn't appear in Obsidian
- Check manifest.json is valid JSON
- Ensure plugin is in `.obsidian/plugins/` directory
- Restart Obsidian (Ctrl/Cmd + R)
- Check console for errors (Ctrl/Cmd + Shift + I)

### API Key not working
- Verify key from https://console.anthropic.com
- Ensure key has active usage quota
- Try refreshing the plugin settings

### TypeScript errors on build
```bash
npx tsc --noEmit
```
Check for type errors without building.

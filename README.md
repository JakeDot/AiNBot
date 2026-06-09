# Obsidian Claude Integration Plugin

A powerful Obsidian plugin that seamlessly integrates Claude AI into your note-taking workflow. Enhance your notes with AI-powered writing assistance, analysis, and content generation.

## Features

### Text Enhancement Commands
- **Enhance Selected Text** - Improve grammar, clarity, and overall quality of your writing
- **Summarize Text** - Generate concise summaries of selected content
- **Expand Text** - Add detailed explanations and examples to your notes
- **Generate Outline** - Create hierarchical outlines from existing text
- **Ask Claude** - Ask specific questions about selected text with responses inserted into notes

### Chat Interface
- **Claude Chat Window** - Open an interactive chat modal for real-time conversations with Claude
- Maintains conversation context within the modal
- Supports multi-turn interactions

### Settings & Configuration
- **API Key Management** - Securely store your Anthropic API key
- **Model Selection** - Choose between Claude 3.5 Sonnet, Claude 3 Opus, and Claude 3 Haiku
- **Response Tuning** - Adjust max tokens and temperature for fine-grained control
- **Custom System Prompt** - Define Claude's behavior for your specific use cases


## 🚀 Development Roadmap

This project follows a structured development roadmap with planned features and releases. See the complete planning documentation:

- **[FEATURE-ROADMAP.md](./FEATURE-ROADMAP.md)** - Strategic roadmap for v1.4.0 → v2.0.0+
  - 8 parallel feature branches across 4 development phases
  - Detailed task lists and timeline breakdown
  - Version milestones and feature specifications

- **[BRANCH-CREATION-PLAN.md](./BRANCH-CREATION-PLAN.md)** - Development strategy and branch structure
  - Complete PR templates and descriptions for each feature
  - Dependency graphs and merge order
  - Status tracking matrix

- **[EXECUTION-CHECKLIST.md](./EXECUTION-CHECKLIST.md)** - Ready-to-execute implementation guide
  - Copy-paste git commands for each branch
  - Direct GitHub PR creation URLs
  - Progress tracking and success criteria

**Current Status**: v1.3.0 (Production) | Next Release: v1.4.0 (Q2 2026)

## Installation

### Prerequisites
- Obsidian 0.15.0 or later
- Node.js and npm (for development)
- An Anthropic Claude API key (get one at [console.anthropic.com](https://console.anthropic.com))

### From Community Plugins (Coming Soon)
1. Open Obsidian Settings → Community Plugins
2. Search for "Claude Integration"
3. Click Install
4. Enable the plugin

### Manual Installation
1. Clone this repository to your vault's `.obsidian/plugins/` directory:
   ```bash
   git clone https://github.com/yourusername/obsidian-claude-integration.git \
     /path/to/your/vault/.obsidian/plugins/obsidian-claude-integration
   ```

2. Install dependencies:
   ```bash
   cd obsidian-claude-integration
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Reload Obsidian (Ctrl/Cmd + R)

5. Enable the plugin in Settings → Community Plugins → Installed Plugins

## Usage

### Setup
1. Open Plugin Settings (Settings → Claude Integration)
2. Enter your Anthropic API key
3. (Optional) Customize model, temperature, and system prompt
4. Click outside or navigate away to save

### Text Enhancement Workflows

#### Quick Enhancement
1. Select text in your note
2. Press `Ctrl+Shift+E` (or use Command Palette: "Enhance selected text")
3. Claude processes and replaces your selection with improved text

#### Summarization
1. Select text to summarize
2. Use Command Palette: "Summarize selected text"
3. Receive a concise summary

#### Expansion
1. Select a section you want to develop further
2. Use Command Palette: "Expand selected text"
3. Claude adds detail, examples, and explanations

#### Outline Generation
1. Select text content
2. Use Command Palette: "Generate outline from text"
3. Receive a markdown-formatted outline

#### Targeted Questions
1. Select relevant text
2. Use Command Palette: "Ask Claude about selected text"
3. Enter your question in the modal
4. Response is inserted into your note

### Chat Interface
1. Use Command Palette: "Open Claude chat window"
2. Type your question or instruction
3. Click "Send" or press Enter
4. Maintain multi-turn conversation within the modal
5. Close the modal when done

## Configuration

### API Key
Your Anthropic API key is stored locally and never sent to external servers except when making Claude API calls.

### Model Selection
- **Claude 3.5 Sonnet** (default) - Balanced performance and cost, excellent for most tasks
- **Claude 3 Opus** - Most capable model, best for complex reasoning
- **Claude 3 Haiku** - Fastest and most affordable, suitable for simple tasks

### Advanced Settings

#### Max Tokens
Controls the maximum length of Claude's responses. Default: 2048
- Lower values (512-1024) for quick summaries
- Higher values (2048-4096) for detailed content generation

#### Temperature
Controls response creativity (0.0 to 1.0):
- 0.0-0.3: Focused, deterministic responses (good for analysis)
- 0.4-0.7: Balanced creativity and consistency (default: 0.7)
- 0.8-1.0: More creative and varied responses (good for brainstorming)

#### System Prompt
Default: "You are a helpful AI assistant integrated with Obsidian. Help the user enhance their notes with clarity, structure, and insights."

Examples for custom prompts:
- Academic writing: "You are an expert academic editor specializing in clear, rigorous writing..."
- Creative writing: "You are a creative writing coach who helps develop vivid, engaging prose..."
- Technical docs: "You are a technical documentation expert who ensures clarity and precision..."

## Architecture

### Project Structure
```
obsidian-claude-integration/
├── main.ts                 # Main plugin class and commands
├── manifest.json           # Obsidian plugin metadata
├── styles.css              # Plugin UI styles
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── README.md               # This file
├── tests/                  # Test suite
│   ├── plugin.test.ts
│   ├── api.test.ts
│   └── fixtures/
└── docs/                   # Additional documentation
    ├── DEVELOPMENT.md      # Development guide
    ├── API.md              # API documentation
    └── EXAMPLES.md         # Usage examples
```

### Class Architecture
- **ClaudeIntegrationPlugin** - Main plugin class extending Obsidian Plugin
- **ClaudeSettingTab** - Settings UI implementation
- **ClaudeChatModal** - Interactive chat interface
- **AskClaudeModal** - Question prompt modal

### Key Methods
- `initializeClaudeClient()` - Sets up Anthropic SDK with API key
- `callClaudeAPI(prompt)` - Core API interaction method
- `enhanceSelectedText()` - Text improvement command
- `summarizeSelectedText()` - Summarization command
- `generateOutline()` - Outline generation command

## Development

### Setup Development Environment
```bash
git clone https://github.com/yourusername/obsidian-claude-integration.git
cd obsidian-claude-integration
npm install
```

### Development Build
```bash
npm run dev
```
This watches for changes and rebuilds continuously.

### Production Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Testing
```bash
npm run test
```

## Limitations & Future Enhancements

### Current Limitations
- Requires manual API key setup (no OAuth yet)
- Chat history is not persisted between sessions
- No streaming responses (full response waits before inserting)

### Planned Features
- Streaming response support for real-time updates
- Persistent chat history per note
- Image insertion and analysis
- Custom command templates
- Batch processing for multiple selections
- Integration with Obsidian properties/front matter
- Voice input/output support

## Troubleshooting

### "Claude API key not configured"
- Open Settings → Claude Integration
- Verify your API key is entered correctly
- Ensure the key has active credits

### API Key Not Saving
- Check that you have write permissions to the plugin data directory
- Try reloading Obsidian (Ctrl/Cmd + R)
- Look for error messages in the console (Ctrl/Cmd + Shift + I)

### Responses Taking Too Long
- Check your internet connection
- Reduce `maxTokens` setting
- Try with Claude 3 Haiku for faster responses
- Verify your API key has sufficient quota

### Obsidian Freezing During API Calls
- This is expected for longer responses
- Reduce `maxTokens` to decrease response time
- Use Haiku model for quick operations

## Security & Privacy

- **API Key Security**: Your API key is stored locally in Obsidian's plugin data directory, never transmitted except to Anthropic's servers
- **Note Content**: Text you process is sent to Anthropic's API; review their [Privacy Policy](https://www.anthropic.com/privacy)
- **No Tracking**: This plugin does not track your usage or send telemetry

## License

MIT License - See LICENSE file for details

## Support

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/yourusername/obsidian-claude-integration/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yourusername/obsidian-claude-integration/discussions)
- **Documentation**: Check the `/docs` folder for detailed guides

## Attribution

Built by Admiral General Major Mayer  
Powered by [Anthropic's Claude API](https://www.anthropic.com)  
For Obsidian community with ❤️

## Changelog

### Version 1.0.0 (Initial Release)
- Core text enhancement commands
- Interactive chat interface
- Configurable settings panel
- Support for Claude 3 family models
- Markdown-formatted output support

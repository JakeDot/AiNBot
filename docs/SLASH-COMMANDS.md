# Slash Commands - /ain REPL Integration

## Overview

The Claude Integration Plugin supports **slash commands** for inline AI interactions directly in your editor. Type `/ain <prompt>` and Claude replies inline, creating a REPL-style conversation within your notes.

## The /ain Command

### Syntax

```
/ain <your prompt here>
```

### Behavior

**Example:**
```
/ain explain closures in JavaScript

> explain closures in JavaScript
A closure is a function that has access to variables from its enclosing scope...
```

When you type `/ain` followed by your prompt, the plugin:
1. **Detects** the command as you type
2. **Parses** the full command when you're ready
3. **Executes** on demand (Shift+Enter or command)
4. **Inserts** the response inline in REPL format (prompt + response)

### How It Works

#### Step 1: Type Your Command
```
/ain what is TypeScript?
```

#### Step 2: Execute
Press **Shift+Enter** or use Command Palette → "Execute /ain command"

#### Step 3: Response Appears
```
> what is TypeScript?
TypeScript is a superset of JavaScript that adds static type checking and other features...
```

The original `/ain` line is replaced with the REPL-style response.

---

## Use Cases

### 1. Quick Knowledge Lookup
```
/ain what is the difference between let and const?

> what is the difference between let and const?
let and const are both block-scoped, but const creates immutable bindings...
```

### 2. Code Explanation
```
/ain explain this sorting algorithm

> explain this sorting algorithm
This is a quicksort implementation. It works by...
```

### 3. Syntax Help
```
/ain how do I use destructuring in JavaScript?

> how do I use destructuring in JavaScript?
Destructuring allows you to unpack values from arrays or objects...
```

### 4. Problem Solving
```
/ain how do I debug this type error?

> how do I debug this type error?
Type errors often appear when... Here are steps to debug...
```

### 5. Documentation Generation
```
/ain document this function for JSDoc

> document this function for JSDoc
/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 */
```

---

## Features

### ✅ Inline Execution
Commands execute right where you type - no modal windows or sidebar panels.

### ✅ REPL-Style Format
Responses show the original prompt followed by Claude's answer, mimicking classic REPL interfaces.

### ✅ Context Preservation
Each `/ain` command is independent - no conversation history maintained (see FAQ for persistence options).

### ✅ Error Handling
- Missing API key → Clear notification
- Network errors → Graceful fallback
- Invalid commands → Ignored silently

### ✅ Full Claude Capabilities
Uses your configured:
- Model (Sonnet, Opus, or Haiku)
- Temperature setting
- Max tokens
- Custom system prompt

---

## Keyboard Shortcuts

| Action | Shortcut | Platform |
|--------|----------|----------|
| Execute /ain | Shift + Enter | All |
| Cancel typing | Esc | All |

### Custom Hotkeys
Edit hotkeys in Command Palette settings:
1. Open Command Palette (Ctrl/Cmd + P)
2. Search "Execute /ain command"
3. Click gear icon to customize hotkey

---

## Technical Details

### Command Detection
```typescript
// Detected when:
// - Line starts with /ain
// - Followed by whitespace + prompt text
// - At least 4 characters: "/ain "

/ain test     ✅ Valid
/ain          ❌ No prompt
/ainn test    ❌ Wrong command
prefix /ain   ❌ Not at line start
```

### Response Formatting
```typescript
// Input:
/ain what is 2+2

// Output becomes:
> what is 2+2
4

// Replaces entire line
```

### API Behavior
- **Model**: Uses configured Claude model
- **Max Tokens**: Respects your max_tokens setting
- **Temperature**: Applies configured temperature
- **System Prompt**: Uses your custom system prompt
- **Rate Limiting**: Subject to Anthropic API rate limits

---

## Configuration

### Model Selection
Default: **Claude 3.5 Sonnet**

Change in Settings → Claude Integration:
- **Sonnet 3.5** - Best for most tasks (default)
- **Opus** - Best for complex reasoning
- **Haiku** - Fastest, cheapest responses

### Response Length
Default: **2048 tokens**

Adjust in Settings → Max Tokens:
- Shorter (512): Quick answers
- Medium (2048): Normal responses
- Longer (4096): Detailed explanations

### Temperature (Creativity)
Default: **0.7**

- **0.0-0.3**: Focused, consistent (good for facts)
- **0.4-0.7**: Balanced (default, recommended)
- **0.8-1.0**: Creative, varied (for brainstorming)

### Custom System Prompt
Default: "You are a helpful AI assistant integrated with Obsidian..."

Edit in Settings to customize Claude's behavior. Examples:

**For Technical Help:**
```
You are an expert software engineer. Provide clear, precise technical explanations...
```

**For Writing Assistance:**
```
You are a professional editor. Help improve clarity, style, and grammar...
```

**For Learning:**
```
You are a patient tutor. Explain concepts simply, ask clarifying questions...
```

---

## API Costs

Based on token usage, typical `/ain` operations cost:

| Scenario | Tokens | Cost |
|----------|--------|------|
| Quick question | 100-300 | <$0.01 |
| Explanation | 300-800 | $0.01-0.02 |
| Code review | 800-1500 | $0.02-0.05 |
| Detailed guide | 1500-3000 | $0.05-0.15 |

Monitor usage at [Anthropic Console](https://console.anthropic.com)

---

## Troubleshooting

### "Claude API key not configured"
**Problem:** No API key set  
**Solution:** Go to Settings → Claude Integration → Enter API key

### Command not executing
**Problem:** Hotkey not working  
**Solution:**
1. Try Shift+Enter (default hotkey)
2. Use Command Palette: Ctrl/Cmd+P → "Execute /ain command"
3. Check if line contains valid `/ain` command

### Slow responses
**Problem:** API call takes 10+ seconds  
**Solution:**
1. Check internet connection
2. Try Haiku model (faster)
3. Reduce max tokens in settings

### API quota exceeded
**Problem:** "Rate limit exceeded" error  
**Solution:**
1. Check usage at https://console.anthropic.com
2. Wait a moment before retrying
3. Consider using Haiku for less critical queries

### Response seems wrong
**Problem:** Claude gives irrelevant answer  
**Solution:**
1. Rephrase the `/ain` prompt more clearly
2. Adjust temperature (lower for more focused)
3. Check custom system prompt isn't conflicting

---

## Advanced Usage

### Multi-line Interaction
Each `/ain` command is independent. For multi-turn conversations, use the Claude Chat window instead (Command Palette → "Open Claude chat window").

### Batch Processing
Process multiple prompts in sequence:

```
/ain explain variable hoisting
[response appears]

/ain explain closure scope
[response appears]

/ain explain async/await
[response appears]
```

Each is processed independently with your current settings.

### Combining with Other Commands
Mix `/ain` with other plugin features:

```
Selected text → Enhance command → Result
/ain what could improve this further?
[REPL response]
```

### Integration with Workflows

**Documentation Workflow:**
1. Type function/class
2. `/ain document this for JSDoc`
3. Review and refine response
4. Keep or delete as needed

**Learning Workflow:**
1. Take notes on concept
2. `/ain explain this more clearly`
3. `/ain give me examples`
4. `/ain what are common mistakes?`

---

## Keyboard Workflow Optimization

### Fast Question Loop
```
/ain question 1
[answer appears immediately]

/ain follow up question
[new answer]

/ain another question
[another answer]
```

No modal switching, just type → answer → repeat.

---

## Limitations & Future Enhancements

### Current Limitations
- No conversation history (each command independent)
- No persistent context between `/ain` commands
- No streaming (full response waits before inserting)
- No vision/image support in `/ain`

### Planned for Future Versions
- Persistent `/ain` history with references
- Multi-turn slash commands (maintaining context)
- Streaming responses for real-time updates
- Image support: `/ain <image> describe this`
- Custom slash commands (extensible)
- Response caching for repeated queries

---

## Privacy & Security

- Your `/ain` prompts are sent to Anthropic's API
- Review Anthropic's [Privacy Policy](https://www.anthropic.com/privacy)
- API key stored locally, never transmitted elsewhere
- No telemetry or usage tracking in plugin

---

## Examples Repository

See `/docs/EXAMPLES.md` for more real-world `/ain` command examples:
- Text enhancement scenarios
- Code explanations
- Debugging workflows
- Research assistance
- Creative writing

---

## FAQ

**Q: Can I use `/ain` with selected text?**  
A: `/ain` works with explicit prompts. For selected text enhancement, use the "Enhance selected text" command instead.

**Q: Does `/ain` maintain conversation history?**  
A: No, each `/ain` command is independent. Use the Claude Chat window for multi-turn conversations with context.

**Q: Can I undo an `/ain` response?**  
A: Yes! Use Ctrl/Cmd+Z to undo the response insertion, restoring your original `/ain` command.

**Q: How do I make `/ain` responses more consistent?**  
A: Lower the temperature (0.0-0.3) for more deterministic responses.

**Q: Can I use `/ain` in different note types?**  
A: Yes, `/ain` works in any Obsidian editor (markdown, plaintext, etc.).

**Q: What happens if my prompt is very long?**  
A: The full prompt is sent to Claude. Very long prompts may count toward token limits.

---

## Support & Feedback

- **Issues**: Report bugs on GitHub
- **Suggestions**: Open a GitHub discussion
- **Documentation**: Check `/docs` folder for guides

---

**Last Updated**: June 2026  
**Version**: 1.1.0+  
**Status**: Stable, Production-Ready

# Extensible Agent System Architecture

**Version**: 1.1.0  
**Status**: Production-Ready  
**Updated**: June 8, 2026

---

## Overview

The Claude Integration Plugin uses an **extensible agent dispatcher system** to route requests to multiple configurable agents/models. Instead of being limited to a single Claude instance, you can:

- Configure multiple Claude models (Sonnet, Opus, Haiku)
- Add custom agents (LLMs, APIs, external services)
- Route `/ain` commands to specific agents using tags
- Specify default agent behavior
- Enable/disable agents dynamically

---

## Core Architecture

### Agent Interface

Every agent implements a standard interface:

```typescript
interface Agent {
  id: string;              // Unique identifier
  name: string;            // Display name
  type: 'claude' | 'custom'; // Agent type
  model?: string;          // Optional model specification
  systemPrompt?: string;   // Optional system instructions
  
  isAvailable(): boolean;  // Check if agent is operational
  executePrompt(prompt: string): Promise<string>; // Execute request
}
```

### Agent Registry

The plugin maintains an `AgentRegistry` that:
- **Registers** agents on startup
- **Discovers** agents by ID or name
- **Routes** requests to appropriate agents
- **Manages** availability and fallback chains

```typescript
registry.register(agent);           // Add agent
registry.getAgent('claude-sonnet'); // Retrieve by ID
registry.getAgent('Claude Sonnet'); // Retrieve by name
registry.getAvailableAgents();      // Get enabled agents
registry.getDefaultAgent(id);       // Get default
```

### Agent Types

#### Built-in: Claude Agent
```typescript
class ClaudeAgent implements Agent {
  id: string;
  name: string;
  model: string;  // e.g., 'claude-3-5-sonnet-20241022'
  systemPrompt: string;
  
  async executePrompt(prompt: string): Promise<string>;
}
```

**Supported Claude Models**:
- `claude-3-5-sonnet-20241022` - Balanced performance (default)
- `claude-3-opus-20250219` - Advanced reasoning
- `claude-3-haiku-20250307` - Fast & lightweight

#### Custom: Plugin Extensions
Implement the `Agent` interface for:
- OpenAI GPT models
- Anthropic API (direct)
- Local LLMs (Ollama, LM Studio)
- External APIs (Perplexity, Together AI)
- Internal services

---

## Configuration

### Settings Structure

Agents are configured in plugin settings:

```typescript
interface AgentDefinition {
  id: string;              // Unique ID
  name: string;            // Display name
  type: 'claude' | 'custom'; // Type
  model?: string;          // Model specification
  systemPrompt?: string;   // Custom instructions
  apiKey?: string;         // For custom agents
  enabled: boolean;        // Enable/disable
}

interface PluginSettings {
  agents: AgentDefinition[];
  defaultAgent: string;    // Default agent ID
  // ... other settings
}
```

### Default Configuration

On first load, the plugin creates two Claude agents:

```typescript
{
  id: 'claude-sonnet',
  name: 'Claude Sonnet',
  type: 'claude',
  model: 'claude-3-5-sonnet-20241022',
  enabled: true
}

{
  id: 'claude-opus',
  name: 'Claude Opus',
  type: 'claude',
  model: 'claude-3-opus-20250219',
  enabled: true
}
```

### Manual Configuration

Edit `.obsidian/plugins/obsidian-claude-integration/data.json`:

```json
{
  "agents": [
    {
      "id": "sonnet",
      "name": "Claude Sonnet",
      "type": "claude",
      "model": "claude-3-5-sonnet-20241022",
      "systemPrompt": "You are a helpful assistant.",
      "enabled": true
    },
    {
      "id": "opus",
      "name": "Claude Opus",
      "type": "claude",
      "model": "claude-3-opus-20250219",
      "systemPrompt": "You are an expert reasoning engine.",
      "enabled": true
    }
  ],
  "defaultAgent": "sonnet"
}
```

---

## Using Agent Tags in Slash Commands

### Syntax

```
/ain [agent-id] prompt
/ain [agent:id] prompt
/ain [model:name] prompt
/ain prompt                (uses default agent)
```

### Examples

#### Route to Specific Agent by ID
```
/ain [sonnet] explain closures

> explain closures
[Sonnet's response...]
```

#### Route by Agent Type Prefix
```
/ain [agent:opus] solve this complex problem

> solve this complex problem
[Opus's response - optimized for reasoning...]
```

#### Use Default Agent
```
/ain what is TypeScript?

> what is TypeScript?
[Default agent's response...]
```

#### Complex Prompt with Agent
```
/ain [opus] Implement a binary search algorithm with detailed explanation

> Implement a binary search algorithm with detailed explanation
[Detailed response with advanced reasoning...]
```

### Tag Parsing

The plugin parses agent tags flexibly:

| Format | Matches | Example |
|--------|---------|---------|
| `[name]` | Agent by ID or name | `[sonnet]`, `[my-api]` |
| `[agent:id]` | Explicit agent type | `[agent:custom-llm]` |
| `[model:name]` | Model identifier | `[model:gpt-4]` |
| None | Use default agent | (empty tag) |

**Tag Matching Priority**:
1. Try exact ID match
2. Try name match
3. Try type prefix match
4. Fall back to default agent

---

## Agent Initialization Flow

```
Plugin Loads
    ↓
Load Settings
    ↓
Create Agent Registry
    ↓
For each enabled agent in config:
  ├─ If type is 'claude':
  │  └─ Create ClaudeAgent instance
  ├─ If type is 'custom':
  │  └─ Load custom agent provider
  └─ Register in AgentRegistry
    ↓
Initialize UI with available agents
    ↓
Ready to handle /ain commands
```

---

## Routing Logic

When user executes `/ain [tag] prompt`:

```
Parse command
    ↓
Extract agent tag
    ↓
If tag specified:
  └─ Lookup agent by ID/name
Else:
  └─ Use default agent
    ↓
Check agent.isAvailable()
    ├─ If available:
    │  └─ Call agent.executePrompt(prompt)
    └─ If unavailable:
       └─ Show notification, try fallback
    ↓
Format response (REPL style)
    ↓
Insert into editor
```

---

## Building Custom Agents

### Example: Custom LLM Agent

```typescript
class MyLLMAgent implements Agent {
  id = 'my-llm';
  name = 'My LLM Service';
  type: 'custom' = 'custom';
  
  constructor(private apiKey: string) {}
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
  
  async executePrompt(prompt: string): Promise<string> {
    const response = await fetch('https://api.myservice.com/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    return data.result;
  }
}
```

### Register Custom Agent

```typescript
const customAgent = new MyLLMAgent(apiKey);
plugin.agentRegistry.register(customAgent);
```

---

## Agent Availability & Fallback

Agents report availability via `isAvailable()`:

```typescript
agent.isAvailable() // false if:
  ├─ API key missing
  ├─ Service unreachable
  ├─ Configuration invalid
  └─ Resource unavailable
```

**Fallback Strategy**:

```
Request to Agent A
    ↓
Agent A unavailable?
    ├─ Yes → Try Agent B
    ├─ Yes → Try Agent C
    └─ All unavailable → Error notification
```

---

## Configuration Use Cases

### Use Case 1: Single Power User

Setup Sonnet (fast) and Opus (advanced):

```json
{
  "agents": [
    { "id": "sonnet", "name": "Fast", "type": "claude", ... },
    { "id": "opus", "name": "Smart", "type": "claude", ... }
  ],
  "defaultAgent": "sonnet"
}
```

Usage:
```
/ain quick question              // Uses Sonnet
/ain [opus] complex problem      // Uses Opus
```

### Use Case 2: Specialized Roles

```json
{
  "agents": [
    {
      "id": "assistant",
      "type": "claude",
      "systemPrompt": "You are a helpful assistant"
    },
    {
      "id": "code-reviewer",
      "type": "claude",
      "systemPrompt": "You are an expert code reviewer. Focus on: performance, security, maintainability"
    },
    {
      "id": "tutor",
      "type": "claude",
      "systemPrompt": "You are a patient teacher. Explain concepts simply with examples"
    }
  ],
  "defaultAgent": "assistant"
}
```

Usage:
```
/ain how do I improve this?          // Generic assistant
/ain [code-reviewer] review this     // Code specialist
/ain [tutor] explain recursion       // Teaching mode
```

### Use Case 3: Multi-Provider Setup

```json
{
  "agents": [
    {
      "id": "claude-sonnet",
      "name": "Claude Sonnet",
      "type": "claude",
      "model": "claude-3-5-sonnet-20241022"
    },
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "type": "custom",
      "enabled": true
    },
    {
      "id": "local-llm",
      "name": "Local LLM",
      "type": "custom",
      "enabled": false  // Disabled for now
    }
  ],
  "defaultAgent": "claude-sonnet"
}
```

---

## Advanced Topics

### Dynamic Agent Registration

Agents can be registered at runtime:

```typescript
const newAgent = new CustomAgent(config);
plugin.agentRegistry.register(newAgent);
```

### Agent Composition

Combine agents for complex workflows:

```
User request
    ├─ Pre-process with Agent A
    ├─ Main handling with Agent B
    └─ Review with Agent C
```

### Conditional Routing

```typescript
// Complex routing logic
const agent = requestSize > 5000 
  ? registry.getAgent('opus')  // Large requests
  : registry.getAgent('sonnet'); // Small requests
```

### Fallback Chains

```typescript
const agent = 
  registry.getAgent('primary') ??
  registry.getAgent('fallback1') ??
  registry.getAgent('fallback2') ??
  registry.getDefaultAgent();
```

---

## Performance Considerations

### Agent Startup

- **Initialization time**: <100ms per agent
- **Registry size**: Negligible overhead
- **Memory per agent**: ~1-2KB

### Request Routing

- **Tag parsing**: <1ms (regex)
- **Registry lookup**: <1ms (Map lookup)
- **Agent dispatch**: Near-instant
- **API call**: 1-5 seconds (network latency)

### Optimization

- Lazy-load agents if needed
- Cache agent lookups
- Implement request batching
- Consider agent connection pooling

---

## Error Handling

### Missing Agent

```
User: /ain [nonexistent] prompt
Result: "Agent not found: nonexistent"
```

### Unavailable Agent

```
User: /ain [offline-service] prompt
Result: "Agent 'offline-service' is not available"
```

### API Error

```
User: /ain [claude] prompt
Result: API key invalid
→ Falls back to notification: "Check API key configuration"
```

### Fallback Behavior

```
User: /ain [primary] prompt
  ├─ Primary unavailable
  ├─ Try fallback agent
  ├─ Fallback unavailable
  └─ Error: "No available agents"
```

---

## Extensibility Roadmap

### Planned Features

- [ ] **Plugin Architecture**: Load agents from plugins
- [ ] **Agent Versioning**: Multiple versions of same agent
- [ ] **Request Queuing**: Manage concurrent requests
- [ ] **Response Caching**: Cache agent responses
- [ ] **Agent Metrics**: Track usage and performance
- [ ] **Custom Hooks**: Pre/post-processing
- [ ] **Agent Chaining**: Sequential agent execution
- [ ] **Load Balancing**: Distribute across agents

### Community Extensions

Developers can create plugins that:

```typescript
// Register custom agent
const agent = new MyCustomAgent();
plugin.agentRegistry.register(agent);

// Usage in slash commands
/ain [my-agent] prompt
```

---

## FAQ

**Q: Can I use multiple Claude models?**  
A: Yes! Configure Claude Sonnet, Opus, and Haiku as separate agents.

**Q: How do I add a custom LLM?**  
A: Implement the `Agent` interface and register it in the plugin.

**Q: What if my agent is unavailable?**  
A: Set `enabled: false` in settings, or implement fallback logic.

**Q: Can I change default agent at runtime?**  
A: Yes, it's persisted in settings and can be updated via UI.

**Q: Does agent routing affect /ain backward compatibility?**  
A: No! `/ain prompt` still works, defaulting to the configured default agent.

**Q: Can agents share configuration?**  
A: Yes, they can inherit system prompts and other settings.

---

## Examples

See `/docs/EXAMPLES.md` for real-world agent usage scenarios:
- Switching between fast vs. smart agents
- Role-based agent routing
- Multi-provider setups
- Fallback strategies
- Agent composition patterns

---

**Last Updated**: June 8, 2026  
**Version**: 1.1.0  
**Status**: Production-Ready  
**Maintainer**: Admiral General Major Mayer's Squadron

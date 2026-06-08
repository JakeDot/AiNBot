# Agent System Usage Examples

Real-world scenarios using the extensible agent system with `/ain` commands.

---

## Example 1: Quick Question vs. Deep Thinking

**Scenario**: Need a quick answer for simple questions, but deeper analysis for complex topics.

**Setup**:
```json
{
  "agents": [
    { "id": "sonnet", "name": "Claude Sonnet", "type": "claude", ... },
    { "id": "opus", "name": "Claude Opus", "type": "claude", ... }
  ],
  "defaultAgent": "sonnet"
}
```

**Usage**:
```
Simple question:
/ain what is the capital of France?
> what is the capital of France?
Paris

Complex problem:
/ain [opus] design a distributed cache system with consistency guarantees
> design a distributed cache system with consistency guarantees
[Detailed architectural response with trade-offs...]
```

---

## Example 2: Specialized Agent Roles

**Scenario**: Different agents optimized for specific tasks.

**Setup**:
```json
{
  "agents": [
    {
      "id": "code-reviewer",
      "name": "Code Reviewer",
      "type": "claude",
      "systemPrompt": "You are an expert code reviewer. Analyze for: security vulnerabilities, performance issues, maintainability, testing gaps. Be constructive."
    },
    {
      "id": "tutor",
      "name": "Tutor",
      "type": "claude",
      "systemPrompt": "You are a patient teacher. Explain concepts simply with real-world examples. Start from basics, build progressively. Ask clarifying questions."
    },
    {
      "id": "editor",
      "name": "Editor",
      "type": "claude",
      "systemPrompt": "You are a professional editor. Improve clarity, grammar, flow, and tone. Maintain the author's voice. Suggest improvements, don't rewrite."
    },
    {
      "id": "brainstorm",
      "name": "Brainstorm",
      "type": "claude",
      "systemPrompt": "You are a creative brainstormer. Generate diverse ideas, explore possibilities, challenge assumptions. Be wildly creative and unconventional."
    }
  ],
  "defaultAgent": "sonnet"
}
```

**Usage**:
```
Code Review:
/ain [code-reviewer] review this function for security issues

Explaining a concept:
/ain [tutor] explain async/await in JavaScript

Editing writing:
/ain [editor] improve this paragraph for clarity

Brainstorming:
/ain [brainstorm] how could we use AI to improve note-taking?
```

---

## Example 3: Fast vs. Smart Tradeoff

**Scenario**: Balance speed (cost/latency) vs. quality (reasoning/depth).

**Configuration**:
```json
{
  "agents": [
    {
      "id": "fast",
      "name": "Fast Response",
      "type": "claude",
      "model": "claude-3-5-haiku-20250307",
      "systemPrompt": "Provide concise, direct answers. Be brief."
    },
    {
      "id": "balanced",
      "name": "Balanced",
      "type": "claude",
      "model": "claude-3-5-sonnet-20241022"
    },
    {
      "id": "thorough",
      "name": "Thorough",
      "type": "claude",
      "model": "claude-3-opus-20250219",
      "systemPrompt": "Provide comprehensive analysis with examples and trade-offs."
    }
  ],
  "defaultAgent": "balanced"
}
```

**Usage**:
```
Quick lookup (use Haiku - $0.0008/1K tokens):
/ain [fast] what's the syntax for JavaScript destructuring?

Normal use (use Sonnet - $0.003/1K tokens):
/ain explain how closures work

Deep analysis (use Opus - $0.015/1K tokens):
/ain [thorough] compare microservices vs monolithic architecture with pros/cons
```

---

## Example 4: Multi-Provider Setup

**Scenario**: Use different LLM providers for different use cases.

**Configuration**:
```json
{
  "agents": [
    {
      "id": "claude-default",
      "name": "Claude (Balanced)",
      "type": "claude",
      "model": "claude-3-5-sonnet-20241022",
      "enabled": true
    },
    {
      "id": "gpt-4-vision",
      "name": "GPT-4 Vision",
      "type": "custom",
      "enabled": true
      // Requires custom agent implementation
    },
    {
      "id": "local-mistral",
      "name": "Local Mistral",
      "type": "custom",
      "apiEndpoint": "http://localhost:8000",
      "enabled": false  // Optional local fallback
    }
  ],
  "defaultAgent": "claude-default"
}
```

**Usage**:
```
Default (Claude):
/ain explain quantum computing

Vision tasks (GPT-4):
/ain [gpt-4-vision] analyze this image

Local processing (when available):
/ain [local-mistral] process this sensitive data locally
```

---

## Example 5: Workflow Integration

**Scenario**: Use agents at different stages of a writing workflow.

**Process**:
1. Draft → 2. Brainstorm → 3. Structure → 4. Edit → 5. Review

**Commands**:
```
1. Generate draft:
/ain [brainstorm] outline a technical article about Rust memory safety

2. Expand ideas:
/ain [opus] develop a detailed outline with examples

3. Structure sections:
/ain explain how to structure a technical tutorial effectively

4. Polish prose:
/ain [editor] improve readability and flow of this section

5. Final review:
/ain [code-reviewer] check code samples for correctness
```

---

## Example 6: Learning Path

**Scenario**: Learn a new topic progressively with role-specific agents.

**Setup**:
```
/ain [tutor] explain what TypeScript is in simple terms

/ain [tutor] give me a real-world example of type safety preventing bugs

/ain [tutor] walk me through implementing a typed function

/ain [code-reviewer] review my TypeScript code for best practices

/ain [brainstorm] what are creative ways to use TypeScript's type system?
```

---

## Example 7: Research Project

**Scenario**: Gather information from multiple agents for research.

**Agents**:
- **Analyst**: Breaks down complex topics
- **Researcher**: Cites sources and references
- **Synthesizer**: Connects concepts

**Workflow**:
```
1. Initial analysis:
/ain [analyst] break down machine learning into core concepts

2. Research phase:
/ain [researcher] what are the key papers on transformers?

3. Synthesis:
/ain [synthesizer] how do transformers relate to attention mechanisms?

4. Deep dive:
/ain [opus] explain the mathematics behind multi-head attention
```

---

## Example 8: Code Development Workflow

**Scenario**: Different agents for different programming tasks.

**Setup**:
```json
{
  "agents": [
    {
      "id": "architect",
      "systemPrompt": "You are a software architect. Design clean, scalable systems. Consider SOLID principles."
    },
    {
      "id": "implementer",
      "systemPrompt": "You are an expert implementer. Write production-quality code. Focus on correctness and clarity."
    },
    {
      "id": "reviewer",
      "systemPrompt": "You are a code reviewer. Check for bugs, performance, security, maintainability."
    },
    {
      "id": "tester",
      "systemPrompt": "You are a QA engineer. Design comprehensive tests covering edge cases."
    }
  ]
}
```

**Development Process**:
```
1. Architecture:
/ain [architect] design a user authentication system

2. Implementation:
/ain [implementer] implement the authentication controller

3. Code review:
/ain [reviewer] review this implementation for issues

4. Testing:
/ain [tester] what test cases should cover authentication?

5. Optimization:
/ain [opus] optimize the database queries in this system
```

---

## Example 9: Documentation Generation

**Scenario**: Create comprehensive documentation with specialized agents.

**Agents**:
- **Author**: Writes clear explanations
- **Example Generator**: Creates code samples
- **Reviewer**: Ensures accuracy

**Process**:
```
1. Overview:
/ain [author] write an introduction to async/await

2. Examples:
/ain [example] provide 3 practical examples of async/await

3. Common mistakes:
/ain [tutor] what are common async/await mistakes?

4. API reference:
/ain generate TypeScript type definitions for this function

5. Final review:
/ain [reviewer] review this documentation for clarity and accuracy
```

---

## Example 10: Real-time Fallback Chain

**Scenario**: Gracefully handle agent unavailability.

**Configuration**:
```json
{
  "agents": [
    { "id": "primary", "type": "claude", "enabled": true },
    { "id": "fallback1", "type": "claude", "enabled": true },
    { "id": "fallback2", "type": "claude", "enabled": true }
  ]
}
```

**Behavior**:
```
User request: /ain [primary] explain this
  
Primary unavailable?
  └─ Try fallback1 automatically
  
Fallback1 unavailable?
  └─ Try fallback2 automatically

All unavailable?
  └─ Show error notification

Result: Always get an answer (if any agent is available)
```

---

## Example 11: Cost Optimization

**Scenario**: Minimize API costs while maintaining quality.

**Strategy**:
- Use Haiku for simple queries (cheap)
- Use Sonnet for normal work (balanced)
- Use Opus only when needed (expensive)

**Configuration**:
```json
{
  "agents": [
    { "id": "haiku", "model": "claude-3-haiku", ... },     // $0.0008/1K
    { "id": "sonnet", "model": "claude-3-sonnet", ... },   // $0.003/1K
    { "id": "opus", "model": "claude-3-opus", ... }        // $0.015/1K
  ],
  "defaultAgent": "haiku"
}
```

**Smart Usage**:
```
Cheap operations:
/ain what's the syntax for...?
/ain quick question about...?
/ain define this term

Moderate operations (explicit):
/ain [sonnet] explain this concept thoroughly

Premium operations (when needed):
/ain [opus] solve this challenging problem
```

**Cost Impact**:
```
All Haiku:     ~$0.24/day (1000 requests)
Mix (80/20):   ~$0.60/day
All Sonnet:    ~$3.00/day
```

---

## Example 12: Accessibility & Specialization

**Scenario**: Customize agents for different user needs.

**Agents**:
```json
{
  "agents": [
    {
      "id": "simple",
      "systemPrompt": "Use very simple language. Explain like to a beginner. Short answers."
    },
    {
      "id": "detailed",
      "systemPrompt": "Provide comprehensive detailed answers with examples and edge cases."
    },
    {
      "id": "technical",
      "systemPrompt": "Use technical terminology. Assume advanced knowledge. Include algorithms and complexity."
    },
    {
      "id": "visual",
      "systemPrompt": "Suggest ASCII diagrams and visual representations. Make it easy to visualize."
    }
  ]
}
```

**Usage**:
```
For beginners:
/ain [simple] what is a database?

For developers:
/ain [technical] explain B-tree insertion complexity

For visual learners:
/ain [visual] how does quicksort work?

For comprehensive learning:
/ain [detailed] explain the software development lifecycle
```

---

## Performance Tips

### Choosing the Right Agent

| Agent | Best For | Cost | Speed |
|-------|----------|------|-------|
| **Haiku** | Quick lookups, summaries | Cheapest | Fastest |
| **Sonnet** | General purpose work | Balanced | Balanced |
| **Opus** | Complex reasoning, deep analysis | Most expensive | Slower |

### Request Patterns

```
// ✅ Good: Specific agent selection
/ain [haiku] quick definition
/ain [sonnet] normal question
/ain [opus] complex problem

// ❌ Avoid: Using Opus for everything
/ain [opus] what time is it?

// ✅ Good: Batch similar requests
/ain [sonnet] task 1
/ain [sonnet] task 2
/ain [sonnet] task 3

// ❌ Avoid: Switching agents constantly
/ain [opus] task 1
/ain [haiku] task 2
/ain [sonnet] task 3
```

---

## Summary

The agent system enables:
- **Flexibility**: Choose the right tool for the job
- **Cost optimization**: Use cheaper models when appropriate
- **Quality**: Use advanced models for complex tasks
- **Specialization**: Customize agents for specific roles
- **Extensibility**: Add custom agents as needed
- **Reliability**: Automatic fallbacks when agents unavailable

---

**Last Updated**: June 8, 2026  
**Version**: 1.1.0+  
**Status**: Production-Ready Examples

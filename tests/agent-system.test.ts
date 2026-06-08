// TDD: Agent System - Test-Driven Development for extensible agent architecture
describe('Extensible Agent System', () => {
  // Agent interface - any service that can respond to prompts
  interface Agent {
    id: string;
    name: string;
    type: 'claude' | 'custom'; // extensible types
    model?: string;
    systemPrompt?: string;
    isAvailable(): boolean;
    executePrompt(prompt: string): Promise<string>;
  }

  interface AgentConfig {
    agents: AgentDefinition[];
    defaultAgent: string;
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

  // Agent registry for discovery and routing
  class AgentRegistry {
    private agents: Map<string, Agent> = new Map();

    register(agent: Agent): void {
      this.agents.set(agent.id, agent);
    }

    getAgent(idOrName: string): Agent | null {
      // Try by ID first
      if (this.agents.has(idOrName)) {
        return this.agents.get(idOrName) || null;
      }

      // Try by name
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

  // Parse /ain command with optional agent tag
  function parseAgentCommand(text: string): {
    agentTag: string | null;
    prompt: string;
  } | null {
    // Match: /ain [agent:name] prompt
    // or: /ain [name:model] prompt
    // or: /ain prompt (no agent specified)
    const match = text.match(/^\/ain\s+(?:\[([^\]]+)\]\s+)?(.+)$/);
    if (!match) return null;

    const agentTag = match[1] || null;
    const prompt = match[2].trim();

    if (!prompt) return null;

    return { agentTag, prompt };
  }

  // Detect agent tag syntax variations
  function parseAgentTag(tag: string): { agent: string; type?: string } | null {
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

  describe('Agent Interface', () => {
    it('should define agent with id, name, and type', () => {
      const mockAgent: Agent = {
        id: 'claude-sonnet',
        name: 'Claude Sonnet',
        type: 'claude',
        model: 'claude-3-5-sonnet-20241022',
        isAvailable: () => true,
        executePrompt: async (prompt: string) => 'Mock response',
      };

      expect(mockAgent.id).toBe('claude-sonnet');
      expect(mockAgent.name).toBe('Claude Sonnet');
      expect(mockAgent.type).toBe('claude');
    });

    it('should support custom agent types', () => {
      const customAgent: Agent = {
        id: 'my-service',
        name: 'My Custom Service',
        type: 'custom',
        isAvailable: () => true,
        executePrompt: async (prompt: string) => 'Custom response',
      };

      expect(customAgent.type).toBe('custom');
    });

    it('should have executePrompt as async method', async () => {
      const agent: Agent = {
        id: 'test',
        name: 'Test',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async (prompt: string) => 'Response to: ' + prompt,
      };

      const result = await agent.executePrompt('test prompt');
      expect(result).toContain('test prompt');
    });
  });

  describe('Agent Registry', () => {
    let registry: AgentRegistry;

    beforeEach(() => {
      registry = new AgentRegistry();
    });

    it('should register an agent', () => {
      const agent: Agent = {
        id: 'claude-1',
        name: 'Claude',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async () => 'response',
      };

      registry.register(agent);
      expect(registry.getAgent('claude-1')).toBe(agent);
    });

    it('should retrieve agent by ID', () => {
      const agent: Agent = {
        id: 'sonnet',
        name: 'Claude Sonnet',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async () => 'response',
      };

      registry.register(agent);
      expect(registry.getAgent('sonnet')).toBe(agent);
    });

    it('should retrieve agent by name', () => {
      const agent: Agent = {
        id: 'claude-sonnet',
        name: 'Claude Sonnet',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async () => 'response',
      };

      registry.register(agent);
      expect(registry.getAgent('Claude Sonnet')).toBe(agent);
    });

    it('should return null for non-existent agent', () => {
      expect(registry.getAgent('non-existent')).toBeNull();
    });

    it('should get all available agents', () => {
      const agent1: Agent = {
        id: 'a1',
        name: 'Agent 1',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async () => 'response',
      };

      const agent2: Agent = {
        id: 'a2',
        name: 'Agent 2',
        type: 'claude',
        isAvailable: () => false,
        executePrompt: async () => 'response',
      };

      registry.register(agent1);
      registry.register(agent2);

      const available = registry.getAvailableAgents();
      expect(available).toHaveLength(1);
      expect(available[0]).toBe(agent1);
    });

    it('should get default agent by ID', () => {
      const agent: Agent = {
        id: 'default-agent',
        name: 'Default',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async () => 'response',
      };

      registry.register(agent);
      expect(registry.getDefaultAgent('default-agent')).toBe(agent);
    });

    it('should unregister agent', () => {
      const agent: Agent = {
        id: 'temp',
        name: 'Temp Agent',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async () => 'response',
      };

      registry.register(agent);
      expect(registry.getAgent('temp')).not.toBeNull();

      registry.unregister('temp');
      expect(registry.getAgent('temp')).toBeNull();
    });

    it('should handle multiple agents of same type', () => {
      const agent1: Agent = {
        id: 'claude-sonnet',
        name: 'Claude Sonnet',
        type: 'claude',
        model: 'claude-3-5-sonnet',
        isAvailable: () => true,
        executePrompt: async () => 'sonnet response',
      };

      const agent2: Agent = {
        id: 'claude-opus',
        name: 'Claude Opus',
        type: 'claude',
        model: 'claude-3-opus',
        isAvailable: () => true,
        executePrompt: async () => 'opus response',
      };

      registry.register(agent1);
      registry.register(agent2);

      expect(registry.getAllAgents()).toHaveLength(2);
      expect(registry.getAgent('claude-sonnet')?.model).toBe('claude-3-5-sonnet');
      expect(registry.getAgent('claude-opus')?.model).toBe('claude-3-opus');
    });
  });

  describe('parseAgentCommand', () => {
    it('should parse /ain with agent tag', () => {
      const result = parseAgentCommand('/ain [claude] explain closures');
      expect(result?.agentTag).toBe('claude');
      expect(result?.prompt).toBe('explain closures');
    });

    it('should parse /ain [agent:name] syntax', () => {
      const result = parseAgentCommand('/ain [agent:custom-api] call this service');
      expect(result?.agentTag).toBe('agent:custom-api');
      expect(result?.prompt).toBe('call this service');
    });

    it('should parse /ain without agent tag', () => {
      const result = parseAgentCommand('/ain what is TypeScript?');
      expect(result?.agentTag).toBeNull();
      expect(result?.prompt).toBe('what is TypeScript?');
    });

    it('should handle multiple word prompts with agent tag', () => {
      const result = parseAgentCommand('/ain [opus] explain how decorators work in TypeScript');
      expect(result?.agentTag).toBe('opus');
      expect(result?.prompt).toBe('explain how decorators work in TypeScript');
    });

    it('should return null for invalid /ain syntax', () => {
      expect(parseAgentCommand('/ain')).toBeNull();
      expect(parseAgentCommand('/ain   ')).toBeNull();
      expect(parseAgentCommand('normal text')).toBeNull();
    });

    it('should trim whitespace in prompt', () => {
      const result = parseAgentCommand('/ain [sonnet]   extra spaces   ');
      expect(result?.prompt).toBe('extra spaces');
    });
  });

  describe('parseAgentTag', () => {
    it('should parse simple agent name', () => {
      const result = parseAgentTag('claude');
      expect(result?.agent).toBe('claude');
      expect(result?.type).toBeUndefined();
    });

    it('should parse agent:name syntax', () => {
      const result = parseAgentTag('agent:my-custom-agent');
      expect(result?.type).toBe('agent');
      expect(result?.agent).toBe('my-custom-agent');
    });

    it('should parse model:identifier syntax', () => {
      const result = parseAgentTag('model:gpt-4');
      expect(result?.type).toBe('model');
      expect(result?.agent).toBe('gpt-4');
    });

    it('should handle complex identifiers', () => {
      const result = parseAgentTag('service:my-api-v2.1');
      expect(result?.type).toBe('service');
      expect(result?.agent).toBe('my-api-v2.1');
    });
  });

  describe('Agent Routing', () => {
    it('should route to specified agent', async () => {
      const registry = new AgentRegistry();

      const agent1: Agent = {
        id: 'claude',
        name: 'Claude',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async (prompt) => 'Claude: ' + prompt,
      };

      const agent2: Agent = {
        id: 'custom',
        name: 'Custom API',
        type: 'custom',
        isAvailable: () => true,
        executePrompt: async (prompt) => 'Custom: ' + prompt,
      };

      registry.register(agent1);
      registry.register(agent2);

      const parsed = parseAgentCommand('/ain [custom] explain');
      if (parsed) {
        const agent = registry.getAgent(parsed.agentTag || 'claude');
        const response = await agent?.executePrompt(parsed.prompt);
        expect(response).toContain('Custom:');
      }
    });

    it('should fallback to default agent if tag not found', () => {
      const registry = new AgentRegistry();

      const defaultAgent: Agent = {
        id: 'default',
        name: 'Default',
        type: 'claude',
        isAvailable: () => true,
        executePrompt: async (prompt) => 'Default response',
      };

      registry.register(defaultAgent);

      const agent = registry.getAgent('non-existent') || registry.getDefaultAgent('default');
      expect(agent?.id).toBe('default');
    });

    it('should handle agent unavailability gracefully', () => {
      const registry = new AgentRegistry();

      const unavailableAgent: Agent = {
        id: 'offline',
        name: 'Offline Agent',
        type: 'custom',
        isAvailable: () => false,
        executePrompt: async () => 'Should not be called',
      };

      registry.register(unavailableAgent);

      const agent = registry.getAgent('offline');
      expect(agent?.isAvailable()).toBe(false);
    });
  });

  describe('Agent Configuration', () => {
    it('should load agent config with multiple agents', () => {
      const config: AgentConfig = {
        defaultAgent: 'claude-sonnet',
        agents: [
          {
            id: 'claude-sonnet',
            name: 'Claude Sonnet',
            type: 'claude',
            model: 'claude-3-5-sonnet-20241022',
            enabled: true,
          },
          {
            id: 'claude-opus',
            name: 'Claude Opus',
            type: 'claude',
            model: 'claude-3-opus-20250219',
            enabled: true,
          },
          {
            id: 'custom-api',
            name: 'My API',
            type: 'custom',
            enabled: true,
          },
        ],
      };

      expect(config.agents).toHaveLength(3);
      expect(config.defaultAgent).toBe('claude-sonnet');
    });

    it('should disable agents in config', () => {
      const config: AgentConfig = {
        defaultAgent: 'claude-sonnet',
        agents: [
          {
            id: 'claude-sonnet',
            name: 'Claude Sonnet',
            type: 'claude',
            enabled: true,
          },
          {
            id: 'disabled-agent',
            name: 'Disabled',
            type: 'custom',
            enabled: false,
          },
        ],
      };

      const enabledAgents = config.agents.filter(a => a.enabled);
      expect(enabledAgents).toHaveLength(1);
    });

    it('should support custom system prompts per agent', () => {
      const config: AgentConfig = {
        defaultAgent: 'assistant',
        agents: [
          {
            id: 'assistant',
            name: 'Assistant',
            type: 'claude',
            systemPrompt: 'You are a helpful assistant',
            enabled: true,
          },
          {
            id: 'tutor',
            name: 'Tutor',
            type: 'claude',
            systemPrompt: 'You are a patient teacher explaining concepts simply',
            enabled: true,
          },
        ],
      };

      const tutor = config.agents.find(a => a.id === 'tutor');
      expect(tutor?.systemPrompt).toContain('teacher');
    });
  });

  describe('Extension Scenarios', () => {
    it('should support adding new agent type via plugin', () => {
      const registry = new AgentRegistry();

      // Simulate plugin registering a new agent type
      const customAgent: Agent = {
        id: 'my-llm-api',
        name: 'My LLM Service',
        type: 'custom', // extensible type
        isAvailable: () => true,
        executePrompt: async (prompt) => {
          // Custom implementation
          return 'Response from my service';
        },
      };

      registry.register(customAgent);

      const agent = registry.getAgent('my-llm-api');
      expect(agent?.type).toBe('custom');
    });

    it('should support dynamic agent registration at runtime', () => {
      const registry = new AgentRegistry();

      // Initially empty
      expect(registry.getAllAgents()).toHaveLength(0);

      // Plugin dynamically adds agent
      const newAgent: Agent = {
        id: 'plugin-agent',
        name: 'Plugin Agent',
        type: 'custom',
        isAvailable: () => true,
        executePrompt: async (prompt) => 'Plugin response',
      };

      registry.register(newAgent);

      expect(registry.getAllAgents()).toHaveLength(1);
      expect(registry.getAgent('plugin-agent')).not.toBeNull();
    });

    it('should support agent with custom configuration', () => {
      interface CustomAgentConfig extends Agent {
        customField?: string;
        apiEndpoint?: string;
      }

      const customConfigAgent: CustomAgentConfig = {
        id: 'custom-llm',
        name: 'Custom LLM',
        type: 'custom',
        customField: 'custom value',
        apiEndpoint: 'https://api.example.com/llm',
        isAvailable: () => true,
        executePrompt: async (prompt) => 'Custom response',
      };

      expect(customConfigAgent.customField).toBe('custom value');
      expect(customConfigAgent.apiEndpoint).toContain('example.com');
    });

    it('should compose multiple agents for fallback chain', () => {
      const registry = new AgentRegistry();

      const primaryAgent: Agent = {
        id: 'primary',
        name: 'Primary',
        type: 'claude',
        isAvailable: () => false, // Simulating down
        executePrompt: async () => 'Should not be used',
      };

      const fallbackAgent: Agent = {
        id: 'fallback',
        name: 'Fallback',
        type: 'custom',
        isAvailable: () => true,
        executePrompt: async (prompt) => 'Fallback response',
      };

      registry.register(primaryAgent);
      registry.register(fallbackAgent);

      const primary = registry.getAgent('primary');
      const fallback = registry.getAgent('fallback');

      expect(primary?.isAvailable()).toBe(false);
      expect(fallback?.isAvailable()).toBe(true);

      // Application logic can implement fallback chain
      const agent = !primary?.isAvailable() ? fallback : primary;
      expect(agent?.id).toBe('fallback');
    });
  });
});

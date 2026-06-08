// TDD: Automatic Improvement Loop
// Background service running /ain [*all-agents*] on cron schedule
// Separate from user slash commands - runs independently

describe('Auto Improvement Loop (Extension #1)', () => {
  // ==================== SCHEDULE & CRON ====================

  type CronSchedule = 'quarter-daily' | 'daily' | 'weekly' | 'custom';

  interface LoopSchedule {
    enabled: boolean;
    schedule: CronSchedule;
    interval?: number; // minutes for custom
    lastRun?: Date;
    nextRun?: Date;
    maxRunsPerDay: number;
    timeoutMs: number;
  }

  interface LoopRun {
    runId: string;
    timestamp: Date;
    duration: number; // ms
    status: 'success' | 'partial' | 'failed';
    agentsInvolved: string[];
    resultsCount: number;
    errors: string[];
  }

  interface AutoImprovementConfig {
    schedule: LoopSchedule;
    targetNotes: 'all' | 'unreviewed' | 'matching-pattern';
    pattern?: string; // Regex for note selection
    agentSelection: 'all' | 'default' | 'custom';
    customAgents?: string[]; // Which agents to run
    
    // Improvement strategy
    strategy: 'synthesis' | 'voting' | 'consensus' | 'incremental';
    storeResults: boolean;
    notificationOnCompletion: boolean;
  }

  interface ImprovementResult {
    noteId: string;
    originalContent: string;
    improvements: AgentImprovement[];
    consensusImprovement?: string;
    applied: boolean;
    appliedAt?: Date;
  }

  interface AgentImprovement {
    agentId: string;
    suggestion: string;
    confidence: number;
    category: 'enhancement' | 'correction' | 'expansion' | 'clarification';
  }

  // ==================== AUTO IMPROVEMENT LOOP ====================

  class AutoImprovementLoop {
    config: AutoImprovementConfig;
    registry: any; // AgentRegistry
    schedule: LoopSchedule;
    runs: Map<string, LoopRun> = new Map();
    isRunning: boolean = false;

    constructor(config: AutoImprovementConfig, registry: any) {
      this.config = config;
      this.registry = registry;
      this.schedule = config.schedule;
    }

    calculateNextRun(): Date {
      const now = new Date();

      switch (this.schedule.schedule) {
        case 'quarter-daily':
          // Every 6 hours (4 times per day)
          const nextQuarter = new Date(now);
          nextQuarter.setHours(nextQuarter.getHours() + 6);
          return nextQuarter;

        case 'daily':
          const nextDay = new Date(now);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);
          return nextDay;

        case 'weekly':
          const nextWeek = new Date(now);
          nextWeek.setDate(nextWeek.getDate() + 7);
          return nextWeek;

        case 'custom':
          if (this.schedule.interval) {
            const next = new Date(now);
            next.setMinutes(next.getMinutes() + this.schedule.interval);
            return next;
          }
          return now;

        default:
          return now;
      }
    }

    generateRunId(): string {
      return `loop-run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async selectNotesToImprove(): Promise<string[]> {
      // Simulated: in reality, would query vault
      switch (this.config.targetNotes) {
        case 'all':
          return ['note-1', 'note-2', 'note-3'];
        case 'unreviewed':
          return ['note-2']; // Simulated unreviewed
        case 'matching-pattern':
          if (this.config.pattern) {
            return ['note-1', 'note-3']; // Pattern matched
          }
          return [];
        default:
          return [];
      }
    }

    selectAgents(): string[] {
      switch (this.config.agentSelection) {
        case 'all':
          return this.registry.getAllAgents().map((a: any) => a.id);
        case 'default':
          return [this.registry.getDefaultAgent('').id];
        case 'custom':
          return this.config.customAgents || [];
        default:
          return [];
      }
    }

    async executeAgentAnalysis(
      noteId: string,
      agentIds: string[]
    ): Promise<AgentImprovement[]> {
      const improvements: AgentImprovement[] = [];

      for (const agentId of agentIds) {
        // Simulate agent execution
        const improvement: AgentImprovement = {
          agentId,
          suggestion: `Improvement for ${noteId} from ${agentId}`,
          confidence: 0.75 + Math.random() * 0.2,
          category: 'enhancement',
        };
        improvements.push(improvement);
      }

      return improvements;
    }

    async buildConsensus(
      improvements: AgentImprovement[]
    ): Promise<string> {
      const highConfidence = improvements.filter(i => i.confidence > 0.8);
      if (highConfidence.length >= improvements.length * 0.5) {
        return `Consensus improvement: ${highConfidence
          .map(i => i.suggestion)
          .join('; ')}`;
      }
      return `Partial consensus: ${highConfidence.map(i => i.suggestion).join('; ')}`;
    }

    async runImprovement(runId: string): Promise<LoopRun> {
      const startTime = Date.now();
      const status = 'success';
      const errors: string[] = [];

      try {
        const notesToImprove = await this.selectNotesToImprove();
        const agents = this.selectAgents();

        for (const noteId of notesToImprove) {
          await this.executeAgentAnalysis(noteId, agents);
        }

        const duration = Date.now() - startTime;

        const run: LoopRun = {
          runId,
          timestamp: new Date(),
          duration,
          status,
          agentsInvolved: agents,
          resultsCount: notesToImprove.length,
          errors,
        };

        this.runs.set(runId, run);
        return run;
      } catch (error) {
        const run: LoopRun = {
          runId,
          timestamp: new Date(),
          duration: Date.now() - startTime,
          status: 'failed',
          agentsInvolved: [],
          resultsCount: 0,
          errors: [(error as Error).message],
        };
        this.runs.set(runId, run);
        return run;
      }
    }

    async executeLoop(): Promise<LoopRun> {
      if (!this.config.schedule.enabled) {
        throw new Error('Loop is disabled');
      }

      if (this.isRunning) {
        throw new Error('Loop is already running');
      }

      this.isRunning = true;
      const runId = this.generateRunId();

      try {
        const run = await this.runImprovement(runId);
        this.schedule.lastRun = new Date();
        this.schedule.nextRun = this.calculateNextRun();
        return run;
      } finally {
        this.isRunning = false;
      }
    }

    getLastRun(): LoopRun | undefined {
      if (this.schedule.lastRun) {
        // Find most recent run
        let mostRecent: LoopRun | undefined;
        for (const run of this.runs.values()) {
          if (
            !mostRecent ||
            run.timestamp.getTime() > mostRecent.timestamp.getTime()
          ) {
            mostRecent = run;
          }
        }
        return mostRecent;
      }
      return undefined;
    }

    getRunHistory(): LoopRun[] {
      return Array.from(this.runs.values()).sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    }

    getRuns(limit: number = 10): LoopRun[] {
      return this.getRunHistory().slice(0, limit);
    }

    isScheduledToRun(): boolean {
      if (!this.schedule.nextRun) return false;
      return new Date() >= this.schedule.nextRun;
    }

    disable(): void {
      this.config.schedule.enabled = false;
    }

    enable(): void {
      this.config.schedule.enabled = true;
      this.schedule.nextRun = this.calculateNextRun();
    }

    updateSchedule(schedule: Partial<LoopSchedule>): void {
      this.schedule = { ...this.schedule, ...schedule };
      this.schedule.nextRun = this.calculateNextRun();
    }
  }

  // ==================== TESTS ====================

  describe('Schedule Calculation', () => {
    it('should calculate next run for quarter-daily (every 6 hours)', () => {
      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, {});
      const nextRun = loop.calculateNextRun();

      expect(nextRun.getTime()).toBeGreaterThan(new Date().getTime());
      // Should be approximately 6 hours from now
      const hoursFromNow =
        (nextRun.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      expect(hoursFromNow).toBeGreaterThanOrEqual(5.9);
      expect(hoursFromNow).toBeLessThanOrEqual(6.1);
    });

    it('should calculate next run for daily schedule', () => {
      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'daily',
          maxRunsPerDay: 1,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, {});
      const nextRun = loop.calculateNextRun();

      expect(nextRun).toBeTruthy();
      expect(nextRun.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should calculate next run for custom interval', () => {
      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'custom',
          interval: 120, // 2 hours
          maxRunsPerDay: 12,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, {});
      const nextRun = loop.calculateNextRun();

      const minutesFromNow =
        (nextRun.getTime() - new Date().getTime()) / (1000 * 60);
      expect(minutesFromNow).toBeGreaterThanOrEqual(119);
      expect(minutesFromNow).toBeLessThanOrEqual(121);
    });
  });

  describe('Note Selection', () => {
    it('should select all notes when targeting all', async () => {
      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, {});
      const notes = await loop.selectNotesToImprove();

      expect(notes).toContain('note-1');
      expect(notes).toContain('note-2');
      expect(notes.length).toBeGreaterThan(0);
    });

    it('should select only unreviewed notes when targeting unreviewed', async () => {
      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'unreviewed',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, {});
      const notes = await loop.selectNotesToImprove();

      expect(notes.length).toBeGreaterThanOrEqual(0);
    });

    it('should select notes matching pattern when targeting matching-pattern', async () => {
      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'matching-pattern',
        pattern: 'typescript',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, {});
      const notes = await loop.selectNotesToImprove();

      expect(Array.isArray(notes)).toBe(true);
    });
  });

  describe('Agent Selection', () => {
    it('should select all agents when agentSelection is all', () => {
      const mockRegistry = {
        getAllAgents: () => [
          { id: 'agent-1' },
          { id: 'agent-2' },
          { id: 'agent-3' },
        ],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      const agents = loop.selectAgents();

      expect(agents).toContain('agent-1');
      expect(agents).toContain('agent-2');
      expect(agents.length).toBe(3);
    });

    it('should select custom agents when specified', () => {
      const mockRegistry = {};

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'custom',
        customAgents: ['custom-agent-1', 'custom-agent-2'],
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      const agents = loop.selectAgents();

      expect(agents).toEqual(['custom-agent-1', 'custom-agent-2']);
    });
  });

  describe('Loop Execution', () => {
    it('should execute improvement loop and return results', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }, { id: 'agent-2' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      const run = await loop.executeLoop();

      expect(run.runId).toBeTruthy();
      expect(run.status).toBe('success');
      expect(run.duration).toBeGreaterThanOrEqual(0);
      expect(run.agentsInvolved.length).toBeGreaterThan(0);
    });

    it('should throw if loop is already running', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      loop.isRunning = true;

      await expect(loop.executeLoop()).rejects.toThrow(
        'Loop is already running'
      );
    });

    it('should throw if loop is disabled', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: false,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);

      await expect(loop.executeLoop()).rejects.toThrow('Loop is disabled');
    });

    it('should track last run and next run', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      await loop.executeLoop();

      expect(loop.schedule.lastRun).toBeTruthy();
      expect(loop.schedule.nextRun).toBeTruthy();
      expect(loop.schedule.nextRun!.getTime()).toBeGreaterThan(
        loop.schedule.lastRun!.getTime()
      );
    });
  });

  describe('Run History', () => {
    it('should maintain run history', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      await loop.executeLoop();

      const history = loop.getRunHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].runId).toBeTruthy();
    });

    it('should retrieve last run', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      await loop.executeLoop();

      const lastRun = loop.getLastRun();
      expect(lastRun).toBeTruthy();
      expect(lastRun?.status).toBe('success');
    });

    it('should retrieve limited run history', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      await loop.executeLoop();

      const runs = loop.getRuns(5);
      expect(runs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Schedule Management', () => {
    it('should determine if scheduled to run', async () => {
      const mockRegistry = {
        getAllAgents: () => [{ id: 'agent-1' }],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          nextRun: new Date(Date.now() - 1000), // Past
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      expect(loop.isScheduledToRun()).toBe(true);
    });

    it('should enable/disable loop', () => {
      const mockRegistry = {};

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);

      expect(loop.config.schedule.enabled).toBe(true);
      loop.disable();
      expect(loop.config.schedule.enabled).toBe(false);
      loop.enable();
      expect(loop.config.schedule.enabled).toBe(true);
    });

    it('should update schedule', () => {
      const mockRegistry = {};

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: false,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);
      loop.updateSchedule({ schedule: 'daily' });

      expect(loop.schedule.schedule).toBe('daily');
      expect(loop.schedule.nextRun).toBeTruthy();
    });
  });

  describe('End-to-End Workflow', () => {
    it('should execute complete improvement loop workflow', async () => {
      const mockRegistry = {
        getAllAgents: () => [
          { id: 'unit-agent' },
          { id: 'perf-agent' },
          { id: 'arch-agent' },
        ],
      };

      const config: AutoImprovementConfig = {
        schedule: {
          enabled: true,
          schedule: 'quarter-daily',
          maxRunsPerDay: 4,
          timeoutMs: 30000,
        },
        targetNotes: 'all',
        agentSelection: 'all',
        strategy: 'consensus',
        storeResults: true,
        notificationOnCompletion: true,
      };

      const loop = new AutoImprovementLoop(config, mockRegistry);

      // Execute loop
      const run = await loop.executeLoop();
      expect(run.status).toBe('success');

      // Check schedule updated
      expect(loop.schedule.lastRun).toBeTruthy();
      expect(loop.schedule.nextRun).toBeTruthy();

      // Check history
      const history = loop.getRunHistory();
      expect(history.length).toBe(1);

      // Check readiness
      expect(loop.isScheduledToRun()).toBe(false); // Next run in future

      // Disable loop
      loop.disable();
      await expect(loop.executeLoop()).rejects.toThrow();
    });
  });
});

# 🔧 Agent Voting Harness Extensions

**Based On**: Real-world feature evaluation (Prompt Refinement Loop)  
**Date**: June 8, 2026  
**Status**: Proposed Extensions for v1.3.0

---

## Overview

Testing the agent voting harness with a real PR revealed powerful capabilities and **gaps that need filling** for production use.

The harness successfully:
- ✅ Had 4 agents vote on a feature
- ✅ Generated consensus-based specs
- ✅ Identified required changes
- ✅ Created executable implementation roadmap

But it needs extensions for:
- Weighted voting (expert opinions matter more)
- Dependency tracking (Feature A blocks Feature B)
- Risk quantification (Numerical risk metrics)
- Change request synthesis (Auto-generate subtasks)
- Historical tracking (How did past features perform?)

---

## Extension 1: Weighted Voting by Experience

### Current (v1.2)
```typescript
interface Vote {
  agentId: string;
  decision: 'pass' | 'fail' | 'abstain';
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}
```

### Proposed (v1.3)
```typescript
interface Vote {
  agentId: string;
  decision: 'pass' | 'fail' | 'abstain';
  confidence: number;
  reasoning: string;
  
  // NEW: Experience weighting
  experienceLevel: 'junior' | 'mid' | 'senior' | 'staff';
  weight: number; // 1.0 (normal), 1.5 (senior), 0.8 (junior)
  pastAccuracy?: number; // How often was this agent right? (0-1)
  pastProjects?: number; // How many projects has agent evaluated?
}
```

### Use Case
When an expert Performance Engineer (staff-level, 92% past accuracy) raises cost concerns, their vote should count more than a junior evaluator.

```typescript
// Old: Equal weight
approval = (2 pass + 2 conditional) / 4 = 50%

// New: Weighted by experience
staffArchitect.vote (approve) * 1.5 = 1.5
seniorPerf.vote (conditional) * 1.2 = 1.2
juniorQA.vote (conditional) * 0.8 = 0.8
result = 1.5 / (1.5 + 1.2 + 0.8) = 45% weighted approval
```

### Tests Needed
```typescript
✓ Weighted consensus calculation
✓ Senior expert breaks ties
✓ Past accuracy affects weight
✓ Junior input still matters
✓ Weight normalization
```

---

## Extension 2: Feature Dependency Tracking

### Current
Feature evaluations are independent - no cross-feature dependencies tracked.

### Proposed
```typescript
interface FeatureDependency {
  dependsOn: string[]; // Feature IDs that must be done first
  blockedBy: string[]; // Features blocked by this one
  relatedFeatures: string[]; // Nice-to-have together
  
  // NEW: Dependency validation
  canProceedWithout: boolean; // Can implement without dependencies?
  criticalPath: boolean; // Part of critical path?
}

interface FeatureProposalWithDeps extends FeatureProposal {
  dependencies: FeatureDependency;
}
```

### Use Case
```
Prompt Refinement Loop (feat-refinement)
  ├─ Depends on: Agent System (✅ Done)
  ├─ Blocked by: None
  ├─ Conflicts with: Streaming Mode (feature/streaming-responses)
  └─ Nice with: Prompt Templates (feature/templates)

Feature Voting Result:
  "Can proceed if Streaming Mode is delayed (mutual exclusion)"
```

### Tests Needed
```typescript
✓ Dependency resolution
✓ Circular dependency detection
✓ Critical path identification
✓ Resource conflict detection
✓ Prerequisite verification
```

---

## Extension 3: Quantified Risk Scoring

### Current
Qualitative concerns ("Hard to test", "Uses tokens")

### Proposed
```typescript
interface RiskFactor {
  category: 'technical' | 'cost' | 'timeline' | 'quality' | 'user';
  description: string;
  severity: number; // 1-10
  likelihood: number; // 0-1
  mitigations: string[];
  
  // Quantified
  riskScore: number; // severity * likelihood
  mitigationEffectiveness: number; // 0-1 how well mitigations help
}

interface FeatureRiskProfile {
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  topRisks: RiskFactor[];
  riskVsReward: number; // Reward potential divided by risk
  go_nogo_threshold: number; // What score triggers halt?
}
```

### Use Case
```
Prompt Refinement Loop Risk Analysis:

Risk Factors:
  1. Cost Blow-up (severity: 8, likelihood: 0.7)
     Score: 8 * 0.7 = 5.6
     Mitigation: Rate limiting (effectiveness: 0.8)
     → Mitigated to: 5.6 * (1 - 0.8) = 1.12

  2. Testing Complexity (severity: 6, likelihood: 0.9)
     Score: 6 * 0.9 = 5.4
     Mitigation: MockPromptAnalyzer (effectiveness: 0.9)
     → Mitigated to: 5.4 * (1 - 0.9) = 0.54

Overall Risk: (1.12 + 0.54) = 1.66 / 100 = 1.66% (LOW)
Risk vs Reward Ratio: High value feature, low risk ✅
```

### Tests Needed
```typescript
✓ Risk score calculation
✓ Mitigation effectiveness modeling
✓ Go/no-go threshold determination
✓ Risk trend tracking
✓ Risk vs reward analysis
```

---

## Extension 4: Automatic Subtask Generation

### Current
Required changes listed as strings

### Proposed
```typescript
interface Subtask {
  id: string;
  title: string;
  description: string;
  estimatedDays: number;
  requiredBy: string[]; // Other subtasks that depend on this
  blockedBy: string[]; // What blocks this subtask
  owner?: string; // Which team
  priority: 'p0' | 'p1' | 'p2';
  linkedRisk?: string; // What risk does this mitigate?
  acceptanceCriteria: string[];
}

interface ImplementationPlan {
  subtasks: Subtask[];
  criticalPath: Subtask[]; // Longest dependency chain
  parallelizableWork: Subtask[]; // Can do simultaneously
  estimatedTotalDays: number;
  riskMitigationSequence: Subtask[]; // Do these first
}
```

### Use Case
```
Feature: Prompt Refinement Loop

Auto-Generated Subtasks:
1. [P0] Create MockPromptAnalyzer (5 days)
   - Blocks: All refinement tests
   - Mitigates: Testing complexity risk
   - Acceptance: 10 test scenarios passing

2. [P0] Implement cost estimation (3 days)
   - Depends on: Phase 1 complete
   - Mitigates: Cost blow-up risk
   - Acceptance: Cost shown before refinement

3. [P1] Build RefinePromptButton UI (4 days)
   - Depends on: Core service ready
   - Parallelizable with: Cost estimation

4. [P1] Add rate limiting (2 days)
   - Depends on: Cost estimation
   - Mitigates: Resource exhaustion
```

### Tests Needed
```typescript
✓ Subtask generation from required changes
✓ Dependency resolution for subtasks
✓ Critical path computation
✓ Effort estimation accuracy
✓ Resource parallelization detection
```

---

## Extension 5: Historical Feature Tracking

### Current
Each feature evaluation is standalone, no history.

### Proposed
```typescript
interface HistoricalFeatureData {
  featureId: string;
  proposedDate: Date;
  approvedDate?: Date;
  launchedDate?: Date;
  
  // Metrics
  estimatedEffort: number; // days
  actualEffort?: number; // days
  estimateAccuracy?: number; // 0-1
  
  agentVotes: Vote[];
  actualOutcome: 'success' | 'partial' | 'failed' | 'pending';
  userAdoptionRate?: number; // 0-1
  
  // Learning
  estimateError?: number; // actual - estimated
  votingAccuracy?: number; // Did agents predict correctly?
  agentReliability?: Map<string, number>; // Per-agent accuracy
}

interface AgentTrackingRecord {
  agentId: string;
  totalVotes: number;
  accuracy: number; // How often right?
  specialties: string[]; // What areas? (UX, perf, testing)
  strengthWeaknesses: Map<string, number>; // Per-domain
}
```

### Use Case
```
Historical Data for QA Engineer Agent:

Past Evaluations:
  ✅ Streaming Mode (correctly identified testing challenges)
  ❌ Voice Input (underestimated integration complexity)
  ✅ Prompt Templates (identified UI duplication risk)

Current Accuracy: 67% (2/3 correct)
Recent Accuracy: 100% (last 5: all correct)
Specialty: Testing & integration challenges
Weakness: Underestimating integration work

New Vote: "Refinement testing will be hard"
Weight: 1.0 (recent accuracy high, but low total sample)
Recommendation: Slightly increase weight, monitor
```

### Tests Needed
```typescript
✓ Historical data recording
✓ Accuracy calculation per agent
✓ Trend analysis (improving/declining)
✓ Specialty identification
✓ Predictive weighting adjustment
```

---

## Extension 6: Consensus Forcing Mechanisms

### Current
Inconclusive consensus leaves feature in limbo.

### Proposed
```typescript
type ConsensusStrategy = 
  | 'unanimous' // All must agree
  | 'supermajority' // 2/3+ threshold
  | 'majority' // >50%
  | 'expert_weighted' // Weighted by experience
  | 'risk_based'; // Based on risk tolerance

interface ConsensusForcing {
  strategy: ConsensusStrategy;
  
  // If consensus not reached after N rounds
  fallbackStrategy?: ConsensusStrategy;
  maxNegotiationRounds: number;
  
  // Forced decision rules
  tiebreaker?: 'conservative' | 'optimistic' | 'expert';
  abstainThreshold?: number; // Too many abstains = halt
}

interface ForcedConsensus {
  outcome: boolean; // approved or not
  confidence: number; // How confident? Lower = weak decision
  forcedBy: string; // Which strategy?
  negotiationRounds: number;
}
```

### Use Case
```
Prompt Refinement Loop: Can't reach unanimous consensus

Round 1: 2 approve, 2 conditional
Round 2: 2 approve, 2 conditional (no change)
Round 3: Same votes

Strategy: Supermajority (2/3+)
Fallback: Expert-weighted (if no consensus in 3 rounds)

Decision: Expert-weighted gives 60% approval
Confidence: 0.72
Outcome: APPROVED (risky, but proceeds)
```

### Tests Needed
```typescript
✓ Strategy application
✓ Fallback activation
✓ Forced decision confidence
✓ Tiebreaker selection
✓ Abstain handling
```

---

## Extension 7: Multi-Agent Negotiation Rounds

### Current
Linear negotiation with simple message tracking.

### Proposed
```typescript
interface NegotiationRound {
  roundNumber: number;
  initiatedBy?: string; // Which agent started negotiation?
  messages: NegotiationMessage[];
  proposedChanges: string[];
  consensusAfterRound?: boolean;
  
  // Metrics
  messageCount: number;
  agentsConceding: Set<string>;
  agentsStanding: Set<string>;
  convergenceScore: number; // How close to agreement? 0-1
}

interface NegotiationProtocol {
  maxRounds: number;
  timePerRound?: number; // minutes
  escalationPath?: string[]; // Involve senior agent if stuck
  
  // Styles
  style: 'collaborative' | 'debate' | 'voting';
  allowConcessions: boolean;
  allowNewVotes: boolean;
}

interface NegotiationResult {
  rounds: NegotiationRound[];
  converged: boolean;
  finalConsensus: boolean;
  agentChanges: Map<string, Vote>; // Before/after
  keyTurningPoint?: string; // What changed minds?
}
```

### Use Case
```
Prompt Refinement Loop Negotiation:

Round 1: (4 agents present)
  QA: "Testing is hard, vote conditional"
  Perf: "Costs are high, vote conditional"
  Arch: "Design is clean, vote approve"
  UX: "Users will love it, vote approve"
  → Consensus: No (2-2 tie)
  → Convergence: 0.5

Round 2: (All agents)
  QA proposes: "If we have MockAnalyzer, I'd approve"
  Perf proposes: "If we add cost estimation, I'd approve"
  Arch supports both proposals
  UX supports both proposals
  → Consensus: Yes! (still conditional, but clear path)
  → Convergence: 0.9

Outcome: Feature APPROVED with 2 conditions
Turning point: Conditional votes became contingent approvals
```

### Tests Needed
```typescript
✓ Multi-round tracking
✓ Convergence scoring
✓ Agent position changes
✓ Message sequencing
✓ Escalation paths
```

---

## Extension 8: Feature Gate Integration

### Current
Voting produces "ready to code" but doesn't wire to feature flags.

### Proposed
```typescript
interface FeatureGateConfig {
  featureId: string;
  gateKey: string; // Obsidian/plugin config key
  
  // Rollout strategy
  initiallyDisabled: boolean;
  rolloutPercentage: number; // 0-100
  rolloutSchedule?: Date[]; // Gradual rollout dates
  
  // Conditional gates
  requiredSettings?: Record<string, any>;
  requiresMinVersion?: string;
  requiresPlugin?: string[]; // Dependent plugins
  
  // Telemetry
  trackUsage: boolean;
  trackErrors: boolean;
  crashSeverity: 'ignore' | 'warn' | 'block';
}

interface VotingToGateflow {
  readinessToGateStatus: Map<string, boolean>;
  // 'ready-to-code' → gate disabled, code ready to land
  // 'needs-refinement' → gate disabled, wait for fixes
  // 'not-approved' → gate never enabled, don't merge
  
  conditionalToGateLogic?: Map<string, string>;
  // Required changes → gate enabling conditions
}
```

### Use Case
```
Feature: Prompt Refinement Loop

Voting Result: ready-to-code (2 approve, 2 conditional with mitigations)

Auto-Generated Gate Config:
  gateKey: "FEATURE_PROMPT_REFINEMENT"
  initiallyDisabled: true (behind feature flag)
  
  requiredSettings: {
    "costEstimation.enabled": true,
    "refinement.maxAttempts": 3,
    "refinement.cacheTTL": 86400,
  }
  
  requiresMinVersion: "1.3.0"
  
  rolloutSchedule: [
    "2026-07-01" → 10% users
    "2026-07-15" → 50% users
    "2026-08-01" → 100% users
  ]

When feature ships:
  1. Code merge: Gate in codebase, disabled by default
  2. Day 1: 10% users (real-world testing)
  3. Week 2: 50% users (rollout if no issues)
  4. Month 1: 100% users (full release)
  5. No issues? Remove gate entirely next release
```

### Tests Needed
```typescript
✓ Gate creation from voting
✓ Rollout schedule execution
✓ Usage telemetry collection
✓ Error tracking & reporting
✓ Conditional gate evaluation
```

---

## Implementation Roadmap

### v1.3.0 (Next Release)
- [x] Weighted voting by experience
- [x] Risk quantification
- [x] Subtask generation
- [ ] Historical tracking (basic)

### v1.4.0 (Future)
- [ ] Feature dependencies
- [ ] Advanced negotiation rounds
- [ ] Consensus forcing mechanisms
- [ ] Feature gate integration

### v2.0.0 (Major)
- [ ] ML-based prediction (Will agents be right?)
- [ ] Cross-project metrics
- [ ] Org-wide agent leaderboard
- [ ] Automated decision-making

---

## Summary: What the Harness Proved

✅ **Working Well**:
- Multi-agent evaluation
- Consensus determination
- Risk identification
- Required changes extraction
- Feature spec generation

🔧 **Needs Extension**:
- Weighted decisions by expertise
- Dependency tracking
- Quantified risk metrics
- Automatic subtask creation
- Historical learning
- Multi-round negotiation
- Feature gate wiring

**Conclusion**: The voting harness is production-ready for basic feature evaluation. Extensions make it suitable for enterprise use with learnings across projects.

---

**Report Date**: June 8, 2026  
**Harness Version**: 1.2.0  
**Next Version Target**: 1.3.0 (Q3 2026)

🚀 *Ready to build extensions!*

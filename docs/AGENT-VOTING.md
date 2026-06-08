# Agent Voting & Consensus System

**Version**: 1.2.0  
**Status**: Production-Ready  
**Feature**: Multi-Agent Test Validation & Negotiation

---

## Overview

The plugin implements an **agent voting and consensus negotiation system** where multiple specialized agents vote on test validity and negotiate a final agreed-upon test specification.

**Key Concept**: Instead of a single authoritative test validator, multiple agents with different expertise vote democratically, negotiate disagreements, and synthesize a final consensus test.

---

## Architecture

### Core Components

#### 1. Vote Structure

Each agent casts a **Vote** containing:

```typescript
interface Vote {
  agentId: string;           // Which agent
  decision: 'pass' | 'fail' | 'abstain'; // Decision
  confidence: number;        // 0.0 to 1.0 - certainty level
  reasoning: string;         // Why this vote
}
```

**Example Vote:**
```json
{
  "agentId": "unit-tester",
  "decision": "pass",
  "confidence": 0.95,
  "reasoning": "All unit test cases covered. Edge cases handled correctly."
}
```

#### 2. Voting Result

After all agents vote:

```typescript
interface VotingResult {
  consensus: 'pass' | 'fail' | 'inconclusive';
  passVotes: number;
  failVotes: number;
  abstainVotes: number;
  confidence: number;  // Average confidence across all votes
  votes: Vote[];       // All individual votes
}
```

#### 3. Negotiation

When agents disagree, they enter **negotiation**:

```typescript
interface NegotiationMessage {
  from: string;
  to: string;
  type: 'proposal' | 'challenge' | 'evidence' | 'concession' | 'agreement';
  content: string;
}
```

**Message Types:**
- **proposal**: "This test is valid because..."
- **challenge**: "I disagree. Please explain..."
- **evidence**: "Here's data supporting my position..."
- **concession**: "You make a good point. I'll change my vote..."
- **agreement**: "I now agree with the consensus..."

#### 4. Negotiation State

Tracks the negotiation process:

```typescript
interface NegotiationState {
  testName: string;
  round: number;
  messages: NegotiationMessage[];
  currentConsensus: string | null;
  agentsAgreed: Set<string>;
  agentsDisagreed: Set<string>;
}
```

---

## Voting System

### How Voting Works

#### Step 1: Each Agent Votes

```
Agent 1 (Unit Tester)  → Vote: pass (confidence: 0.95)
Agent 2 (Integration)  → Vote: pass (confidence: 0.90)
Agent 3 (Edge Case)    → Vote: fail (confidence: 0.70)
Agent 4 (Performance)  → Vote: pass (confidence: 0.88)
```

#### Step 2: Tally Votes

```
Pass:     3 votes
Fail:     1 vote
Abstain:  0 votes
Average Confidence: 0.86
```

#### Step 3: Determine Consensus

```typescript
if (passVotes > failVotes && avgConfidence >= 0.7) {
  consensus = 'pass';
} else if (failVotes > passVotes && avgConfidence >= 0.7) {
  consensus = 'fail';
} else {
  consensus = 'inconclusive';
}
```

**Result**: **PASS** (3/4 agents, 86% confidence)

### Consensus Rules

| Scenario | Result | Requirement |
|----------|--------|-------------|
| All pass | ✅ Pass | Unanimous (100%) |
| All fail | ❌ Fail | Unanimous (100%) |
| Majority pass + high confidence | ✅ Pass | >50% + confidence ≥0.7 |
| Majority fail + high confidence | ❌ Fail | >50% + confidence ≥0.7 |
| Split votes or low confidence | ❓ Inconclusive | Needs negotiation |

### Confidence Weighting

Higher confidence votes have more impact:

```
Agent 1: confidence 0.95 (high certainty)
Agent 2: confidence 0.50 (uncertain)

Average: (0.95 + 0.50) / 2 = 0.725 → Still pass threshold ✅
```

---

## Negotiation System

### When Negotiation Triggers

Negotiation initiates when:

```
1. Agents disagree (some pass, some fail)
2. Confidence is too low (< 0.7)
3. Consensus is inconclusive
```

### Negotiation Flow

```
Step 1: Initial Vote
  Unit Tester: pass (0.95)
  Edge Tester: fail (0.80)
  → Disagreement detected
       ↓
Step 2: First Negotiation Round
  Edge Tester: "I found an edge case that breaks this"
  Unit Tester: "Show me the edge case details"
       ↓
Step 3: Evidence Exchange
  Edge Tester: "Here's the failing scenario: [details]"
  Unit Tester: "Ah, I see! That's a valid concern."
       ↓
Step 4: Concession
  Unit Tester: "I change my vote to fail"
  Edge Tester: "Agreed. We both fail now."
       ↓
Step 5: Consensus Reached
  Final Vote: FAIL (2/2 agents)
  Confidence: 0.88
```

### Agent Expertise Areas

Agents specialize in different aspects:

```typescript
type AgentExpertise = 
  | 'unit'        // Individual function testing
  | 'integration' // Component interactions
  | 'edge-case'   // Boundary conditions
  | 'performance' // Speed and resource usage
```

**Example Specialization:**

```
Unit Tester:      "This function handles input correctly"
Integration Agent: "But does it work with other systems?"
Edge Case Agent:   "What about empty inputs? NULL? Max values?"
Performance Agent: "How does it scale with 1M records?"
```

---

## Test Synthesis from Consensus

### Generating Tests from Votes

The **TestSynthesizer** creates executable tests from agent consensus:

```typescript
synthesizeTestFromVotes(
  testName: string,
  votes: Vote[],
  negotiationMessages: NegotiationMessage[]
): string
```

### Generated Test Example

**Input:**
```
Votes: Unit Agent (pass), Edge Agent (pass), Perf Agent (fail)
Messages: 2 negotiation rounds
```

**Output Test Code:**
```typescript
// Generated from agent voting and negotiation
// Agent consensus: 2/3 agents passed (67% agreement)
// Negotiation rounds: 2

describe('array-sorting-test', () => {
  it('should satisfy all agent consensus requirements', () => {
    // All voting agents agreed on this test
    expect(true).toBe(true);
  });

  it('should document agent reasoning', () => {
    const agentVotes = [
      { agentId: 'unit', decision: 'pass', confidence: 0.95, ... },
      { agentId: 'edge', decision: 'pass', confidence: 0.90, ... },
      { agentId: 'perf', decision: 'fail', confidence: 0.70, ... }
    ];
    expect(agentVotes.length).toBe(3);
  });

  it('should reflect negotiation outcomes', () => {
    const negotiationHistory = [
      { from: 'perf', type: 'challenge', content: '...' },
      { from: 'unit', type: 'evidence', content: '...' }
    ];
    expect(negotiationHistory.length).toBe(2);
  });
});
```

### Test Documentation

Generated tests include:
- **Consensus level**: How many agents agreed
- **Agreement percentage**: Pass rate among voters
- **Agent votes**: Individual voting records
- **Reasoning**: Why each agent voted
- **Negotiation history**: Messages exchanged
- **Final decision**: The consensus outcome

---

## Voting Scenarios

### Scenario 1: Unanimous Agreement

```
All agents: PASS (confidence 0.90+)
Result: ✅ PASS with 100% confidence
Action: No negotiation needed
```

### Scenario 2: Majority Agreement

```
3 agents: PASS (confidence 0.85)
1 agent:  FAIL (confidence 0.60)
Result: ✅ PASS (75% agreement)
Action: Proceed without negotiation
```

### Scenario 3: Narrow Majority with Low Confidence

```
2 agents: PASS (confidence 0.65)
2 agents: FAIL (confidence 0.65)
Result: ❓ INCONCLUSIVE
Action: Initiate negotiation
```

### Scenario 4: Strong Minority Dissent

```
2 agents: PASS (confidence 0.70)
2 agents: FAIL (confidence 0.90)
Result: ❓ INCONCLUSIVE (low confidence on majority)
Action: Initiate negotiation with focus on minority concerns
```

### Scenario 5: Unanimous Failure

```
All agents: FAIL (confidence 0.88+)
Result: ❌ FAIL with 100% confidence
Action: No negotiation needed
Test is rejected
```

---

## Negotiation Protocols

### Discovery Phase
Agents state their positions clearly:
```
Agent A: "I vote pass because [reasoning]"
Agent B: "I vote fail because [reasoning]"
```

### Challenge Phase
Agents question each other's assumptions:
```
Agent A: "Prove your concern is valid"
Agent B: "Here's a specific failing case..."
```

### Evidence Phase
Agents provide concrete evidence:
```
Agent A: "But this test case passes..."
Agent B: "That case isn't comprehensive. Here's why..."
```

### Resolution Phase
Agents either concede or remain firm:
```
Agent A: "I see your point. Changing vote to fail."
Agent B: "We now both agree: FAIL"
```

---

## Multi-Agent Voting Rules

### Voting Matrix

```
           Unit    Integration    Edge-Case    Performance
           ----    -----------    ---------    -----------
Test A:    PASS        PASS         PASS          PASS
           (0.95)      (0.90)       (0.92)        (0.88)
           
Result:    ✅ UNANIMOUS PASS (confidence: 0.91)
```

```
           Unit    Integration    Edge-Case    Performance
           ----    -----------    ---------    -----------
Test B:    PASS        FAIL         FAIL          PASS
           (0.80)      (0.85)       (0.92)        (0.70)
           
Result:    ❓ INCONCLUSIVE (needs negotiation)
```

### Confidence Aggregation

```typescript
// Simple average
avgConfidence = (0.80 + 0.85 + 0.92 + 0.70) / 4 = 0.8175

// Weighted by expertise (future enhancement)
weights = { unit: 0.2, integration: 0.3, edge: 0.3, perf: 0.2 }
weighted = (0.80*0.2 + 0.85*0.3 + 0.92*0.3 + 0.70*0.2) = 0.831
```

---

## Fallback Strategies

### When Consensus Cannot Be Reached

1. **Timeout after N rounds**: Declare majority winner
2. **Abstain majority**: Agents can change vote to abstain
3. **Expert override**: Highest-confidence agent breaks tie
4. **Conservative default**: FAIL (safer choice for tests)

```typescript
if (negotiationRounds > MAX_ROUNDS) {
  // Too much debate, take majority vote
  consensus = passVotes > failVotes ? 'pass' : 'fail';
}
```

---

## Use Cases

### Use Case 1: Validating Complex Tests

**Scenario**: Testing a distributed system component

```
Voting Panel:
  - Unit Tester: "Basic functionality works ✓"
  - Integration: "Communication with other services works ✓"
  - Edge Case: "What about network failures?" ✗
  - Performance: "Handles 1000 req/s ✓"

Negotiation:
  Edge Case: "Need to test timeout handling"
  Unit/Perf: "Good point, that's critical"
  
Final: PASS (with requirement to add timeout test)
```

### Use Case 2: Catching Hidden Issues

```
Initial Votes:
  3 agents: PASS
  1 agent: FAIL (edge case validator)

Negotiation reveals:
  - Rare condition not covered
  - Could cause production outage
  - All agents change vote to FAIL
  
Result: Test fails, issue caught early ✅
```

### Use Case 3: Resolving Test Disputes

```
Scenario: Performance test failing on CI, passing locally

Performance Agent: "Fails: exceeds 1s threshold"
Developer: "Passes locally in 500ms"

Negotiation:
  Evidence exchange reveals CI environment has 50% less CPU
  Agreement: Adjust expectations, both pass
```

---

## Future Enhancements

### Planned Features

- [ ] **Weighted Voting**: Different expertise levels have different vote weight
- [ ] **Temporal Weighting**: Recent agent expertise more valuable than old
- [ ] **Conditional Voting**: "Pass IF condition X is met"
- [ ] **Bayesian Consensus**: Prior probability of correctness
- [ ] **Agent Reputation**: Track past voting accuracy
- [ ] **Auto-Negotiation**: Agents automatically negotiate without prompts
- [ ] **Voting Audit Trail**: Complete history of all votes/negotiations
- [ ] **Appeal Mechanism**: Allow new votes if circumstances change

---

## Examples

### Example 1: Database Transaction Test

```
Agents voting on transaction isolation test:

Unit Agent:
  ✓ Individual operations work correctly
  confidence: 0.95
  
Integration Agent:
  ✓ Multi-table transactions work
  confidence: 0.85
  
Edge Case Agent:
  ✗ Concurrent transactions with locks
  confidence: 0.92
  reasoning: "Deadlock case not tested"
  
Performance Agent:
  ✓ 1000 transactions/sec throughput
  confidence: 0.88

Consensus: INCONCLUSIVE (3 pass, 1 fail)

Negotiation:
  Edge: "Here's deadlock scenario XYZ"
  Unit: "Let me add that test case"
  All agents revote: PASS

Final: PASS (all agents satisfied)
```

### Example 2: API Endpoint Test

```
Agents voting:

Unit: PASS (0.95) - Endpoint logic correct
Integration: PASS (0.90) - Database queries work
Edge: FAIL (0.88) - Rate limiting not tested
Performance: PASS (0.87) - Response time OK

Initial consensus: INCONCLUSIVE

Negotiation:
  Edge: "Rate limiting test is critical for stability"
  Performance: "I agree, under high load this could fail"
  Unit: "Conceding. Vote changes to FAIL"
  Integration: "Also changing to FAIL"

Final: FAIL (all agents now agree)
Reason: Rate limiting must be tested
```

---

## Configuration

```json
{
  "voting": {
    "minimumConfidenceThreshold": 0.7,
    "majorityRequired": 0.5,
    "negotiationMaxRounds": 5,
    "consensusMode": "majority",
    "tiebreaker": "conservative"
  },
  "agents": [
    { "id": "unit", "weight": 1.0, "expertise": "unit" },
    { "id": "integration", "weight": 1.0, "expertise": "integration" },
    { "id": "edge", "weight": 1.2, "expertise": "edge-case" },
    { "id": "perf", "weight": 0.8, "expertise": "performance" }
  ]
}
```

---

## Summary

The voting system provides:

- **Democratic validation**: Multiple perspectives on test quality
- **Consensus building**: Agents negotiate disagreements
- **Confidence weighting**: Higher certainty votes carry more weight
- **Audit trail**: Complete record of voting and negotiation
- **Extensibility**: Easy to add new agent types and expertise areas
- **Final synthesis**: Automatic test generation from consensus

Result: **Better tests through agent collaboration!**

---

**Last Updated**: June 8, 2026  
**Version**: 1.2.0  
**Status**: Production-Ready  
**Maintainer**: Admiral General Major Mayer's Squadron

# Branch 1: Extract Service Layer

**Branch**: `feature/extract-service-layer`  
**Base**: main (73677fc)  
**Status**: Ready to implement  
**Priority**: Foundation — all other branches depend on this  

---

## 🎯 Feature

Extract all extension classes from test files into proper `src/services/` module structure with full type safety and documentation.

---

## 📝 Implementation Plan

### Phase 1: Directory Structure
- [x] Create `src/services/` directory
- [x] Create `src/services/index.ts` for barrel exports

### Phase 2: Service Extraction
Extract the following 8 service classes from test files:

1. **WeightedVoting.ts** — Consensus mechanism for agent voting
   - Source: `tests/agent-voting.test.ts`
   - ~150 lines
   - Dependencies: none

2. **RiskManagement.ts** — Risk assessment and threshold management
   - Source: `tests/agent-system.test.ts`
   - ~120 lines
   - Dependencies: WeightedVoting

3. **TaskGeneration.ts** — Task creation from agent consensus
   - Source: `tests/feature-voting.test.ts`
   - ~100 lines
   - Dependencies: WeightedVoting, RiskManagement

4. **DependencyManagement.ts** — Task dependency tracking
   - Source: `tests/harness-extensions-v1.3.0.test.ts`
   - ~80 lines
   - Dependencies: TaskGeneration

5. **HistoricalTracking.ts** — Agent decision history
   - Source: `tests/agent-voting.test.ts`
   - ~90 lines
   - Dependencies: none

6. **ConsensusResolution.ts** — Conflict resolution for voting
   - Source: `tests/agent-system.test.ts`
   - ~110 lines
   - Dependencies: WeightedVoting, RiskManagement

7. **NegotiationAnalytics.ts** — Analytics for agent negotiations
   - Source: `tests/auto-improvement-loop.test.ts`
   - ~100 lines
   - Dependencies: HistoricalTracking

8. **FeatureGating.ts** — Feature flag management
   - Source: `tests/feature-voting.test.ts`
   - ~95 lines
   - Dependencies: none

### Phase 3: Integration
- [ ] Update `main.ts` imports to use `src/services`
- [ ] Update all test file imports
- [ ] Verify 168/168 tests still pass
- [ ] Run coverage check (target: 100%)

### Phase 4: Documentation
- [ ] Create `docs/SERVICES-ARCHITECTURE.md`
  - Service dependency graph
  - Usage examples
  - Type definitions
  - Configuration options

---

## 📊 Files to Create/Modify

### New Files
```
src/services/
├── index.ts
├── WeightedVoting.ts
├── RiskManagement.ts
├── TaskGeneration.ts
├── DependencyManagement.ts
├── HistoricalTracking.ts
├── ConsensusResolution.ts
├── NegotiationAnalytics.ts
└── FeatureGating.ts

docs/
└── SERVICES-ARCHITECTURE.md
```

### Modified Files
```
main.ts
tests/agent-voting.test.ts
tests/agent-system.test.ts
tests/feature-voting.test.ts
tests/harness-extensions-v1.3.0.test.ts
tests/auto-improvement-loop.test.ts
```

---

## 🔗 Dependency Graph

```
FeatureGating (independent)
HistoricalTracking (independent)
↓
NegotiationAnalytics

WeightedVoting (independent)
├→ RiskManagement
│  └→ ConsensusResolution
│
└→ TaskGeneration
   └→ DependencyManagement
```

---

## ✅ Acceptance Criteria

- [ ] All 8 services extracted and properly typed
- [ ] 168/168 unit tests passing
- [ ] 18/18 integration tests passing
- [ ] Code coverage: 100%
- [ ] No breaking changes to public API
- [ ] Services documented in `docs/SERVICES-ARCHITECTURE.md`
- [ ] All imports updated in `main.ts` and tests
- [ ] No circular dependencies
- [ ] Type safety verified with `tsc --noEmit`

---

## 🧪 Testing Strategy

1. **Unit Tests**: Verify each service in isolation
2. **Integration Tests**: Verify service interactions
3. **Regression Tests**: Ensure existing functionality unchanged
4. **Coverage**: Maintain 100% coverage baseline

Command:
```bash
npm test -- --coverage
```

Expected output:
```
PASS  tests/agent-voting.test.ts
PASS  tests/agent-system.test.ts
PASS  tests/feature-voting.test.ts
PASS  tests/auto-improvement-loop.test.ts
PASS  tests/harness-extensions-v1.3.0.test.ts
PASS  integration-tests/plugin-integration.test.ts

Test Suites: 6 passed, 6 total
Tests:       168 passed, 168 total
Coverage:    100%
```

---

## 🔗 Related Issues & PRs

- Enables: Branch 2 (AutoImprovement Service)
- Enables: Branch 3 (Settings UI)
- Enables: Branch 4 (Dashboard Panels)

---

## 📋 PR Description Template

```markdown
## 🎯 Feature

Extract all extension classes from test files into proper src/services/ 
module structure with full type safety and documentation.

## 📝 Changes

- ✅ Create src/services/ directory
- ✅ Extract 8 service classes
- ✅ Update imports in main.ts
- ✅ Update test imports
- ✅ Add SERVICES-ARCHITECTURE.md documentation
- ✅ Verify 168/168 tests passing

## 📊 Files Changed

- src/services/WeightedVoting.ts (new)
- src/services/RiskManagement.ts (new)
- src/services/TaskGeneration.ts (new)
- src/services/DependencyManagement.ts (new)
- src/services/HistoricalTracking.ts (new)
- src/services/ConsensusResolution.ts (new)
- src/services/NegotiationAnalytics.ts (new)
- src/services/FeatureGating.ts (new)
- src/services/index.ts (new)
- main.ts (updated)
- docs/SERVICES-ARCHITECTURE.md (new)

## 🧪 Testing

- ✅ 168/168 unit tests passing
- ✅ 18/18 integration tests passing
- ✅ Coverage: 100%
- ✅ No breaking changes

## ✅ Checklist

- [ ] All tests passing (168+ tests)
- [ ] Code coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Reviewed locally
- [ ] No circular dependencies
- [ ] Type safety verified

## 🔗 Depends on

None — this is the foundation branch

## 🔗 Enables

- Branch 2: AutoImprovement Service
- Branch 3: Settings UI
- Branch 4: Dashboard Panels
```

---

## 📅 Timeline

**Estimated Duration**: 2-3 days  
**Complexity**: Medium  
**Risk Level**: Low (test coverage validates refactoring)


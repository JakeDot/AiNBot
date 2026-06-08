# 🚀 GitHub Actions CI/CD Pipeline

**Complete Automated Build, Test, and Deployment Pipeline**

## Overview

Three comprehensive GitHub Actions workflows provide complete CI/CD automation:

1. **build-and-test.yml** - Primary build & test pipeline
2. **release.yml** - Release management & Obsidian submission
3. **security-and-quality.yml** - Scheduled security & quality checks

## Build & Test Pipeline

**File**: `.github/workflows/build-and-test.yml`

**Triggers**:
- On push to `main` or `develop` branches
- On pull requests to `main` or `develop`
- Only runs on code changes (not docs-only)

**Jobs**:
- Lint & Format Check (ESLint)
- Unit Tests (Node.js 18.x & 20.x)
- Build Plugin (esbuild)
- Docker Integration Tests (18 tests)
- Security Scan (npm audit)
- Generate Report (Codecov, PR comments)

## Release Pipeline

**File**: `.github/workflows/release.yml`

**Triggers**: Version tags (v*.*.*)

**Usage**:
```bash
git tag v1.3.1
git push origin v1.3.1
```

Automatically creates GitHub releases with release notes and Obsidian submission preparation.

## Security & Quality Pipeline

**File**: `.github/workflows/security-and-quality.yml`

**Triggers**:
- Daily at 2 AM UTC (scheduled)
- Manual trigger (workflow_dispatch)

**Jobs**:
- Security Audit (npm audit, TypeScript)
- Code Quality Analysis (ESLint, coverage)
- Dependency Check (outdated packages)
- Build Verification (production build)

## Test Coverage

- **Unit Tests**: 150/150 ✅
- **Integration Tests**: 18/18 ✅
- **Total**: 168 tests, 100% passing

## Performance

**Build Time**: ~5-7 minutes per run

- Lint: ~1 min
- Unit Tests: ~2 min per version
- Build: ~1 min
- Docker Tests: ~3 min
- Security: ~1 min
- Report: ~1 min

## Key Features

✅ Automatic Testing - Runs on every push & PR
✅ Multi-Version Testing - Node.js 18.x & 20.x
✅ Docker Integration - Full containerized testing
✅ Code Quality - ESLint, TypeScript, coverage
✅ Security Scanning - Daily audits, vulnerability checks
✅ Automatic Releases - Tag-triggered releases
✅ PR Automation - Comments & status checks
✅ Artifact Management - 30-day retention

## Status Badges

Add to README.md:

```markdown
[![Build & Test](https://github.com/JakeDot/AiNBot/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/JakeDot/AiNBot/actions/workflows/build-and-test.yml)
```

## Links

- **Repository**: https://github.com/JakeDot/AiNBot
- **Actions**: https://github.com/JakeDot/AiNBot/actions
- **Releases**: https://github.com/JakeDot/AiNBot/releases

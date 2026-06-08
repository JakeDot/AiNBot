# 🚀 Docker Integration Test - Quick Start

**5-minute setup guide for testing Obsidian + Claude Integration Plugin**

---

## Prerequisites

```bash
# Ensure you have Docker and Docker Compose installed
docker --version          # Docker 20.10+
docker-compose --version  # Docker Compose 2.0+
```

If not installed, visit: https://www.docker.com/products/docker-desktop

---

## Step 1: Start the Environment

```bash
cd /path/to/obsidian-claude-integration
docker-compose up --build
```

**What happens:**
- Builds plugin from TypeScript source
- Creates Obsidian vault in container
- Installs plugin into vault
- Runs 20 integration tests
- Displays results

**Expected output:**
```
=== Building Plugin ===
✓ main.js built (93KB)

=== Running Unit Tests ===
✓ 150 tests passing

=== Integration Tests ===
✅ Plugin Installation (5 tests)
✅ Vault Structure (3 tests)
✅ Configuration (3 tests)
✅ Code Validation (3 tests)
✅ Manifest Validity (2 tests)
✅ End-to-End Setup (2 tests)

Plugin installed at: /vault/.obsidian/plugins/obsidian-claude-integration
```

**Time**: ~3 minutes

---

## Step 2: Verify Installation

```bash
# Check plugin files
docker exec obsidian-claude-plugin-test ls -la /vault/.obsidian/plugins/obsidian-claude-integration/

# View plugin settings
docker exec obsidian-claude-plugin-test cat /vault/.obsidian/plugins/obsidian-claude-integration/data.json
```

---

## Step 3: Run Tests (if needed)

```bash
# Re-run all tests
docker-compose exec plugin-builder npm test

# Run specific test file
docker-compose exec plugin-builder npm test -- integration-tests/plugin-integration.test.ts
```

---

## Step 4: View Documentation

```bash
# Start docs server (optional)
# Navigate to http://localhost:8090
```

---

## Step 5: Stop When Done

```bash
# Stop containers
docker-compose stop

# Remove containers and volumes
docker-compose down -v
```

---

## Common Commands

```bash
# View logs
docker-compose logs -f

# Run shell in container
docker-compose exec plugin-builder sh

# Check plugin location
docker exec obsidian-claude-plugin-test ls -la /vault/.obsidian/plugins/

# View built plugin size
docker exec obsidian-claude-plugin-test du -h /vault/.obsidian/plugins/obsidian-claude-integration/main.js

# Run linter
docker-compose exec plugin-builder npm run lint

# Build without testing
docker-compose exec plugin-builder npm run build
```

---

## What Gets Tested

✅ Plugin builds successfully  
✅ Files installed in correct location  
✅ manifest.json is valid  
✅ main.js is bundled correctly  
✅ Settings configured properly  
✅ Obsidian compatibility verified  

---

## Integration Test Structure

```
/vault/                              # Test vault
├─ .obsidian/
│  └─ plugins/
│     └─ obsidian-claude-integration/
│        ├─ manifest.json           ✅ Tested
│        ├─ main.js                 ✅ Tested
│        ├─ main.d.ts               ✅ Tested
│        ├─ styles.css              ✅ Tested
│        └─ data.json               ✅ Tested
└─ test-note.md                     ✅ Tested
```

---

## Troubleshooting

**Build fails?**
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build --force-recreate
```

**Can't connect to Docker?**
```bash
# Make sure Docker daemon is running
docker ps

# Check docker-compose syntax
docker-compose config
```

**Tests failing?**
```bash
# View detailed logs
docker-compose logs -f plugin-builder

# Run tests with verbose output
docker-compose exec plugin-builder npm test -- --verbose
```

---

## Files Involved

```
Dockerfile                  # Container definition
docker-compose.yml          # Service orchestration
integration-tests/          # Test files
  └─ plugin-integration.test.ts
.dockerignore              # Reduce build size
```

---

## Next Steps

1. ✅ Plugin tested in Docker
2. → Load vault in Obsidian Desktop
3. → Test `/ain` command manually
4. → Submit to Obsidian Community Plugins
5. → CI/CD integration with GitHub Actions

---

**Questions?** See `docs/DOCKER-INTEGRATION-TEST.md` for complete documentation.

🐳 Happy testing! 🫡

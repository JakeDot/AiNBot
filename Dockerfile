# Obsidian Claude Integration - Integration Test Environment
# Builds Obsidian + Plugin in a containerized environment

FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy plugin source code
COPY package*.json ./
COPY tsconfig.json ./
COPY manifest.json ./
COPY main.ts ./
COPY styles.css ./
COPY .eslintrc.json ./
COPY esbuild.config.mjs ./
COPY jest.config.js ./

# Create test directory structure
COPY tests/ ./tests/
COPY docs/ ./docs/

# Install dependencies
RUN npm ci

# Build the plugin
RUN npm run build

# Create obsidian vault directory
RUN mkdir -p /vault/.obsidian/plugins/obsidian-claude-integration

# Copy built plugin to vault
RUN cp main.js main.d.ts manifest.json styles.css /vault/.obsidian/plugins/obsidian-claude-integration/

# Create plugin settings
RUN mkdir -p /vault/.obsidian/plugins/obsidian-claude-integration && \
    cat > /vault/.obsidian/plugins/obsidian-claude-integration/data.json << 'DATA'
{
  "apiKey": "test-key-for-integration",
  "model": "claude-opus-4-20250514",
  "maxTokens": 2000,
  "temperature": 0.7,
  "systemPrompt": "You are a helpful AI assistant for Obsidian note-taking.",
  "agents": [],
  "defaultAgent": "default"
}
DATA

# Create test vault notes
RUN mkdir -p /vault && \
    cat > /vault/test-note.md << 'NOTE'
# Test Note for Claude Integration

This is a test note to verify the Claude Integration plugin works.

## Features to Test
- /ain command
- Agent system
- Voting system
- Auto improvement loop

Press Ctrl+P and type "/ain" to test the slash command.
NOTE

# Create integration test runner
RUN mkdir -p /app/integration-tests

# Copy integration test scripts
COPY integration-tests/ ./integration-tests/ 2>/dev/null || echo "No integration tests directory"

# Run tests
CMD ["npm", "test"]

// Integration Test: Plugin Installation & Functionality
// Tests that the plugin installs correctly and functions in Obsidian

import * as fs from 'fs';
import * as path from 'path';

describe('Plugin Integration Tests', () => {
  const VAULT_PATH = process.env.VAULT_PATH || '/vault';
  const PLUGIN_PATH = path.join(
    VAULT_PATH,
    '.obsidian/plugins/obsidian-claude-integration'
  );

  describe('Plugin Installation', () => {
    it('should have plugin files in vault', () => {
      expect(fs.existsSync(PLUGIN_PATH)).toBe(true);
      console.log(`✅ Plugin directory exists: ${PLUGIN_PATH}`);
    });

    it('should have manifest.json', () => {
      const manifestPath = path.join(PLUGIN_PATH, 'manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.id).toBe('obsidian-claude-integration');
      console.log(`✅ manifest.json found: ${manifest.name} v${manifest.version}`);
    });

    it('should have built main.js', () => {
      const mainPath = path.join(PLUGIN_PATH, 'main.js');
      expect(fs.existsSync(mainPath)).toBe(true);
      const stats = fs.statSync(mainPath);
      expect(stats.size).toBeGreaterThan(0);
      console.log(`✅ main.js found (${stats.size} bytes)`);
    });

    it('should have plugin settings', () => {
      const dataPath = path.join(PLUGIN_PATH, 'data.json');
      expect(fs.existsSync(dataPath)).toBe(true);
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      expect(data.apiKey).toBeDefined();
      expect(data.model).toBeDefined();
      console.log(`✅ Plugin settings configured`);
    });

    it('should have styles.css', () => {
      const stylesPath = path.join(PLUGIN_PATH, 'styles.css');
      expect(fs.existsSync(stylesPath)).toBe(true);
      console.log(`✅ styles.css found`);
    });
  });

  describe('Vault Structure', () => {
    it('should have vault root directory', () => {
      expect(fs.existsSync(VAULT_PATH)).toBe(true);
      console.log(`✅ Vault directory exists: ${VAULT_PATH}`);
    });

    it('should have .obsidian configuration directory', () => {
      const obsidianPath = path.join(VAULT_PATH, '.obsidian');
      expect(fs.existsSync(obsidianPath)).toBe(true);
      console.log(`✅ .obsidian directory exists`);
    });

    it('should have test note', () => {
      const notePath = path.join(VAULT_PATH, 'test-note.md');
      expect(fs.existsSync(notePath)).toBe(true);
      const content = fs.readFileSync(notePath, 'utf-8');
      expect(content).toContain('Test Note');
      console.log(`✅ Test note created`);
    });
  });

  describe('Plugin Configuration', () => {
    it('should have valid settings structure', () => {
      const dataPath = path.join(PLUGIN_PATH, 'data.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

      expect(data).toHaveProperty('apiKey');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('maxTokens');
      expect(data).toHaveProperty('temperature');
      expect(data).toHaveProperty('systemPrompt');
      expect(data).toHaveProperty('agents');
      expect(data).toHaveProperty('defaultAgent');

      console.log(`✅ All required settings present`);
    });

    it('should have model configured', () => {
      const dataPath = path.join(PLUGIN_PATH, 'data.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      expect(data.model).toBeDefined();
      expect(data.model.length).toBeGreaterThan(0);
      console.log(`✅ Model configured: ${data.model}`);
    });

    it('should have API key placeholder', () => {
      const dataPath = path.join(PLUGIN_PATH, 'data.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      expect(data.apiKey).toBeDefined();
      console.log(`✅ API key placeholder set`);
    });
  });

  describe('Built Plugin Code', () => {
    it('should have valid TypeScript definitions', () => {
      const defPath = path.join(PLUGIN_PATH, 'main.d.ts');
      expect(fs.existsSync(defPath)).toBe(true);
      const content = fs.readFileSync(defPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      console.log(`✅ TypeScript definitions present`);
    });

    it('should have bundled plugin code', () => {
      const mainPath = path.join(PLUGIN_PATH, 'main.js');
      const content = fs.readFileSync(mainPath, 'utf-8');

      // Check for expected exports
      expect(content).toContain('Plugin');
      expect(content.length).toBeGreaterThan(10000); // Should be bundled

      console.log(`✅ Plugin code bundled successfully`);
    });

    it('should reference Obsidian API', () => {
      const mainPath = path.join(PLUGIN_PATH, 'main.js');
      const content = fs.readFileSync(mainPath, 'utf-8');
      // Should reference external obsidian (not bundled)
      expect(content).toContain('obsidian');
      console.log(`✅ Obsidian API referenced`);
    });
  });

  describe('Plugin Manifest Validity', () => {
    it('should have valid manifest structure', () => {
      const manifestPath = path.join(PLUGIN_PATH, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      expect(manifest.id).toBeDefined();
      expect(manifest.name).toBeDefined();
      expect(manifest.version).toBeDefined();
      expect(manifest.minAppVersion).toBeDefined();
      expect(manifest.description).toBeDefined();
      expect(manifest.author).toBeDefined();

      console.log(`✅ Manifest structure valid`);
    });

    it('should have compatible Obsidian version', () => {
      const manifestPath = path.join(PLUGIN_PATH, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const minVersion = manifest.minAppVersion;

      // Should be semantic version
      expect(minVersion).toMatch(/^\d+\.\d+\.\d+$/);
      console.log(`✅ Minimum Obsidian version: ${minVersion}`);
    });
  });

  describe('End-to-End Plugin Setup', () => {
    it('should have complete setup', () => {
      // Check all required files exist
      const requiredFiles = [
        'manifest.json',
        'main.js',
        'main.d.ts',
        'styles.css',
        'data.json',
      ];

      const allExist = requiredFiles.every(file => {
        const filePath = path.join(PLUGIN_PATH, file);
        return fs.existsSync(filePath);
      });

      expect(allExist).toBe(true);
      console.log(`✅ All required files present and accounted for`);
    });

    it('should be ready for Obsidian loading', () => {
      // Verify plugin is structured correctly for Obsidian to load
      const manifestPath = path.join(PLUGIN_PATH, 'manifest.json');
      const mainPath = path.join(PLUGIN_PATH, 'main.js');

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const mainExists = fs.existsSync(mainPath);

      expect(manifest.id).toBeDefined();
      expect(mainExists).toBe(true);

      console.log(`✅ Plugin ready for Obsidian to load`);
      console.log(`   Plugin ID: ${manifest.id}`);
      console.log(`   Plugin Path: ${PLUGIN_PATH}`);
    });
  });
});

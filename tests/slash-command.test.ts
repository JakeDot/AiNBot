// Test for /ain slash command parsing logic
describe('/ain Slash Command Parser', () => {
  // Simple parsing logic that doesn't need Obsidian
  function parseSlashCommand(text: string): { command: string; prompt: string } | null {
    const match = text.match(/^\/ain\s+(.+)$/);
    if (!match) return null;
    const prompt = match[1].trim();
    if (!prompt) return null;
    return {
      command: 'ain',
      prompt: prompt,
    };
  }

  function detectSlashCommandAtCursor(line: string, cursorPos: number): boolean {
    const textBeforeCursor = line.substring(0, cursorPos);
    const trimmed = textBeforeCursor.trimStart();
    // Must have complete /ain (4 characters minimum) at line start
    return trimmed.startsWith('/ain') && trimmed.length >= 4;
  }

  function formatReplResponse(prompt: string, response: string): string {
    return `> ${prompt}\n${response}`;
  }

  describe('parseSlashCommand', () => {
    it('should detect /ain command in text', () => {
      const result = parseSlashCommand('/ain explain recursion');
      expect(result).not.toBeNull();
      expect(result?.command).toBe('ain');
      expect(result?.prompt).toBe('explain recursion');
    });

    it('should extract prompt text after /ain', () => {
      const result = parseSlashCommand('/ain what is TypeScript?');
      expect(result?.prompt).toBe('what is TypeScript?');
    });

    it('should handle multiple word prompts', () => {
      const result = parseSlashCommand('/ain how do I implement async/await patterns in node');
      expect(result?.prompt).toBe('how do I implement async/await patterns in node');
    });

    it('should return null for unrecognized commands', () => {
      const result = parseSlashCommand('/other some text');
      expect(result).toBeNull();
    });

    it('should return null if /ain has no prompt', () => {
      const result = parseSlashCommand('/ain');
      expect(result).toBeNull();
    });

    it('should return null if /ain has only whitespace after', () => {
      const result = parseSlashCommand('/ain   ');
      expect(result).toBeNull();
    });

    it('should return null for plain text without slash', () => {
      const result = parseSlashCommand('just some text');
      expect(result).toBeNull();
    });

    it('should only match /ain at line start', () => {
      const result = parseSlashCommand('some text /ain prompt');
      expect(result).toBeNull();
    });

    it('should handle /ain with special characters in prompt', () => {
      const result = parseSlashCommand('/ain what is "hello world" in JavaScript?');
      expect(result?.prompt).toContain('hello world');
    });

    it('should handle /ain with punctuation', () => {
      const result = parseSlashCommand('/ain What is TypeScript?!');
      expect(result?.prompt).toBe('What is TypeScript?!');
    });
  });

  describe('detectSlashCommandAtCursor', () => {
    it('should detect /ain at cursor position', () => {
      const line = '/ain test';
      const cursorAtEnd = line.length;
      const result = detectSlashCommandAtCursor(line, cursorAtEnd);
      expect(result).toBe(true);
    });

    it('should not trigger on partial /a', () => {
      const line = '/a';
      const result = detectSlashCommandAtCursor(line, 2);
      expect(result).toBe(false);
    });

    it('should not trigger on /ai without n', () => {
      const line = '/ai';
      const result = detectSlashCommandAtCursor(line, 3);
      expect(result).toBe(false);
    });

    it('should return false for non-command text', () => {
      const line = 'normal text here';
      const result = detectSlashCommandAtCursor(line, 5);
      expect(result).toBe(false);
    });

    it('should handle cursor after complete /ain', () => {
      const line = '/ain test';
      const result = detectSlashCommandAtCursor(line, 4); // Cursor AFTER 'n'
      expect(result).toBe(true);
    });

    it('should not trigger if /ain is mid-line', () => {
      const line = 'prefix /ain test';
      const result = detectSlashCommandAtCursor(line, 12);
      expect(result).toBe(false);
    });
  });

  describe('formatReplResponse', () => {
    it('should format response as REPL: prompt + answer', () => {
      const prompt = 'explain closures';
      const response = 'Closures are functions that...';
      const formatted = formatReplResponse(prompt, response);

      expect(formatted).toContain('>');
      expect(formatted).toContain(prompt);
      expect(formatted).toContain(response);
    });

    it('should include answer on new line', () => {
      const prompt = 'what is 2+2';
      const response = '4';
      const formatted = formatReplResponse(prompt, response);

      const lines = formatted.split('\n');
      expect(lines[0]).toContain('>');
      expect(lines[0]).toContain(prompt);
      expect(lines[1]).toBe(response);
    });

    it('should handle multiline responses', () => {
      const prompt = 'explain async/await';
      const response = 'Line 1\nLine 2\nLine 3';
      const formatted = formatReplResponse(prompt, response);

      expect(formatted).toContain(prompt);
      expect(formatted).toContain('Line 1');
      expect(formatted).toContain('Line 3');
    });
  });

  describe('Edge cases', () => {
    it('should handle /ain with leading spaces (trimmed)', () => {
      const line = '  /ain test';
      // Should not parse because of leading spaces
      const result = parseSlashCommand(line);
      expect(result).toBeNull();
    });

    it('should preserve case in prompt', () => {
      const result = parseSlashCommand('/ain ExPlAiN cLoSuReS');
      expect(result?.prompt).toBe('ExPlAiN cLoSuReS');
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'a'.repeat(500);
      const result = parseSlashCommand(`/ain ${longPrompt}`);
      expect(result?.prompt).toHaveLength(500);
    });

    it('should handle /ain with URLs in prompt', () => {
      const result = parseSlashCommand('/ain explain https://example.com');
      expect(result?.prompt).toContain('https://example.com');
    });

    it('should handle /ain with code snippets in prompt', () => {
      const result = parseSlashCommand('/ain explain const x = 42;');
      expect(result?.prompt).toContain('const x = 42;');
    });

    it('should not trigger on /ain/ or /ain-', () => {
      expect(parseSlashCommand('/ain/ test')).toBeNull();
      expect(parseSlashCommand('/ain-test')).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should parse and detect /ain in editor flow', () => {
      const line = '/ain what is TypeScript';
      
      // User types /ain
      const detectedAtSlash = detectSlashCommandAtCursor('/ain', 4);
      expect(detectedAtSlash).toBe(true);

      // User completes prompt
      const parsed = parseSlashCommand(line);
      expect(parsed?.command).toBe('ain');
      expect(parsed?.prompt).toBe('what is TypeScript');
    });

    it('should generate REPL response for valid parse', () => {
      const input = '/ain 2+2';
      const parsed = parseSlashCommand(input);
      
      if (parsed) {
        const response = '4';
        const formatted = formatReplResponse(parsed.prompt, response);
        expect(formatted).toContain('> 2+2');
        expect(formatted).toContain('4');
      }
    });
  });
});

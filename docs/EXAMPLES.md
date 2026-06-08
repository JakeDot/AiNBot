# Usage Examples

## Text Enhancement Scenarios

### 1. Improving Academic Writing

**Original:**
"The study shows that people who exercise is healthier. The results is significant."

**Command:** Enhance selected text

**Result:**
"The study demonstrates that people who exercise are healthier. The results are statistically significant."

---

### 2. Summarizing Meeting Notes

**Original:**
```
We discussed Q3 roadmap priorities. Team agreed that performance optimization should be first, 
followed by user authentication improvements. Marketing wants feature X by end of September. 
Development needs two weeks for the auth system. We scheduled a follow-up meeting for next Friday 
to review progress on prototype builds.
```

**Command:** Summarize selected text

**Result:**
```
Q3 Priorities: (1) Performance optimization, (2) User authentication. Feature X needed by September. 
Auth system requires 2 weeks development. Follow-up meeting scheduled for next Friday.
```

---

### 3. Expanding Technical Documentation

**Original:**
"REST API endpoints use standard HTTP methods. Errors return appropriate status codes."

**Command:** Expand selected text

**Result:**
"REST API endpoints follow standard HTTP method conventions:
- GET retrieves resources
- POST creates new resources  
- PUT updates existing resources
- DELETE removes resources

Error responses include appropriate HTTP status codes (4xx for client errors, 5xx for server errors) 
along with JSON error bodies containing error codes and descriptive messages to aid debugging."

---

### 4. Creating Content Outlines

**Original:**
"Climate change affects weather patterns, agriculture, ocean levels, biodiversity, and human health. 
It's caused by greenhouse gases from fossil fuels. Solutions include renewable energy, reforestation, 
and policy changes."

**Command:** Generate outline

**Result:**
```
# Climate Change

## Causes
- Greenhouse gas emissions
- Fossil fuel consumption
- Industrial processes
- Deforestation

## Effects
- Weather pattern disruption
- Agricultural impacts
- Rising ocean levels
- Biodiversity loss
- Human health consequences

## Solutions
- Renewable energy transition
- Reforestation efforts
- Policy and regulation
- Individual action
```

---

## Interactive Chat Scenarios

### 1. Brainstorming Product Features

**User:** "I'm designing a note-taking app for researchers. What features would be most valuable?"

**Claude:** "Consider these key features:
1. **Citation Management** - Automatic bibliography generation
2. **Collaborative Features** - Real-time co-editing
3. **Knowledge Graphs** - Visual connections between concepts
4. **Advanced Search** - Full-text and semantic search
5. **Export Options** - Multiple formats (PDF, Word, Markdown)
6. **Offline Support** - Work without internet"

---

### 2. Debugging Code Issues

**User:** "My API endpoint is returning 500 errors intermittently. Where should I start debugging?"

**Claude:** "Check these in order:
1. **Server logs** - Look for exception stack traces
2. **Database connectivity** - Test connections during errors
3. **Resource limits** - CPU, memory, database connections
4. **Rate limiting** - Check if you're hitting API limits
5. **Dependencies** - Verify external services are responding
6. **Recent changes** - Compare with last working version"

---

### 3. Writing Assistance

**User:** "I'm struggling to write the conclusion to my essay. Can you help me structure it?"

**Claude:** "A strong conclusion typically includes:
1. **Restate thesis** - Remind reader of main argument (paraphrased)
2. **Summarize key points** - Brief recap of supporting evidence
3. **Address implications** - Why does this matter?
4. **Broader context** - How does this connect to larger issues?
5. **Call to action** (optional) - What should readers do with this information?
6. **Final thought** - End with memorable insight or question"

---

## Advanced Use Cases

### 1. Custom System Prompts for Specific Domains

#### Academic Writing Coach
**System Prompt:**
```
You are an expert academic writing coach. Your role is to help refine scholarly writing 
for clarity, rigor, and impact. When reviewing text:
- Flag vague or imprecise language
- Suggest stronger evidence-based statements
- Identify logical gaps or unsupported claims
- Recommend passive→active voice conversions
- Ensure proper academic tone
```

#### Creative Writing Assistant
**System Prompt:**
```
You are a creative writing coach specializing in fiction. Help writers:
- Develop vivid, sensory descriptions
- Create compelling character voices
- Build tension and pacing
- Strengthen dialogue naturalness
- Enhance emotional resonance
Provide constructive feedback with specific examples.
```

#### Technical Documentation Editor
**System Prompt:**
```
You are a technical documentation expert. When editing:
- Ensure clarity for target audience (beginner/expert)
- Check completeness of examples
- Verify accuracy of technical details
- Suggest clearer structure and organization
- Flag jargon that needs definition
- Test logical flow of instructions
```

---

### 2. Multi-Step Workflows

#### Publishing Workflow
1. **Expand** initial draft to full length
2. **Summarize** to create abstract
3. **Generate outline** for table of contents
4. **Ask Claude** "What parts are unclear to readers unfamiliar with the topic?"
5. **Enhance** those sections based on feedback

#### Research Workflow
1. **Summarize** research paper abstract
2. **Ask Claude** "What are the main limitations of this study?"
3. **Expand** methodology section for clarity
4. **Generate outline** of findings
5. **Ask Claude** "How does this relate to [specific topic]?"

---

### 3. Batch Processing Patterns

While the UI processes one selection at a time, you can:
- Process multiple sections sequentially
- Copy each result to a new section
- Use generated outlines as templates for expansion

**Example:**
1. Generate outline of entire document
2. For each section in outline, select corresponding text
3. Enhance or expand each section
4. Compile enhanced sections into final document

---

## Tips for Best Results

### Prompt Clarity
- **Specific:** "Improve this for academic journal publication" 
- Not: "Make it better"

### Context Setting
- Include genre/purpose in system prompt
- Adjust temperature for consistency vs. creativity
- Use appropriate model (Haiku=speed, Opus=quality)

### Iterative Refinement
- Start with enhancement, evaluate result
- Ask follow-up questions for deeper changes
- Use feedback loop: Claude → Edit → Ask → Refine

### Token Management
- Short summaries: 512-1024 tokens
- Medium content: 1024-2048 tokens
- Detailed expansion: 2048-4096 tokens

---

## API Cost Estimation

Based on Claude pricing (varies by region):

| Task | Avg Tokens | Approx Cost |
|------|-----------|------------|
| Enhance sentence | 100-200 | <$0.01 |
| Summarize paragraph | 200-400 | <$0.02 |
| Generate outline | 500-1000 | <$0.05 |
| Expand section | 1000-2000 | <$0.10 |
| Chat exchange | 300-600 | <$0.03 |

Monitor usage in [Anthropic Console](https://console.anthropic.com)

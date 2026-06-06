# Claude MCP Skill Usage Rules

## Purpose

Claude may use connected MCP tools when they make the project more accurate, easier to verify, or faster to implement. MCP usage must support the numerical-method fighting game project, not distract from it.

The project priority remains:

1. Numerical-method visibility
2. Correct implementation from scratch
3. Side-by-side comparison clarity
4. Live-demo stability
5. Student explainability
6. Simple local multiplayer gameplay
7. Asset-ready rendering
8. Visual polish

If an MCP tool does not directly help one of those priorities, Claude should not use it.

---

## Available MCP Categories

Claude may have access to tools such as:

- `context7`
- `playwright`
- `superpowers`
- `Google Drive`
- `Hugging Face`

The exact available tools may vary by machine/session. Claude must first check what is connected before relying on any tool.

---

## General MCP Usage Rule

Claude should use MCP tools only when they provide clear value.

Claude must not use tools just because they are available.

Claude must not let MCP usage replace reasoning, implementation discipline, or the project context.

Claude must not use MCP tools to add unnecessary complexity such as online multiplayer, external game engines, unnecessary libraries, or unrelated AI/ML features.

---

## When Claude SHOULD Use MCP Tools

Claude should use MCP tools for these cases:

### 1. Browser Testing with Playwright

Use Playwright when verifying the game in a browser would catch errors that static reading may miss.

Recommended uses:

- Open `index.html` in a browser.
- Check whether the canvas renders.
- Check whether JavaScript runtime errors appear in the console.
- Test keyboard input.
- Test local 2-player controls.
- Test comparison mode.
- Test whether the numerical overlay appears.
- Test whether the game still runs after asset placeholders fail or assets are missing.

Expected result:

Claude should report:

- whether the page loads
- whether console errors exist
- what controls were tested
- what visual/gameplay behavior was confirmed
- what bugs remain

Claude should not rely only on Playwright screenshots. It should still inspect the code when checking numerical methods.

---

### 2. Documentation Lookup with Context7

Use Context7 when Claude needs current or precise documentation for web APIs or implementation patterns.

Recommended uses:

- Canvas 2D API behavior
- keyboard event handling
- requestAnimationFrame timing
- browser image loading
- audio/image asset fallback behavior if needed

Do not use Context7 to search for spline libraries or code to copy. The numerical methods must be implemented from scratch.

---

### 3. Project File Access with Google Drive

Use Google Drive only if the user provides or references project files stored there.

Recommended uses:

- Read existing assignment docs.
- Read lecturer instructions.
- Read paper-review documents.
- Read previous code/demo files.
- Read presentation files.

Claude must not assume Google Drive contains the latest file unless the user explicitly says so.

Claude must summarize what it found and state if the file appears incomplete, outdated, or unrelated.

---

### 4. Hugging Face

Hugging Face should usually not be needed for this project.

Possible valid uses:

- Looking for general asset-generation or model metadata only if the user explicitly asks.
- Checking documentation for a specific Hugging Face model only if it becomes relevant.

Invalid uses:

- Adding ML models to the game.
- Replacing the numerical methods with model-generated behavior.
- Searching for code that hides the required math.
- Adding AI features that distract from the assignment.

Default: do not use Hugging Face for the core game implementation.

---

### 5. Superpowers

Use Superpowers only if it improves Claude’s workflow without changing the project scope.

Valid uses:

- project planning support
- code organization support
- checklist or task tracking support
- structured self-review if available

Invalid uses:

- changing the architecture without permission
- introducing unrelated frameworks
- expanding the game scope beyond the approved plan

---

## MCP Usage by Project Phase

### Phase 1: Context Reading

Claude should read the provided project context first.

MCP use:

- Usually no MCP needed.
- Google Drive only if the context files or assignment documents are stored there.

Output:

- role confirmation
- project goal
- non-negotiable requirements
- main risks
- what Claude must not do

---

### Phase 2: Architecture Confirmation

Claude should confirm the game architecture before coding.

MCP use:

- Usually no MCP needed.
- Context7 only if a browser API detail affects the architecture.

Output:

- file structure
- game systems
- numerical-method mapping
- comparison mode design
- asset-ready rendering plan

---

### Phase 3: Implementation

Claude should write the single-file game or revise existing code.

MCP use:

- Context7 allowed for browser/Canvas API clarification.
- Do not use external code or libraries for the numerical methods.
- Do not use Hugging Face.

Output:

- complete `index.html`
- numerical methods implemented from scratch
- clear comments around formulas
- asset-ready rendering hooks

---

### Phase 4: Browser Testing

Claude should use Playwright if available.

MCP use:

- Playwright strongly recommended.

Minimum tests:

- page opens without console errors
- canvas appears
- Player 1 movement works
- Player 2 movement works
- spline dash works
- curved projectile works if implemented
- comparison mode works
- numerical overlay displays method state
- missing assets do not crash the game

Output:

- test summary
- errors found
- fixes applied or recommended

---

### Phase 5: Revision

Claude should fix only the audited issues.

MCP use:

- Playwright recommended after fixes.
- Context7 allowed only for API-specific bugs.

Rules:

- Do not redesign the game.
- Do not remove working features.
- Do not change the numerical-method contract.
- Do not introduce new libraries unless the user explicitly approves.

---

### Phase 6: Final Polish

Claude may improve UI clarity, comments, and presentation labels.

MCP use:

- Playwright recommended for final smoke test.
- No Hugging Face unless explicitly requested.

Output:

- final file
- final testing notes
- remaining risks

---

## Required Tool-Use Discipline

Before using an MCP tool, Claude should briefly decide:

1. What question am I answering with this tool?
2. Which project priority does this help?
3. Could I answer this safely without the tool?
4. Will this tool introduce scope creep?

After using an MCP tool, Claude should report:

1. what tool was used
2. what was checked
3. what was found
4. what changed because of the result

---

## Hard Restrictions

Claude must not:

- use a spline/math library to implement Catmull-Rom
- use a game engine such as Phaser, Unity, Godot, or Pygame
- use MCP tools to copy a complete game from external sources
- add online multiplayer unless the user explicitly changes the scope
- add backend/server logic to the assignment version
- add ML or Hugging Face models to the core implementation
- hide the numerical methods inside unexplained helper functions
- remove side-by-side comparison mode
- remove asset fallback placeholders
- prioritize asset polish before the numerical-method demo works

---

## Required Browser-Test Checklist for Claude

If Playwright is connected, Claude should run or simulate this checklist before saying the code is final:

- [ ] `index.html` opens in browser.
- [ ] No JavaScript console errors on load.
- [ ] Canvas renders the arena.
- [ ] Player 1 controls respond.
- [ ] Player 2 controls respond.
- [ ] Normal movement works.
- [ ] Spline-based special movement works.
- [ ] Projectile ability works if included.
- [ ] Side-by-side comparison mode works.
- [ ] The left side shows the no-method / linear behavior.
- [ ] The right side shows the numerical-method behavior.
- [ ] The method overlay displays Catmull-Rom status.
- [ ] The method overlay displays arc length or sampled point stats.
- [ ] Missing assets do not crash the game.
- [ ] Game remains playable with placeholder graphics.

---

## Prompt Insert Block

Use this short block inside every Claude prompt for this project:

```text
You may use your connected MCP tools when they directly support the task. Prefer Playwright for browser testing and Context7 for precise browser/Canvas API documentation. Use Google Drive only for user-provided project files. Do not use MCP tools to expand scope, add online multiplayer, add ML features, copy external game code, or replace the required from-scratch numerical methods. If you use a tool, briefly report what you checked and what changed because of it.
```

---

## Final Rule

MCP tools are support tools, not the project driver.

The project driver is still the approved context:

> Build a local 2-player browser arena fighter where numerical methods visibly improve special movement and projectile behavior, with side-by-side comparison showing why the methods matter.

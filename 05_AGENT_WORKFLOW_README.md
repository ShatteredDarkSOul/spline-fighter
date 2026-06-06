# 05_AGENT_WORKFLOW_README.md
# How to Use These Agent Contexts

## Do different agents need different context?

Yes.

All agents should share the same project truth, but each agent should receive a different role-specific context.

Use this structure:

```text
Shared truth:
00_MASTER_PROJECT_CONTEXT.md

Role-specific contexts:
01_CHATGPT_ARCHITECT_AUDITOR_CONTEXT.md
02_CLAUDE_OPUS_4_8_CODING_CONTEXT.md
03_GEMINI_RESEARCH_VERIFICATION_CONTEXT.md
04_CLAUDE_POLISH_PRESENTATION_CONTEXT.md
```

The master context prevents contradiction.
The role-specific contexts prevent agents from doing the wrong job.

## Recommended Workflow

### Step 1 — ChatGPT: Final Architecture Gate

Use:

- `00_MASTER_PROJECT_CONTEXT.md`
- `01_CHATGPT_ARCHITECT_AUDITOR_CONTEXT.md`

Ask ChatGPT to:

- verify the scope
- produce the coding contract
- identify risks before coding
- check whether the idea is still academically clear

### Step 2 — Gemini: Academic Verification

Use:

- `00_MASTER_PROJECT_CONTEXT.md`
- `03_GEMINI_RESEARCH_VERIFICATION_CONTEXT.md`

Ask Gemini to verify:

- paper connection
- Catmull-Rom explanation
- Riemann-sum arc length explanation
- arc-length reparameterization explanation
- presentation wording

### Step 3 — Claude Opus 4.8: Main Coding

Use:

- `00_MASTER_PROJECT_CONTEXT.md`
- `02_CLAUDE_OPUS_4_8_CODING_CONTEXT.md`

Ask Claude to produce:

- one full `index.html`
- no external assets required
- placeholder Canvas graphics
- asset-ready rendering
- local multiplayer
- demo comparison mode
- all three numerical method functions clearly commented

### Step 4 — ChatGPT: Code Audit

Give ChatGPT:

- the generated `index.html`
- `00_MASTER_PROJECT_CONTEXT.md`
- `01_CHATGPT_ARCHITECT_AUDITOR_CONTEXT.md`

Ask for:

- numerical-method audit
- demo stability audit
- missing requirement check
- likely bug list
- explanation checklist

### Step 5 — Claude: Natural Presentation Polish

Use:

- `00_MASTER_PROJECT_CONTEXT.md`
- `04_CLAUDE_POLISH_PRESENTATION_CONTEXT.md`

Ask Claude for:

- natural presentation script
- demo narration
- Q&A preparation
- Indonesian/English explanation if needed

### Step 6 — ChatGPT: Final Submission Gate

Ask ChatGPT to do the final audit before presentation:

- Does the game run?
- Are the methods visible?
- Can the student explain the code?
- Is the side-by-side comparison clear?
- Are the claims academically safe?

## Short Prompt for Claude Opus 4.8 Coding

Use this after attaching `00_MASTER_PROJECT_CONTEXT.md` and `02_CLAUDE_OPUS_4_8_CODING_CONTEXT.md`:

```text
Read both context files fully. Build the final single-file `index.html` for Spline Fighter: Method Lab Arena.

Follow the context strictly. Prioritize numerical-method visibility, side-by-side comparison, demo stability, and explainable code.

The final output must be one complete HTML file using vanilla Canvas and JavaScript. Do not use game engines or spline libraries. The game must run without external assets but be asset-ready through an asset manifest and fallback rendering.
```

## Short Prompt for Gemini Verification

Use this after attaching `00_MASTER_PROJECT_CONTEXT.md` and `03_GEMINI_RESEARCH_VERIFICATION_CONTEXT.md`:

```text
Verify whether this project framing is academically correct for a Numerical Methods class. Check the Catmull-Rom explanation, Riemann-sum arc length explanation, linear interpolation reparameterization explanation, and the connection to the chosen path-smoothing paper. Give a strict but practical verification report.
```

## Short Prompt for ChatGPT Audit

Use this after Claude generates the code:

```text
Audit this `index.html` against the master context. Check numerical-method correctness, implementation from scratch, side-by-side comparison clarity, player movement usage, projectile usage, asset-ready architecture, local multiplayer stability, and student explainability. List must-fix issues first, then nice-to-have improvements.
```

## Development Principle

Prototype first with placeholder shapes.

Do not make final assets before the numerical-method demo works.

Final assets can be integrated later because rendering is separated from game logic and all visuals go through named draw functions.

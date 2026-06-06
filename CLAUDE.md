# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Spline Fighter: Method Lab Arena** — a Numerical Methods academic demo for Universitas Negeri Yogyakarta (Metode Numerik, S1 Teknologi Informasi) disguised as a 2D local-multiplayer arena fighter. The entire game is **one file, `index.html`** (~4200 lines), vanilla JavaScript + HTML5 Canvas, no build step, no bundler, no game engine, no external math/spline libraries. It runs by opening the file in a browser.

The academic point is the priority over everything else: the game must *visibly prove* that numerical methods improve movement, projectile trajectories, and constant-speed motion. When a feature makes the game cooler but makes the numerical method harder to see/explain/defend, reject it.

## Running and testing

- **Run:** open `index.html` directly in a modern browser. Because it loads PNGs from `assets/menu/`, serve over HTTP if `file://` blocks them: `npx serve` or `python -m http.server`. The game is asset-tolerant — missing PNGs fall back to Canvas-drawn placeholders, so it still runs with zero external files.
- **Test:** Playwright (the only dependency, `package.json` → `devDependencies`). Drive it via the Playwright MCP `browser_*` tools (`browser_navigate`, `browser_resize`, screenshots), or `npx playwright`. Install the browser once with `npx playwright install chromium`. There is no test suite — verification is manual/visual against the demo behavior.
- `mydatabase.db` and `node_modules/` are incidental; ignore them.

## The four numerical methods — never touch these

Section 3 of `index.html`. These function names are **fixed** and the implementations must remain from-scratch (no library calls). Do not rename or alter them, and do not move their formula comments:

- `catmullRomSegment(P0, P1, P2, P3, t)` — Catmull-Rom spline, `B(t) = 0.5 * [2P1 + (-P0+P2)t + (2P0-5P1+4P2-P3)t² + (-P0+3P1-3P2+P3)t³]`
- `buildCurve(waypoints, stepsPerSegment)` — chains segments with phantom-endpoint duplication
- `computeArcLengths(curvePoints)` — Riemann sum, returns a **cumulative** array `[0, d1, d2, ...]`
- `getPositionAtDistance(curvePoints, arcLengths, distance)` — linear-interpolation arc-length reparameterization

These methods must affect *actual gameplay position*, not only visual trails. Normal walking and jumping must **not** be spline-based — only abilities (dash, projectiles, meteor reflection) use the curve.

## Architecture: the three layers that matter

**1. Method modes (keys 1/2/3) are a global quality dial.** Every ability reads `GS.methodMode` (`'linear'` | `'catmull'` | `'full'`) and behaves differently:
- `linear` — straight segments, angular, uneven speed (the "bad" baseline)
- `catmull` — smooth curve but movement advances by raw parameter `t`, so speed is visibly uneven
- `full` — Catmull-Rom + arc-length table + reparameterization → constant-speed motion

This three-way split is the entire pedagogical thesis. Any ability you add must honor all three modes, with the linear version deliberately worse.

**2. PathData is the universal currency.** Abilities and projectiles don't move themselves — they generate a `PathData` (waypoints, `curvePoints`, `arcLengths`, `totalLength`, `linearSegments`) once, then a per-frame stepper advances `distanceTraveled` and queries position. Path *generation* (section 7: `makeDashPathDir`, `makeProjectilePath`, `makeMeteorPath`) is separate from path *following* (section 8 steppers). Projectile bounces (`rebuildBouncePath`) and reflections rebuild a fresh `PathData` and reset `distanceTraveled` to 0.

**3. Rendering is fully separated from logic.** All drawing goes through named `draw*`/`render*` functions (section 12) and an asset manifest with fallback placeholders (section 2). Collision uses logical hitboxes (`{width, height}`), never sprite pixels — assets are cosmetic only. This is what keeps the game asset-ready.

### Code section map (`index.html`)

The file is organized into 14 numbered comment-banner sections; keep new code in the right one:

```
1.  CONFIG AND CONSTANTS        — all tunables (GRAVITY, HIT_DATA, METEOR_*, HEAVY_*, storm timings)
2.  ASSET MANIFEST AND LOADER   — null-safe image loader, Canvas fallbacks
3.  NUMERICAL METHODS           — the four fixed functions (see above)
4.  GAME STATE                  — makePlayer, initGameState
5.  INPUT SYSTEM                — keydown/up map, mode + demo-lab key routing
6.  ARENA AND PHYSICS           — platforms, gravity, collision (non-spline)
7.  ABILITY PATH GENERATION     — makeDashPathDir / makeProjectilePath / makeMeteorPath
8.  ABILITY SYSTEM              — executeDash, tryProjectile, spawnProjectile, steppers,
                                  triggerProjectileImpact, triggerHeavyBurst, rebuildBouncePath
    8b. VS AI SYSTEM
    8c. POWER-UP SYSTEM
9.  COMPARISON / DEMO LAB        — updateDemoLab, impact showcase, side-by-side panels
10. COLLISION AND HIT DETECTION — checkProjHits, checkProjClash
    10b. SHIELD AND PARRY
    10c. METEOR / METHOD STORM
11. UPDATE LOOP
12. RENDERING SYSTEM
13. EDUCATIONAL UI OVERLAY      — always-visible classroom overlay
14. MAIN GAME LOOP
```

The detailed, up-to-date state of each subsystem (with constants and per-patch changes) lives in `docs/dev-notes/CURRENT_PROJECT_HANDOFF.md` — read it before modifying combat, meteors, projectiles, or the Demo Lab. `docs/dev-notes/PROJECT_CONTEXT.md` is the requirements spec / source of truth.

## Hard rules (from the project spec — violating these breaks the demo or the grade)

- **Patch the existing `index.html`; never rewrite it from scratch.** Keep it a single file.
- Do not change the four numerical functions, or replace them with libraries.
- Do not remove Demo Lab, the side-by-side comparison, power-up showcase, meteor comparison, or impact lab.
- `R` is **reset only** — never assign it to a player ability. `S` / `ArrowDown` are guard keys.
- `applyGuardedHit` must be the path for *all* damage (including meteor explosion and heavy-burst area damage). Meteor explosions and heavy bursts are intentionally **not** parryable; meteor *body* contact is parryable/reflectable.
- Every projectile keeps its `justBounced` guard flag (prevents same-frame double-hit on bounce) and `statMods` survive respawn but reset on `R`.
- Storm escalation reads `GS.matchTime` (seconds), never `frameCount` or wall clock. Demo Lab is never affected by the match timer or storm.
- **Ultimate Spline Rush is reserved but intentionally unimplemented** — the `cooldowns.rush` slot and `'rush'` type exist as placeholders. Do not build broken Ultimate logic into the playable build.
- `preventDefault` for Tab and Space.

## Controls (for testing the demo)

Global: `1/2/3` method modes · `TAB` Demo Lab · `P` practice · `I` vs-AI · `R` reset · `\` hitbox debug · `Space` restart Demo Lab comparison.
P1: `A/D` move, `W` jump, `F` attack, `G` charge dash, `H` projectile, `C` cycle shot, `V` enhance, `S` guard.
P2: arrows move/jump, `K` attack, `L` dash, `;` projectile, `N` cycle shot, `M` enhance, `ArrowDown` guard.
Demo Lab: `G` dash · `H` projectile · `M` meteor · `U` power-ups · `B` impact lab · `Q/E` cycle module · `←/→` sliders.

## Working contract for multi-agent workflow

This repo was driven by a multi-tool workflow (`docs/dev-notes/05_AGENT_WORKFLOW_README.md`): ChatGPT audits architecture, Gemini verifies the academic framing, Claude Opus 4.8 does the coding. Use MCP tools only when they directly serve the task — Playwright for browser testing after a change, Context7 for Canvas/keyboard API reference. Do not use MCP tools to expand scope (no multiplayer, no ML, no copied game code, no library substitution for the numerical methods).

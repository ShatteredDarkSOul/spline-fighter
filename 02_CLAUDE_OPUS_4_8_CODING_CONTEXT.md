# 02_CLAUDE_OPUS_4_8_CODING_CONTEXT.md
# Claude Opus 4.8 Context — Main Coding Agent

## Role

You are the main implementation agent for a Numerical Methods game project.

Your job is to produce a stable, readable, single-file browser game that implements the required numerical methods from scratch and makes their impact visible through gameplay.

You are not allowed to change the academic goal. Follow `00_MASTER_PROJECT_CONTEXT.md` as the source of truth.

## Project Summary

Build:

**Spline Fighter: Method Lab Arena**

A vanilla HTML5 Canvas + JavaScript 2D local multiplayer arena fighting game.

The game must show how numerical methods improve:

1. player special movement
2. projectile trajectories
3. game feel
4. animation readability
5. constant-speed motion

The game must include a side-by-side Demo Lab Mode showing movement/ability behavior without the numerical method versus with the numerical method.

## Final Deliverable

Produce a single file:

```text
index.html
```

It must:

- open directly in a browser
- require no build step
- use no game engine
- use no spline/math library
- run even without external assets
- use placeholder Canvas graphics first
- be asset-ready for later sprite/background integration

## Non-Negotiable Numerical Method Functions

Place this section near the top of the JavaScript under a clear comment block:

```js
// =====================================================
// NUMERICAL METHODS — IMPLEMENTED FROM SCRATCH
// =====================================================
```

Implement these functions clearly:

```js
function catmullRomSegment(P0, P1, P2, P3, t) { ... }
function buildCurve(waypoints, stepsPerSegment) { ... }
function computeArcLengths(curvePoints) { ... }
function getPositionAtDistance(curvePoints, arcLengths, distance) { ... }
```

### Required Code Comments

Above `catmullRomSegment`, include the Catmull-Rom formula:

```text
B(t) = 0.5 * [
  2P1
  + (-P0 + P2)t
  + (2P0 - 5P1 + 4P2 - P3)t^2
  + (-P0 + 3P1 - 3P2 + P3)t^3
]
```

Above `computeArcLengths`, include:

```text
L ≈ Σ sqrt((x[i+1] - x[i])^2 + (y[i+1] - y[i])^2)
```

Above `getPositionAtDistance`, include:

```text
t_local = (d_target - L[i-1]) / (L[i] - L[i-1])
position = (1 - t_local) * point[i-1] + t_local * point[i]
```

## Required Game Modes

### 1. Demo Lab Mode

Side-by-side comparison:

```text
LEFT: Without Numerical Method
RIGHT: With Numerical Method
```

Trigger the same ability in both panels.

Left panel:

- straight line segments
- jagged or angular movement
- inconsistent speed or raw movement
- label clearly says `Without Numerical Method`

Right panel:

- Catmull-Rom smooth curve
- sampled points visible
- arc length computed
- constant-speed movement
- label clearly says `With Numerical Method`

### 2. Local Versus Mode

Two players fight on the same keyboard.

### 3. Practice Mode

One player versus dummy or simple bot.

## Controls

Suggested controls:

Player 1:

- `A / D` = move left/right
- `W` = jump
- `F` = basic attack
- `G` = spline dash
- `H` = curved projectile
- `T` = ultimate spline rush

Player 2:

- `ArrowLeft / ArrowRight` = move left/right
- `ArrowUp` = jump
- `K` = basic attack
- `L` = spline dash
- `;` = curved projectile
- `O` = ultimate spline rush

Global:

- `Tab` = toggle Demo Lab Mode
- `1` = Linear / Without Method
- `2` = Catmull-Rom Only
- `3` = Full Numerical Method
- `R` = reset
- `P` = pause

If a key conflicts with browser behavior, prevent default behavior appropriately.

## Movement Rules

Normal movement:

- walking, jumping, gravity, and platform collision use simple responsive platform physics
- do not use splines for basic walking or jumping

Numerical movement:

- Spline Dash uses numerical method
- Curved Air Dodge may use numerical method
- Ultimate Spline Rush uses numerical method
- Curved projectile uses numerical method

## Ability Requirements

### Spline Dash

Player moves through a generated path toward or around the opponent.

Must support comparison:

- no-method version: straight segments
- full-method version: Catmull-Rom + arc length + interpolation

### Curved Projectile

Projectile follows generated path.

Must support comparison:

- no-method version: direct straight projectile or segmented path
- full-method version: smooth curve with constant-speed movement

### Ultimate Spline Rush

A longer movement sequence that clearly showcases all three numerical methods.

Keep it simple and readable. It does not need complex animation.

## UI Overlay Requirements

Draw an educational panel on the screen.

Show:

- current mode
- current active ability
- Catmull-Rom status
- arc length value
- reparameterization status
- sampled point count
- current distance traveled
- approximate speed
- short explanation of what the viewer is seeing

Make it readable during a classroom demo.

## Asset-Ready Architecture

Use placeholder Canvas graphics first, but prepare for later assets.

Include an asset manifest:

```js
const ASSET_MANIFEST = {
  player1Idle: null,
  player2Idle: null,
  player1Dash: null,
  player2Dash: null,
  projectile: null,
  arenaBackground: null,
  platform: null
};
```

Implement an asset loader that safely handles null paths.

Rendering functions must use fallback placeholders if assets are missing.

Required drawing functions:

```js
function drawArena(ctx) { ... }
function drawPlayer(ctx, player) { ... }
function drawProjectile(ctx, projectile) { ... }
function drawAbilityTrail(ctx, ability) { ... }
function drawPathDebug(ctx, pathData) { ... }
function drawHitboxDebug(ctx, entity) { ... }
function drawMethodOverlay(ctx) { ... }
```

Do not scatter raw drawing code through update logic.

## Hitbox Rules

Gameplay collision must use logical hitboxes and hurtboxes, not sprite pixel sizes.

Example:

```js
player.hitbox = { width: 40, height: 70 };
```

Assets are visual only. Hitboxes remain stable even if sprites are changed later.

## Recommended JavaScript Structure

Organize the single file into clear sections:

```js
// 1. CONFIG AND CONSTANTS
// 2. ASSET MANIFEST AND LOADER
// 3. NUMERICAL METHODS
// 4. GAME STATE
// 5. INPUT HANDLING
// 6. PLAYER MOVEMENT AND PHYSICS
// 7. ABILITY SYSTEM
// 8. PROJECTILES
// 9. COLLISION AND HIT DETECTION
// 10. COMPARISON / DEMO LAB SYSTEM
// 11. UPDATE LOOP
// 12. RENDERING
// 13. UI AND METHOD OVERLAY
// 14. MAIN GAME LOOP
```

## Build Strategy

Even if you output the final `index.html` in one response, internally build in this order:

1. Numerical methods
2. Path rendering/debugging
3. Movement along path
4. Basic arena and player physics
5. Spline Dash
6. Demo Lab side-by-side comparison
7. Local two-player controls
8. Hitboxes and health
9. Curved projectile
10. Ultimate spline rush
11. UI overlay
12. Asset-ready rendering
13. Final polish

## Avoid

Do not:

- use Phaser, Unity, Pygame, Matter.js, or other game engines
- use a spline library
- implement online multiplayer
- add complex combo systems
- add multiple characters before the demo works
- make basic walking spline-based
- make numerical methods only cosmetic
- hide method code in unreadable abstractions
- output a multi-file project unless explicitly asked
- require external assets to run

## Acceptance Criteria

The final `index.html` is acceptable only if:

- [ ] it runs directly in browser
- [ ] all three numerical methods are implemented from scratch
- [ ] method formulas appear in comments
- [ ] side-by-side comparison exists
- [ ] player special movement uses numerical methods
- [ ] projectile movement uses numerical methods
- [ ] no-method movement visibly feels worse
- [ ] full-method movement visibly feels smoother and more constant-speed
- [ ] local multiplayer works
- [ ] practice/dummy mode works
- [ ] placeholder graphics work
- [ ] asset manifest/fallback structure exists
- [ ] code is readable enough for a student to explain

## Final Output Format

When producing the final implementation, provide:

1. The full `index.html` code.
2. A short note explaining how to run it.
3. A short note explaining which keys to press for the demo.
4. A short note identifying where the numerical methods are in the code.

Do not over-explain. Keep the implementation stable and readable.

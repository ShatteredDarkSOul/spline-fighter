# PROJECT_CONTEXT.md
# Spline Fighter: Method Lab Arena

Persistent project context for all Claude Code sessions.
This file is the single source of truth for requirements, constraints, and decisions.

---

## Project Identity

**Name:** Spline Fighter: Method Lab Arena
**Course:** Metode Numerik (Numerical Methods), Universitas Negeri Yogyakarta, S1 Teknologi Informasi, Semester 4
**Paper basis:** Ravankar et al. 2018 — *Path Smoothing Techniques in Robot Navigation: State-of-the-Art, Current and Future Challenges* (Sensors, MDPI)

This is a **Numerical Methods academic demo disguised as a fighting game**.
The game must visibly prove that numerical methods improve game feel, player special movement, projectile trajectories, and constant-speed motion.
It is not primarily a commercial fighting game.

---

## Final Deliverable

One complete `index.html` file.

- One HTML file
- One `<canvas>` element
- Vanilla JavaScript only
- HTML5 Canvas rendering
- No build step
- No bundler
- No game engine (no Phaser, Matter.js, Unity, Godot, Pygame, etc.)
- No external libraries (no spline libs, no math libs)
- No external assets required
- Runs directly in any modern browser

---

## Priority Order

When requirements conflict, follow this order:

1. Numerical-method visibility
2. Correct from-scratch implementation
3. Side-by-side comparison clarity
4. Live-demo stability
5. Student explainability
6. Simple playable fighting-game feel
7. Asset-ready architecture
8. Visual polish
9. Extra features

**Critical rule:** If a feature makes the game cooler but makes the numerical method harder to see, explain, or defend — reject it.

---

## Core Numerical Methods

All three must be implemented from scratch. No libraries.

### Method 1 — Catmull-Rom Spline Interpolation

```js
function catmullRomSegment(P0, P1, P2, P3, t) { ... }
function buildCurve(waypoints, stepsPerSegment) { ... }
```

Formula comment required in code:
```
B(t) = 0.5 * [
  2P1
  + (-P0 + P2)t
  + (2P0 - 5P1 + 4P2 - P3)t^2
  + (-P0 + 3P1 - 3P2 + P3)t^3
]
where t is in [0, 1]
```

### Method 2 — Riemann-Sum Arc-Length Approximation

```js
function computeArcLengths(curvePoints) { ... }
```

Formula comment required in code:
```
L ≈ Σ sqrt((x[i+1] - x[i])^2 + (y[i+1] - y[i])^2)
```

Returns cumulative arc-length array, not only total length.

### Method 3 — Linear Interpolation for Arc-Length Reparameterization

```js
function getPositionAtDistance(curvePoints, arcLengths, distance) { ... }
```

Formula comment required in code:
```
t_local = (d_target - L[i-1]) / (L[i] - L[i-1])
position = (1 - t_local) * point[i-1] + t_local * point[i]
```

Locates the two arc-length entries that bracket the target distance, then linearly interpolates.

**All four function names are fixed. Do not rename them.**

The numerical methods must affect actual gameplay movement, not only visual trails.

---

## Virtual Resolution

```js
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
```

The canvas scales responsively to fit the browser window while preserving 16:9 aspect ratio.
All gameplay coordinates, hitboxes, platforms, paths, UI, and numerical methods use the virtual 1920×1080 coordinate system.

---

## Arena Layout

```
Main platform:
  x = 240, y = 900, width = 1440, height = 50

Floating platform left:
  x = 420, y = 680, width = 320, height = 35

Floating platform right:
  x = 1180, y = 680, width = 320, height = 35

Floating platform center:
  x = 800, y = 520, width = 320, height = 30

Player 1 spawn: x = 580, y = 820
Player 2 spawn: x = 1340, y = 820
```

---

## Controls

### Player 1
| Key | Action |
|-----|--------|
| A / D | Move left / right |
| W | Jump |
| F | Basic attack |
| G | Spline Dash |
| H | Curved Projectile |
| T | (Phase 2 only) Ultimate Spline Rush |

### Player 2
| Key | Action |
|-----|--------|
| Arrow Left / Right | Move left / right |
| Arrow Up | Jump |
| K | Basic attack |
| L | Spline Dash |
| ; | Curved Projectile |
| O | (Phase 2 only) Ultimate Spline Rush |

### Global
| Key | Action |
|-----|--------|
| 1 | Linear / No Numerical Method mode |
| 2 | Catmull-Rom Only mode |
| 3 | Full Numerical Method mode |
| TAB | Toggle Demo Lab Mode |
| P | Toggle Practice / Dummy Mode |
| R | Reset match (reset only — do not reassign) |
| \ | Toggle hitbox debug |
| Space | Restart Demo Lab comparison (in Demo Lab only) |

**R is reserved for reset only. Never assign it to a player ability.**
**Prevent default browser behavior for Tab and Space.**

---

## Method Modes

Three method modes, toggled by keys 1 / 2 / 3:

### Linear / No Numerical Method
- Straight segments between waypoints
- Angular movement
- No spline smoothing
- Inconsistent or raw speed

### Catmull-Rom Only
- Smooth Catmull-Rom curve
- Movement by raw parameter `t` (uniform sample index advance)
- Speed may be visibly uneven

### Full Numerical Method
- Catmull-Rom spline path
- Riemann-sum arc-length table computed
- Position found by linear interpolation at target distance
- Constant-speed motion along the curve

---

## Game Modes

### Local Versus Mode
Two players fight on the same keyboard.
Both have: walking, jumping, gravity, platform collision, basic attack, Spline Dash, Curved Projectile, health bar.
Normal walking and jumping must not use splines.

### Practice / Dummy Mode
Player 1 fights a stationary dummy.
Dummy takes damage. Resets on R.
Safe backup demo mode.

### Demo Lab Mode
TAB toggles Demo Lab.
Uses one canvas split into two clipped panels.

```
Left panel:  Without Numerical Method
Right panel: With Numerical Method
```

Left panel shows: linear/straight movement, angular paths, inconsistent speed, clear label.
Right panel shows: Catmull-Rom curve, arc-length table, constant-speed motion, sampled points, method stats, clear label.

Both panels animate the same conceptual ability simultaneously.

Demo Lab requirements:
- Auto-loops every 3 seconds
- Space restarts comparison instantly
- G selects / triggers Spline Dash comparison
- H selects / triggers Curved Projectile comparison
- Draws path lines and sampled points
- Shows method stats in overlay
- Panel labels always visible

---

## Required Abilities (Stage 2)

### Ability 1: Spline Dash
Player moves along a dynamically generated path toward/around/past opponent.

Waypoint strategy:
```
P0 = point behind player start (backward offset ~80px)
P1 = player start position
P2 = midpoint(player, target) + perpendicular offset (~200px)
P3 = exit point past/near target (forward extension ~80px)
```

- Full mode: Catmull-Rom + computeArcLengths + getPositionAtDistance
- Linear mode: straight segments, visibly worse

### Ability 2: Curved Projectile
Player fires a projectile along a curved trajectory.

Waypoint strategy:
```
P0 = point slightly behind player
P1 = projectile spawn (player edge)
P2 = midpoint(player, target) raised by ~180px
P3 = target or target-leading point
```

- Full mode: smooth curve, constant speed
- Linear mode: angular, stiff

### Phase 2 Ability: Ultimate Spline Rush
**NOT implemented in Stage 2. Postponed to Phase 2.**

The ability system must remain extensible for this without architecture rewrite.

Safe Stage 2 placeholders allowed:
- Cooldown slot named `rush`
- Ability type string `'rush'` supported in type system
- Comments marking Phase 2 insertion points

Do not create broken or unfinished Ultimate logic in the playable build.

---

## Educational Overlay

Always visible. Shows:

- Current game mode
- Current method mode (Linear / Catmull-Rom Only / Full)
- Active ability name
- Method 1: Catmull-Rom active/inactive
- Method 2: arc length value
- Method 3: reparameterization active/inactive
- Sampled point count
- Current distance traveled
- Speed estimate
- Controls reminder
- Comparison label (in Demo Lab)

Must be readable during a live classroom demo without inspecting code.

---

## Asset-Ready Architecture

Use placeholder Canvas shapes first. No external image files required.

Asset manifest in code:
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

Named draw functions (required):
```js
drawPlayer(ctx, player)
drawProjectile(ctx, projectile)
drawArena(ctx)
drawAbilityTrail(ctx, ability)
drawHitboxDebug(ctx, entity)
drawMethodOverlay(ctx)
```

- If asset path is non-null, attempt to load and render image.
- If asset is null or failed to load, render placeholder shape.
- Game must run with zero external assets.
- Collision uses logical hitboxes, not sprite pixel dimensions.

Hitbox example:
```js
player.hitbox = { width: 40, height: 70 };
```

---

## Required Code Sections (index.html)

```js
// =====================================================
// 1. CONFIG AND CONSTANTS
// =====================================================

// =====================================================
// 2. ASSET MANIFEST AND ASSET LOADER
// =====================================================

// =====================================================
// 3. NUMERICAL METHODS
// =====================================================

// =====================================================
// 4. GAME STATE
// =====================================================

// =====================================================
// 5. INPUT SYSTEM
// =====================================================

// =====================================================
// 6. ARENA AND PHYSICS
// =====================================================

// =====================================================
// 7. ABILITY PATH GENERATION
// =====================================================

// =====================================================
// 8. ABILITY SYSTEM
// =====================================================

// =====================================================
// 9. COMPARISON / DEMO LAB SYSTEM
// =====================================================

// =====================================================
// 10. COLLISION AND HIT DETECTION
// =====================================================

// =====================================================
// 11. UPDATE LOOP
// =====================================================

// =====================================================
// 12. RENDERING SYSTEM
// =====================================================

// =====================================================
// 13. EDUCATIONAL UI OVERLAY
// =====================================================

// =====================================================
// 14. MAIN GAME LOOP
// =====================================================
```

---

## Key Data Structures

### Player
```js
{
  id: 1 | 2,
  x, y,
  vx, vy,
  hitbox: { width: 40, height: 70 },
  facing: 1 | -1,
  onGround: bool,
  health: 100,
  maxHealth: 100,
  ability: {
    active: bool,
    type: 'dash' | 'projectile' | 'rush' | null,
    pathData: PathData | null,
    distanceTraveled: number,
    speed: number,
    mode: 'linear' | 'catmull' | 'full'
  },
  cooldowns: { dash: 0, projectile: 0, rush: 0 },
  controls: { left, right, jump, attack, dash, projectile, rush }
}
```

### PathData
```js
{
  waypoints: [{x,y}, ...],         // 4 control points
  curvePoints: [{x,y}, ...],       // output of buildCurve (~60 * segments points)
  arcLengths: [0, d1, d2, ...],    // output of computeArcLengths
  totalLength: number,
  stepsPerSegment: 60,
  linearSegments: [{x,y}, ...]     // straight-line fallback for linear mode
}
```

### Projectile
```js
{
  active: bool,
  ownerId: 1 | 2,
  x, y,
  pathData: PathData,
  distanceTraveled: number,
  speed: number,
  mode: 'linear' | 'catmull' | 'full',
  damage: 12,
  hitRadius: 18
}
```

### GameState
```js
{
  mode: 'versus' | 'practice' | 'demoLab',
  methodMode: 'linear' | 'catmull' | 'full',
  players: [player1, player2],
  projectiles: [],
  platforms: [...],
  paused: bool,
  winner: null | 1 | 2,
  frameCount: 0
}
```

### DemoState
```js
{
  comparison: 'dash' | 'projectile',
  leftEntity:  { x, y, distanceTraveled, pathData },
  rightEntity: { x, y, distanceTraveled, pathData },
  timer: 0,
  cycleDuration: 3.0
}
```

---

## Implementation Stages (Claude Code workflow)

Because Claude has limited output per session, implement in stages:

| Stage | Task |
|-------|------|
| 0 | Context loading (done) |
| 1 | Architecture confirmation (done) |
| 2 | Full first build: scaffold + numerical methods + arena + physics + abilities + Demo Lab + overlay |
| 3 | Playwright browser testing + bug fixes |
| 4 | Polish: visual clarity, overlay readability, comparison contrast |
| 5 | Phase 2 — Ultimate Spline Rush |
| 6 | Final audit + presentation prep |

**Stage 2 is next.**

---

## What Never To Do

- Use a game engine
- Use external libraries or spline libraries
- Implement online multiplayer
- Make basic walking or jumping spline-based
- Make the numerical method affect only trails or visuals (must affect actual position)
- Hide numerical methods inside vague helper functions
- Remove Demo Lab Mode or side-by-side comparison
- Prioritize sprites or assets before the math demo works
- Add complex combo systems
- Add multiple characters before core demo works
- Create code the student cannot explain
- Implement broken or unfinished Ultimate logic in Stage 2
- Assign any player ability to the R key

---

## MCP Tool Policy

Use MCP tools only when they directly support the task.

**Playwright:** Use after generating a runnable file to test browser behavior.
**Context7:** Use for precise Canvas API, keyboard event, or browser API reference.
**Google Drive:** Use only for user-provided project files if referenced.
**Hugging Face:** Do not use for the core game.

Do not use MCP tools to: expand scope, add multiplayer, add ML features, copy external game code, or replace from-scratch numerical methods.

---

## Academic Presentation Goal

The student should be able to say:

> "On the left, the movement is built without the numerical method, so the motion becomes angular, inconsistent, and less readable. On the right, Catmull-Rom interpolation creates a smooth path, Riemann-sum arc length estimates the path distance, and linear interpolation by distance keeps movement constant-speed. This shows how numerical methods directly improve game feel and fairness."

---

## Final Audit Checklist

Before submitting, verify:

- [ ] Catmull-Rom implemented from scratch
- [ ] Riemann-sum arc length implemented from scratch
- [ ] Linear interpolation reparameterization implemented from scratch
- [ ] Formula comments in code for all three methods
- [ ] Methods affect player special movement (not only visuals)
- [ ] Methods affect projectile trajectories
- [ ] Normal walking and jumping are NOT spline-based
- [ ] Side-by-side Demo Lab comparison is present
- [ ] Left panel clearly shows worse no-method movement
- [ ] Right panel clearly shows better full-method movement
- [ ] Local two-player versus mode works
- [ ] Practice / dummy mode works
- [ ] Educational overlay is readable
- [ ] Asset manifest and fallback rendering are in place
- [ ] Game runs with zero external asset files
- [ ] Collision uses logical hitboxes, not sprite pixels
- [ ] Code is organized into 14 labeled sections
- [ ] Student can explain the demo in under 3 minutes
- [ ] R key is reset only
- [ ] Ultimate Spline Rush slot is reserved but not implemented broken

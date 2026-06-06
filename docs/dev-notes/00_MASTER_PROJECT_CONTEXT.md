# 00_MASTER_PROJECT_CONTEXT.md
# Numerical Arena Fighter — Master Project Context

## 1. Project Mission

Build a single-file browser-based 2D local multiplayer arena fighting game that visibly demonstrates how numerical methods improve game movement, attack trajectories, and player experience.

The project is not just a fighting game. It is a numerical-method demonstration disguised as a fighting game. Every major design choice must make the numerical method easier to see, explain, test, and defend during a live university demo.

## 2. Academic Background

This project is for a Metode Numerik / Numerical Methods course at Universitas Negeri Yogyakarta, S1 Teknologi Informasi.

The original assignment requires:

1. Reviewing numerical-method papers in informatics.
2. Choosing one paper as the project basis.
3. Building a working program that implements the numerical method from the paper.
4. Presenting the project live with a demo.

The chosen paper is:

- Title: *Path Smoothing Techniques in Robot Navigation: State-of-the-Art, Current and Future Challenges*
- Authors: Ravankar et al.
- Journal: Sensors, MDPI
- Year: 2018
- Core connection: Catmull-Rom spline is useful because it provides smooth path generation with good real-time performance.

The game adapts the path-smoothing idea from robot navigation into game movement and combat. Instead of only showing an autonomous robot or tower-defense enemy, the game shows how numerical methods improve player special movement and projectile behavior in a fighting-game context.

## 3. Core Game Concept

Working title:

**Spline Fighter: Method Lab Arena**

Genre:

- 2D local multiplayer arena fighter
- Inspired by platform fighters such as Brawlhalla or Super Smash Bros.
- Not a full clone of any existing game
- Academic demo first, fighting game second

Platform:

- Browser
- Vanilla HTML5 Canvas and JavaScript
- Single `index.html` file
- No game engine
- No build step
- Opens directly in Chrome or any modern browser

Game modes:

1. **Demo Lab Mode**
   - Side-by-side numerical-method comparison.
   - Left side shows the bad version without the method.
   - Right side shows the improved version with the method.

2. **Local Versus Mode**
   - Two players fight on the same keyboard.
   - Both players can use normal movement, basic attacks, and numerical-method special abilities.

3. **Practice Mode**
   - One player versus a dummy or simple bot.
   - Useful as a safe backup during live presentation.

## 4. Priority Order

When requirements conflict, follow this priority order:

1. Numerical-method visibility
2. Correct implementation from scratch
3. Side-by-side comparison clarity
4. Live-demo stability
5. Student explainability
6. Simple playable fighting-game feel
7. Asset-ready architecture
8. Visual polish
9. Extra features

Critical rule:

If a feature makes the game cooler but makes the numerical method harder to see, explain, or defend, reject or postpone that feature.

## 5. Non-Negotiable Numerical Methods

The game must implement the following three methods from scratch. Do not use a library that performs these methods automatically.

### Method 1 — Catmull-Rom Spline Interpolation

Purpose:

- Builds smooth curved paths through waypoints.
- Used for special player movement, curved dash, curved dodge, spline rush, and projectile paths.

Required function:

```js
function catmullRomSegment(P0, P1, P2, P3, t) { ... }
```

Required formula comment in code:

```text
B(t) = 0.5 * [
  2P1
  + (-P0 + P2)t
  + (2P0 - 5P1 + 4P2 - P3)t^2
  + (-P0 + 3P1 - 3P2 + P3)t^3
]
where t is in [0, 1]
```

Additional required function:

```js
function buildCurve(waypoints, stepsPerSegment) { ... }
```

### Method 2 — Numerical Integration Using Riemann-Sum Arc Length

Purpose:

- Approximates the total length of the sampled curve.
- Used to determine distance traveled along a curve.

Required function:

```js
function computeArcLengths(curvePoints) { ... }
```

Required formula comment in code:

```text
L ≈ Σ sqrt((x[i+1] - x[i])^2 + (y[i+1] - y[i])^2)
```

The function must return cumulative arc lengths, not only the final length.

### Method 3 — Linear Interpolation for Arc-Length Reparameterization

Purpose:

- Moves a player or projectile by distance instead of raw parameter `t`.
- Keeps motion visually constant-speed along the curve.

Required function:

```js
function getPositionAtDistance(curvePoints, arcLengths, distance) { ... }
```

Required formula comment in code:

```text
t_local = (d_target - L[i-1]) / (L[i] - L[i-1])
position = (1 - t_local) * point[i-1] + t_local * point[i]
```

The function should locate the two arc-length entries that bracket the target distance, then linearly interpolate between the matching curve points.

## 6. Numerical Method Usage in the Game

The numerical method must affect both:

1. **Player special movement**
2. **Projectile / attack trajectories**

Normal walking and jumping should not use spline motion. They must remain responsive and simple.

Use numerical methods for:

- Spline Dash
- Curved Air Dodge
- Spline Rush / Ultimate
- Curved Projectile / Energy Slash

Do not use numerical methods for:

- Basic walking
- Basic jumping
- Gravity
- Basic collision
- Health logic
- Menu logic

Reason:

Normal movement must feel responsive. Numerical methods should appear during special abilities where smoothness, path shape, and constant speed can be shown clearly.

## 7. Comparison System

The game must clearly show the impact of the numerical method.

It is not enough to merely use the method. The game must show why the game feels worse without it.

Required comparison modes:

### Mode 1 — Without Numerical Method

- Movement follows straight line segments.
- Turns are angular and stiff.
- Speed may look inconsistent.
- Label: `Without Numerical Method`.

### Mode 2 — Catmull-Rom Only

- Movement follows a smooth Catmull-Rom curve.
- Movement may use raw parameter progression.
- Speed can still feel inconsistent.
- Label: `Catmull-Rom Only`.

### Mode 3 — Full Numerical Method

- Movement follows a Catmull-Rom curve.
- Arc length is computed using Riemann-sum approximation.
- Position is found using linear interpolation by target distance.
- Movement appears constant-speed.
- Label: `Full Numerical Method`.

Required demo explanation:

- Linear/no method shows why raw movement feels bad.
- Catmull-Rom shows smoothing.
- Arc-length reparameterization shows why constant speed matters.

## 8. Side-by-Side Demo Lab Mode

Demo Lab Mode is required.

In this mode, the screen should show a direct comparison:

```text
LEFT PANEL: Without Numerical Method
RIGHT PANEL: With Numerical Method
```

When an ability is triggered, both panels should demonstrate the same ability at the same time.

Left panel:

- Linear path or raw movement
- Jagged segments
- Uneven speed
- Label clearly says the method is not being used

Right panel:

- Smooth Catmull-Rom path
- Sampled curve points
- Arc length value
- Constant-speed movement
- Label clearly says the numerical method is active

Optional but recommended:

- Show a ghost path overlay in normal gameplay: red/orange for bad path, blue/green for numerical path.

## 9. Local Multiplayer Scope

Use local same-screen multiplayer only.

Do not implement online multiplayer for the assignment version.

Reason:

Online multiplayer adds networking, latency, server deployment, synchronization, and extra failure risk. The assignment is about numerical methods, not networking.

Suggested controls:

Player 1:

- `A / D` = move left/right
- `W` = jump
- `F` = basic attack
- `G` = spline dash
- `H` = curved projectile
- `T` = ultimate / spline rush

Player 2:

- `ArrowLeft / ArrowRight` = move left/right
- `ArrowUp` = jump
- `K` = basic attack
- `L` = spline dash
- `;` = curved projectile
- `O` = ultimate / spline rush

Global/demo controls:

- `Tab` = toggle Demo Lab / Comparison Mode
- `1` = Linear / Without Method
- `2` = Catmull-Rom Only
- `3` = Full Numerical Method
- `R` = reset match
- `P` = pause

## 10. Required Abilities

### Ability 1 — Spline Dash

The player moves through a generated path toward, around, or past the opponent.

Academic purpose:

- Shows numerical method affecting the player's own movement.
- Demonstrates the difference between straight segmented movement and smooth spline movement.

### Ability 2 — Curved Projectile / Energy Slash

The player fires a projectile or slash that follows a generated path.

Academic purpose:

- Shows numerical method affecting attack trajectory.
- Easy to compare with a non-method linear projectile.

### Ability 3 — Ultimate Spline Rush

The player performs a longer movement sequence around the opponent.

Academic purpose:

- Best showcase of all three methods together.
- Catmull-Rom creates the path.
- Riemann sum estimates curve length.
- Linear interpolation enables constant speed.

## 11. Asset-Ready Rendering Architecture

The first version must use procedural placeholder Canvas graphics.

Do not make final assets before the numerical-method demo is stable.

However, the code must be prepared for future asset integration.

Separate these systems:

1. Game state
2. Numerical methods
3. Movement and ability logic
4. Collision and hitboxes
5. Rendering
6. Asset loading
7. UI and demo overlay

Required rendering functions:

```js
function drawArena(ctx) { ... }
function drawPlayer(ctx, player) { ... }
function drawProjectile(ctx, projectile) { ... }
function drawAbilityTrail(ctx, ability) { ... }
function drawPathDebug(ctx, pathData) { ... }
function drawHitboxDebug(ctx, entity) { ... }
function drawMethodOverlay(ctx) { ... }
```

Asset rule:

- If assets exist, render images or sprites.
- If assets are missing, render placeholder shapes.
- The game must run even with zero external image files.

Suggested asset manifest:

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

Later, asset paths can replace `null` values:

```js
const ASSET_MANIFEST = {
  player1Idle: "assets/player1_idle.png",
  player2Idle: "assets/player2_idle.png",
  projectile: "assets/energy_slash.png",
  arenaBackground: "assets/arena_bg.png",
  platform: "assets/platform.png"
};
```

Important collision rule:

Visual assets must not define gameplay collision.

Use logical hitboxes and hurtboxes:

```js
player.hitbox = { width: 40, height: 70 };
```

Sprite size may differ from hitbox size. Gameplay should depend on logical hitboxes, not image pixels.

## 12. Code Architecture

The final deliverable should be a single `index.html` file.

Recommended internal structure:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Visual styling */
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script>
    // =====================================================
    // 1. CONFIG AND CONSTANTS
    // =====================================================

    // =====================================================
    // 2. ASSET MANIFEST AND LOADER
    // =====================================================

    // =====================================================
    // 3. NUMERICAL METHODS
    // catmullRomSegment
    // buildCurve
    // computeArcLengths
    // getPositionAtDistance
    // =====================================================

    // =====================================================
    // 4. GAME STATE
    // =====================================================

    // =====================================================
    // 5. INPUT HANDLING
    // =====================================================

    // =====================================================
    // 6. PLAYER MOVEMENT AND PHYSICS
    // =====================================================

    // =====================================================
    // 7. ABILITY SYSTEM
    // =====================================================

    // =====================================================
    // 8. PROJECTILES
    // =====================================================

    // =====================================================
    // 9. COLLISION AND HIT DETECTION
    // =====================================================

    // =====================================================
    // 10. COMPARISON / DEMO LAB SYSTEM
    // =====================================================

    // =====================================================
    // 11. UPDATE LOOP
    // =====================================================

    // =====================================================
    // 12. RENDERING
    // =====================================================

    // =====================================================
    // 13. UI AND METHOD OVERLAY
    // =====================================================

    // =====================================================
    // 14. MAIN GAME LOOP
    // =====================================================
  </script>
</body>
</html>
```

## 13. UI and Demo Overlay Requirements

The game must include a visible educational overlay.

It should show:

- Current mode: Linear / Catmull-Rom Only / Full Numerical Method
- Method 1 status: Catmull-Rom active or inactive
- Method 2 status: arc length computed or inactive
- Method 3 status: reparameterization active or inactive
- Total curve length
- Current distance traveled
- Current speed
- Number of sampled points
- Active ability name
- Short explanation of what the viewer is seeing

The overlay should be readable during a live presentation.

## 14. Implementation Phases

Build in this order:

1. Numerical methods only
2. Render generated paths and sampled points
3. Move a dot or player along the path
4. Add standard arena movement
5. Add Spline Dash
6. Add side-by-side comparison mode
7. Add local two-player controls
8. Add hitboxes and health
9. Add curved projectile
10. Add ultimate spline rush
11. Add UI overlay
12. Add asset-ready rendering fallback
13. Polish visuals
14. Final audit

Do not build complex features before the numerical-method demo works.

## 15. Failure Prevention Rules

Do not:

- Use a game engine.
- Use a spline/math library to do the required methods.
- Hide the numerical functions in vague utilities.
- Make the method affect only projectiles.
- Make basic walking or jumping spline-based.
- Implement online multiplayer for the assignment version.
- Add complex combo systems before the demo works.
- Add multiple characters before the core comparison works.
- Prioritize sprites over math clarity.
- Remove or weaken the side-by-side comparison.
- Make a game the student cannot explain.
- Scatter rendering logic inside update logic.
- Make collision depend on sprite pixels.

## 16. Final Deliverable Contract

The final game should be:

- One `index.html` file.
- Runs in browser with no setup.
- Uses vanilla JavaScript and Canvas.
- Has local two-player mode.
- Has practice mode or dummy mode.
- Has Demo Lab side-by-side comparison mode.
- Uses numerical methods for player special movement.
- Uses numerical methods for projectile movement.
- Shows without-method versus with-method impact.
- Includes clear comments and formulas in code.
- Has asset-ready rendering functions.
- Works with placeholders even if no assets are provided.

## 17. Presentation Goal

The student should be able to say:

> On the left, the movement is built without the numerical method, so the motion becomes angular, inconsistent, and less readable. On the right, Catmull-Rom interpolation creates a smooth path, Riemann-sum arc length estimates the path distance, and linear interpolation by distance keeps movement constant-speed. This shows how numerical methods directly improve game feel and fairness.

## 18. Final Audit Checklist

Before accepting the game, verify:

- [ ] Catmull-Rom is implemented from scratch.
- [ ] Riemann-sum arc length is implemented from scratch.
- [ ] Linear interpolation reparameterization is implemented from scratch.
- [ ] The method affects player special movement.
- [ ] The method affects projectiles.
- [ ] Normal walking and jumping remain simple and responsive.
- [ ] Side-by-side comparison is present.
- [ ] The game visibly shows why no-method movement is worse.
- [ ] Local two-player mode works.
- [ ] Practice or dummy mode works.
- [ ] The code is organized and explainable.
- [ ] The method overlay is readable.
- [ ] Asset integration is easy later.
- [ ] The game runs without external assets.
- [ ] The student can explain the demo in under 3 minutes.

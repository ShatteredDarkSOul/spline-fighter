# CURRENT_PROJECT_HANDOFF.md
# Spline Fighter: Method Lab Arena — Session Handoff

Last updated after: **Patch I complete — Full UI Rehaul: CRT Menu + Terminal HUD + Demo Lab Dock**
File size: **3759 lines** (`index.html`)

---

## Patch H Summary

### Bug Fixes

**Fix 1 — Meteor Parry Update Order**
`updateGuard(p1/p2)` now runs **before** `updateMeteors()` in the update loop. A player pressing guard/parry on the same frame as meteor contact now has their parry state registered before the meteor collision is checked.

**Fix 2 — Meteor Explosion Parry Contradiction**
Added `opts` parameter to `applyGuardedHit(target, sourceX, sourceId, hitData, isProj, projRef, opts)`.
- `opts.allowParry: false` disables the perfect-parry branch for that specific call.
- `triggerMeteorExplosion` passes `{ allowParry: false }` — explosion can be guarded/blocked but not reflected.
- `triggerHeavyBurst` area damage also passes `{ allowParry: false }` — burst radius is not perfect-parryable.
- Meteor body contact (`updateMeteors` collision check) remains fully parryable and reflectable as before.

**Fix 3 — Projectile Clash Loop Safety**
In `checkProjClash`, after `triggerProjectileImpact(projs[i], 'clash', null)`, added:
```js
if (!projs[i].active) break;
```
Prevents `projs[i]` (which may have burst via Heavy Shot) from being checked against more projectiles in the same frame.

**Fix 4 — Demo Progress Duration**
Added `getDemoCycleDuration()` helper:
- `'meteor'` → 5.0s
- `'impact'` → 4.5s
- `'powerups'` → 999 (loops internally)
- default → `DS.cycleDuration` (3.0s)

Used consistently in both `updateDemoLab` and the `renderDemoLab` progress bar. Meteor comparison now shows correctly advancing progress bar.

### Demo Lab Improvements

**Improvement 5 — Impact Lab Raw Side**
Left panel now shows the **raw version of each ability**, not just "no effect":
- **Heavy**: dashed straight line path → static star-burst of 6 straight-ray spikes at endpoint → "RAW BURST ✗" label
- **Twin**: dashed straight primary line → two straight-line raw bounce paths with animated ball → "Raw Bounce N" labels
- **Spread**: dashed straight primary line → one straight-line raw bounce path → label

Left panel state now tracked with: `leftPhase: 'primary' | 'rawburst' | 'rawbounce' | 'done'`, `leftBurstTimer`, `leftBouncePaths`, `leftShardEndpoints`, `leftActiveBouncePath`, `leftBounceActiveDist`.

Panel headers renamed: `RAW HEAVY BURST` / `NUMERICAL HEAVY BURST`, `RAW TWIN BOUNCE` / `NUMERICAL TWIN BOUNCE`, `RAW SPREAD BOUNCE` / `NUMERICAL SPREAD BOUNCE`.

**Improvement 6 — Method Pipeline Strip**
New `drawPipelineStrip(c, panX, panY, panW, mode)` helper draws a compact 4-stage strip at the bottom of each panel:
```
Waypoints ✓ → Catmull-Rom ✗ → Arc Length ✗ → Reparameterization ✗
```
Active stages show green ✓, inactive show red ✗. Appears on:
- Dash comparison (left=linear, right=method mode)
- Projectile comparison
- Meteor comparison
- Impact Lab (both panels)

**Improvement 7 — Function Tags on Visuals**
Small annotation labels appear near relevant elements in Demo Lab panels (right/numerical side):
- `buildCurve(P0–P3)` near the curve
- `computeArcLengths()` near sampled-point cluster
- `getPositionAtDistance(d)` near the moving ball
- `rebuildBouncePath()` near bounce path in Impact Lab
- `buildCurve() shard` near shard paths in Heavy burst
- `(no buildCurve)` on the left/raw panel primary path

**Improvement 8 — Demo Lab Mode Guide**
A compact mode bar appears in `renderDemoLab` at y=112–126, below the subtitle:
```
[G] Dash     [H] Projectile     [M] Meteor     [U] Power-Ups     [B] Impact
movement path  attack path       arena hazard   param changes     bounce/burst regen
```
The active mode is highlighted in white; inactive modes are dim. Aids lecturer navigation.

---

## Latest State — After Patch H

### Project Status

- **Name:** Spline Fighter: Method Lab Arena
- **Course:** Metode Numerik, Universitas Negeri Yogyakarta, S1 Teknologi Informasi, Semester 4
- **Deliverable:** Single `index.html` — vanilla JavaScript, HTML5 Canvas, no external libraries, no build step, no game engine
- **Virtual resolution:** 1920×1080 with responsive 16:9 scaling
- **Purpose:** Academic Numerical Methods demo disguised as a 2D arena fighter

Core numerical functions are untouched and must remain untouched:
```js
catmullRomSegment()
buildCurve()
computeArcLengths()
getPositionAtDistance()
```

### Current Implemented Features

- Local Versus mode (2 players, same keyboard)
- VS AI mode (`I` key)
- Practice/Dummy mode (`P` key)
- Demo Lab mode (`TAB`) — side-by-side comparison with 5 modes: Dash / Projectile / Meteor / Power-Ups / Impact
- Method modes 1/2/3 (Linear / Catmull-Rom Only / Full Numerical Method)
- Charge-based spline dash with live preview
- Curved projectile with three shot types (Heavy / Twin / Spread)
- Shot enhancement system (12s active, 6s cooldown)
- Duration-based power-ups (6s each, up to 2 on field)
- Owner-colored projectiles (P1=blue, P2=orange)
- Projectile clash
- Knockback, hit stun, hit sparks, screen shake
- Shield/guard system (`S` / `ArrowDown`)
- Parry window (first 0.18s of guard press)
- Projectile reflection through rebuilt Catmull-Rom spline path
- Meteor parry and reflection through rebuilt spline path
- Stock/fall-death system (3 stocks)
- Double jump
- Bottom HUD (per-player panels with stat mods row)
- Educational overlay (always visible during gameplay)
- Power-Up Showcase with sliders and raw-vs-method comparisons
- Method Storm / Spline Meteor arena hazard (storm levels 1–4)
- Demo Lab Meteor comparison `M` key
- Match timer + storm intensity escalation (Patch F)
- Meteor explosion on impact with expanding blast ring (Patch F, tuned in F.1)
- Permanent stat growth from power-up pickup (Patch F)
- Float text feedback system (Patch F)
- **Heavy Shot grenade burst — explosion + 6 Catmull-Rom shard projectiles** ← new in Patch G
- **Twin Shot 2× bounce via rebuildBouncePath** ← new in Patch G
- **Spread Shot 1× bounce via rebuildBouncePath** ← new in Patch G
- **`triggerProjectileImpact` unified impact handler** ← new in Patch G
- **Impact Ability Lab demo (TAB → B, Q/E cycles shot types)** ← new in Patch G

---

## Patch G Summary

### 1. Projectile Impact Metadata

Every projectile now carries four extra fields (added to `spawnProjectile` → `GS.projectiles`):

```js
canImpact:        true,   // false for shards — prevents recursive burst
bouncesRemaining: 0,      // 2 for twin, 1 for spread, 0 for heavy/normal
isShard:          false,  // true for secondary shard projectiles
generation:       0,      // 1 for shards (reserved for depth tracking)
justBounced:      false,  // guard flag: prevents same-frame re-hit after bounce
```

Default bounce counts set in `tryProjectile`:
| Shot type | `bouncesRemaining` |
|---|---|
| heavy | 0 (bursts at impact, no bounce) |
| twin | 2 |
| spread | 1 |
| normal | 0 |

### 2. Unified Impact Handler

```js
function triggerProjectileImpact(proj, reason, hitPlayerId)
```

`reason` values: `'end'` (path exhausted) | `'playerHit'` (hit opponent) | `'clash'` (hit enemy projectile)

Logic:
- **Heavy (not shard):** calls `triggerHeavyBurst`, then `proj.active = false`
- **Twin/Spread (not shard, bouncesRemaining > 0, reason === 'end'):** calls `rebuildBouncePath`, replaces path, `distanceTraveled = 0`, decrements bounces, sets `justBounced = true`
- **All other cases:** `proj.active = false`

Called from:
- `stepProjectile` — at path end: `triggerProjectileImpact(proj, 'end', null)`
- `checkProjHits` — on non-parried hit: `triggerProjectileImpact(proj, 'playerHit', p.id)`
- `checkProjClash` — replaces both `proj.active = false` calls

### 3. Heavy Shot Grenade Burst

Constants:
```js
HEAVY_IMPACT_RADIUS     = 95    // px — area damage radius
HEAVY_IMPACT_DAMAGE     = 10    // applied to players in blast radius
HEAVY_IMPACT_KNOCKBACK  = 320
HEAVY_IMPACT_STUN       = 0.14
HEAVY_SHARD_COUNT       = 6
HEAVY_SHARD_DAMAGE      = 4
HEAVY_SHARD_RADIUS      = 8
HEAVY_SHARD_SPEED       = 460
HEAVY_SHARD_PATH_LENGTH = 220   // distance from burst center to shard endpoint
```

`triggerHeavyBurst(proj, excludePlayerId)`:
1. Spawns expanding blast ring (`explRing` spark, `maxRadius = HEAVY_IMPACT_RADIUS`)
2. Spawns 14 white/orange particle sparks
3. Triggers screen shake (strength 4, 0.14s)
4. Area damage: all opponents within `HEAVY_IMPACT_RADIUS` get `applyGuardedHit` (excludes `excludePlayerId` — the player who was directly hit, to prevent double damage)
5. Spawns 6 shard projectiles radiating in evenly-spaced angles (±random 0.5 rad jitter) with Catmull-Rom paths of length ~220px, `shotType:'spread'`, `isShard:true`, `canImpact:false`

When called from `checkProjHits` (`'playerHit'`): direct hit already applied via `applyGuardedHit` with `HIT_DATA.heavy` (18 dmg); burst area damage skips that player via `excludePlayerId`.
When called from `stepProjectile` (`'end'`): no exclusion — burst damages any player in radius.
When two heavy shots clash (`'clash'`): both burst.

### 4. Bounce Paths (Twin / Spread)

```js
function rebuildBouncePath(proj)
```

- Finds the opponent (player whose id ≠ `proj.ownerId`)
- Builds a fresh `makeProjectilePath(proj.x, proj.y, opp_cx, opp_cy, facing, arcH, STEPS_PER_SEG)` where `arcH = 70–160 px` (random each bounce)
- Returns the new `PathData` or `null` if no opponent found

After bounce: `proj.pathData = newPath`, `proj.distanceTraveled = 0`, `proj.bouncesRemaining--`, `proj.justBounced = true`.

`justBounced` is checked at the top of `checkProjHits` — if true, skip the hit check and clear the flag. This prevents the projectile from immediately re-hitting the player it just bounced off.

`spawnBounceSpark(x, y)`: 8 small sparks at the bounce point.

### 5. Impact Ability Lab (Demo Lab — B key)

New Demo Lab comparison mode `'impact'`. Key: `B`. Accessed while in Demo Lab (`TAB`).

Q/E cycles the showcased shot type: `heavy → twin → spread → heavy …`

State object: `DS.impactShowcase`
```js
{
  type: 'heavy' | 'twin' | 'spread',
  leftDist: 0, leftDone: false,       // left panel: linear ball animation
  rightDist: 0, rightPhase: 'primary',// right panel: Catmull-Rom ball + impact phase
  burstTimer: 0,                       // counts down during heavy burst phase (1.8s)
  leftPath,                            // linear PathData (used in 'linear' mode)
  rightPrimary,                        // full Catmull-Rom primary path
  bouncePaths: [],                     // pre-built bounce paths (twin: 2, spread: 1)
  shardPaths:  [],                     // pre-built shard paths (heavy: 6)
  rightActiveBouncePath: 0,
  rightBounceActiveDist: 0,
}
```

Right panel phases:
- `'primary'` → ball moves along Catmull-Rom path at 460 px/s
- `'burst'` (heavy only) → shows expanding blast ring + 6 shard path lines, 1.8s timer
- `'bounce'` (twin/spread) → ball continues along pre-built bounce paths
- `'done'` → auto-restarts after 4.5s total timer

Left panel: ball moves linearly at 460 px/s with no impact effect (disappears, shows "✕ No Impact Effect").

`updateImpactShowcase(dt)`: advances animation state, triggers auto-restart.
`renderImpactShowcase(c)`: full-screen two-panel rendering. Shows path + waypoints + sampled points + method stat lines per panel. Routes through `renderDemoLab` check before standard panel rendering.

---

## Patch F.1 Summary (Meteor Intensity Balance — applied before Patch G)

Updated explosion constants:
```js
METEOR_EXPLOSION_RADIUS    = 170   // was 120
METEOR_EXPLOSION_DAMAGE    = 16    // was 14
METEOR_EXPLOSION_KNOCKBACK = 500   // was 420
METEOR_EXPLOSION_STUN      = 0.22  // was 0.18
```

Updated storm level configs:
| Level | Interval | maxActive |
|---|---|---|
| 1 (0–45s) | 12–15s | 1 |
| 2 (45–90s) | 8–11s | 2 |
| 3 (90–135s) | 5.5–8s | 3 |
| 4 (135s+) | 3.8–5.5s | 4 |

Other F.1 changes:
- 24 meteor sparks on explosion (was 16)
- Stronger screen shake: strength 7.5, 0.25s (was 6, 0.22s)
- Anti-repetition variant tracking in `makeMeteorPath` via `_lastMeteorVariant`
- Overlay arena event line: `Meteors: N/M  Next: Xs` (was `Storm in: Xs`)

---

## Patch F Summary (reference)

- `GS.matchTime` (float, seconds) increments in versus/vsai/practice, shown as `Time: M:SS` in overlay
- Storm intensity levels 1–4 computed by `getStormLevel()` from `GS.matchTime`
- Meteor spawning governed by `getMeteorSpawnConfig()` returning `{ intervalMin, intervalMax, maxActive }`
- `triggerMeteorExplosion(cx, cy, excludeOwnerId)` — expanding ring + sparks + area damage
- `player.statMods` — permanent stat multipliers accumulated from power-up pickups (no cap; survive respawn, reset on `R`)
- Float text system: `GS.floatTexts`, `updateFloatTexts(dt)`, `drawFloatTexts(c)`

---

## Numerical Methods (Section 3)

All four functions implemented from scratch. Fixed names — do not rename.

### `catmullRomSegment(P0, P1, P2, P3, t)`
```
B(t) = 0.5 * [2P1 + (-P0+P2)t + (2P0-5P1+4P2-P3)t² + (-P0+3P1-3P2+P3)t³]
```

### `buildCurve(waypoints, stepsPerSegment)`
Chains Catmull-Rom segments with phantom endpoint duplication.

### `computeArcLengths(curvePoints)`
```
L ≈ Σ sqrt((x[i+1]-x[i])² + (y[i+1]-y[i])²)
```
Returns cumulative array `[0, d1, d2, ...]`.

### `getPositionAtDistance(curvePoints, arcLengths, distance)`
```
t_local = (d_target - L[i-1]) / (L[i] - L[i-1])
position = (1 - t_local)*point[i-1] + t_local*point[i]
```

---

## Patch History

| Patch | Summary | Lines |
|---|---|---|
| A | Demo Lab Power-Up Slider Showcase | ~1985 |
| B | Combat Feel Polish | ~2120 |
| C | Duration Power-Ups + Projectile Clarity | ~2240 |
| D | Shield + Parry + Projectile Reflection | ~2363 |
| E | Method Storm / Spline Meteor + HUD Fix | 2586 |
| F | Match Timer + Storm Escalation + Stat Growth | 2726 |
| F.1 | Meteor Intensity Balance | 2750 |
| G | Projectile Impact Abilities + Impact Ability Lab | 3080 |
| H | Stability + Demo Lab Explanation Polish | 3327 |
| H.1 | Demo Lab Readability Cleanup | 3351 |
| I   | Full UI Rehaul: CRT Menu + Terminal HUD + Demo Lab Dock | **3759** |

---

## Controls

### Player 1
```
A / D            = move left / right
W                = jump (up to 2 jumps)
F                = basic attack
G (hold/release) = charge dash
H                = curved projectile (uses active shot mode when enhanced)
C                = cycle shot mode (Heavy → Twin → Spread)
V                = activate shot enhancement (12s active, 6s cooldown)
S                = guard (hold) — parry in first 0.18s
```

### Player 2
```
Left / Right     = move
Up               = jump
K                = basic attack
L (hold/release) = charge dash
;                = curved projectile
N                = cycle shot mode
M                = activate shot enhancement
ArrowDown        = guard (hold) — parry in first 0.18s
```

### Global
```
1             = Linear / No Method mode
2             = Catmull-Rom Only mode
3             = Full Numerical Method mode
TAB           = Toggle Demo Lab
P             = Toggle Practice/Dummy mode
I             = VS AI mode
R             = Reset match (reset only — never assign to ability)
\             = Toggle hitbox debug
Space         = Restart Demo Lab comparison (Demo Lab only)
```

### Demo Lab
```
G             = Spline Dash comparison
H             = Curved Projectile comparison
M             = Meteor comparison
U             = Power-Up Showcase
B             = Impact Ability Lab (NEW — Patch G)
Q / E         = Previous / Next module (in Power-Up or Impact Lab)
← / →        = Adjust slider (in Power-Up Showcase only)
Space         = Restart current demo
TAB           = Exit Demo Lab
```

---

## Key Constants (Section 1)

```js
DESIGN_WIDTH = 1920, DESIGN_HEIGHT = 1080
GRAVITY = 1300, JUMP_SPEED = -620, MOVE_SPEED = 300
STEPS_PER_SEG = 60, STEPS_PER_SEG_BOOSTED = 100

CD_MAX = { dash:1.5, projectile:0.55, rush:0 }
POWERUP_DURATION = 6.0, MAX_FIELD_POWERUPS = 2

SHIELD_MAX = 100, SHIELD_DRAIN_PER_SEC = 30, SHIELD_REGEN_PER_SEC = 20
PARRY_WINDOW = 0.18, GUARD_BREAK_STUN = 0.70

METEOR_WARNING_TIME = 1.5, METEOR_SPEED = 760, METEOR_RADIUS = 28
METEOR_EXPLOSION_RADIUS = 170, METEOR_EXPLOSION_DAMAGE = 16
METEOR_EXPLOSION_KNOCKBACK = 500, METEOR_EXPLOSION_STUN = 0.22
STORM_L2_TIME = 45, STORM_L3_TIME = 90, STORM_L4_TIME = 135

HEAVY_IMPACT_RADIUS = 95,  HEAVY_IMPACT_DAMAGE = 10
HEAVY_IMPACT_KNOCKBACK = 320, HEAVY_IMPACT_STUN = 0.14
HEAVY_SHARD_COUNT = 6, HEAVY_SHARD_DAMAGE = 4
HEAVY_SHARD_RADIUS = 8, HEAVY_SHARD_SPEED = 460
HEAVY_SHARD_PATH_LENGTH = 220

HIT_DATA.attack:  { damage:8,  knockbackX:260, knockbackY:-120, stun:0.12 }
HIT_DATA.dash:    { damage:18, knockbackX:520, knockbackY:-220, stun:0.25 }
HIT_DATA.heavy:   { damage:18, knockbackX:460, knockbackY:-180, stun:0.25 }
HIT_DATA.twin:    { damage:9,  knockbackX:230, knockbackY:-100, stun:0.12 }
HIT_DATA.spread:  { damage:6,  knockbackX:180, knockbackY:-80,  stun:0.10 }
HIT_DATA.meteor:  { damage:22, knockbackX:560, knockbackY:-260, stun:0.28 }
```

---

## Code Section Map (index.html — 3080 lines)

```
1.    CONFIG AND CONSTANTS         ← all constants incl. HEAVY_IMPACT_*, HEAVY_SHARD_*
2.    ASSET MANIFEST AND LOADER
3.    NUMERICAL METHODS            ← catmullRomSegment, buildCurve, computeArcLengths, getPositionAtDistance
4.    GAME STATE                   ← makePlayer (statMods), initGameState (matchTime, stormLevel, floatTexts, impactShowcase)
5.    INPUT SYSTEM                 ← B key, G/H/M/U/B demo modes, Q/E for powerup+impact labs
6.    ARENA AND PHYSICS
7.    ABILITY PATH GENERATION      ← makeDashPathDir, makeProjectilePath, makeMeteorPath (anti-repeat), posOnPath
8.    ABILITY SYSTEM               ← executeDash, tryProjectile (bouncesRemaining), spawnProjectile (metadata fields)
                                      rebuildBouncePath, spawnBounceSpark, triggerHeavyBurst, triggerProjectileImpact
                                      stepAbility, stepProjectile (calls triggerProjectileImpact at end)
8b.   VS AI SYSTEM
8c.   POWER-UP SYSTEM              ← applyPowerUp (permanent stat boost + float text)
9.    COMPARISON / DEMO LAB        ← restartDemo (impact case), updateImpactShowcase, updateDemoLab, stepDemoEnt
10.   COLLISION AND HIT DETECTION  ← checkProjHits (justBounced guard, triggerProjectileImpact)
                                      checkProjClash (triggerProjectileImpact for both sides)
10b.  SHIELD AND PARRY SYSTEM      ← updateGuard (shieldRegenMult)
10c.  METEOR / METHOD STORM        ← getStormLevel, getMeteorSpawnConfig, triggerMeteorExplosion, updateFloatTexts,
                                      spawnMeteor, reflectMeteor, updateMeteors
11.   UPDATE LOOP                  ← matchTime, stormLevel tracking, updateFloatTexts
12.   RENDERING SYSTEM             ← drawHitSparks (explRing, meteor), drawPlayerHUD (stat row)
                                      drawFloatTexts, renderGame, Power-Up Showcase helpers
                                      renderImpactShowcase (new — Patch G), renderDemoLab (routes to impact)
13.   EDUCATIONAL UI OVERLAY       ← renderOverlay (ph=640, stat mods, time/storm, controls with B:Impact)
14.   MAIN GAME LOOP
```

---

## Known Limitations / Future Work

- AI has no meteor awareness or impact ability awareness (acceptable for demo)
- Meteors do not clash with projectiles
- Meteor passes through platforms (path ignores platform geometry)
- Heavy shard projectiles can hit the owner if the arc wraps back (intentional grenade scatter)
- Bounce path rebuilds toward current opponent position — if opponent moves the path is already fixed
- Permanent stat mods have no hard cap (by design) — very long matches accumulate significantly
- Stats display in HUD shows max 3 of 5 possible mods; rest visible in overlay
- All visuals use placeholder Canvas shapes — no sprite assets yet
- Ultimate Spline Rush slot is reserved but not implemented (`cooldowns.rush`, `'rush'` type in comments)

---

## Strict Rules For Future Sessions

- Do not rewrite `index.html` from scratch. Patch the existing file.
- Keep one single `index.html`. No external files, no libraries, no game engine.
- Do not rename the four required numerical method functions.
- Do not replace from-scratch numerical methods with library calls.
- Do not alter `catmullRomSegment`, `buildCurve`, `computeArcLengths`, or `getPositionAtDistance`.
- Do not remove Demo Lab, power-up showcase, meteor comparison, impact lab, or any existing comparison mode.
- Do not remove Method Storm hazard, shield/parry system, or projectile/meteor reflection.
- Do not remove float text system, stat mods, or impact system from their respective player/projectile structures.
- Do not add a hard cap to permanent stat growth unless explicitly requested.
- Do not implement Ultimate Spline Rush — the `rush` slot is reserved but intentionally empty.
- Do not implement online multiplayer.
- Do not assign any player ability to the `R` key. `R` is reset only.
- Do not reassign `S` or `ArrowDown` — they are guard keys.
- `applyGuardedHit` must be called for all damage sources (including meteor explosion and heavy burst area damage).
- Meteor explosion (`triggerMeteorExplosion`) is not parryable by design.
- Heavy burst area damage (`triggerHeavyBurst`) is not parryable by design.
- `statMods` must survive respawn but reset on `R`.
- `bouncesRemaining` is per-projectile, reset on next `tryProjectile` call — not per-player.
- Storm level logic must use `GS.matchTime` — do not tie it to frameCount or wall clock.
- Demo Lab (impact lab included) must not be affected by match timer or storm escalation.
- `justBounced` flag must remain on every projectile — removing it causes same-frame double-hit on bounce.

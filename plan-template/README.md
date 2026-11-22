# Training Plan Template (for Claude Code)

A working, adaptive training-plan app with built-in 3D exercise demos and an MP4 clip renderer. It was first built for one person's back-safe, no-equipment calisthenics plan. **Everything in `plan-data.js`, the day layout, and the safety text in `app.js` is an example. Rebuild it from the new person's interview and research — never reuse the example plan as-is.**

## Files

| File | What it is | Change it? |
|---|---|---|
| `plan-data.js` | The plan: ladders (progressions per movement pattern), each exercise's sets/reps/tempo/rest/cues/feel/avoid/unlock rule, tendon/mobility/reaction lists, training days, swap map (`ALT`), breathing (`breathFor`), rest table, variations | **Rewrite** for the person |
| `demos.js` | Keyframe animations for each exercise's 3D demo (one full rep) | **Add/edit** a demo for every exercise in the new plan |
| `demo-notes.js` | SETUP lines + FEEL line per demo (on-screen labelled captions) | **Write** for every demo |
| `demo-engine.js` | three.js engine: smooth skinned fighter figure (SDF + surface nets), leg IK with toe-out + knee-over-toe pole, floor contact solver, props (wall, table, door), stage, captions | Extend only if needed (e.g. new props like dumbbells) |
| `app.js` | The app: Today (swipe cards), week calendar, logging, feedback rules, next-morning check, What Works, Log, How To, Me | Adapt text/safety rules to the person; keep the logic |
| `shell.html` | Page shell + styles (teal/black theme) | Title, colours if the person wants |
| `build.py` | Inlines everything into one `index.html` | No |
| `clip-render/` | Headless renderer: each demo → MP4 with timed SETUP/FORM/FEEL/AVOID captions, plus a gallery page | Paths only |

## How the app adapts (keep these rules)
Pain first (0–3 progress, 4–5 hold, 6+ step down/swap), then form, then reps + rating. Level up after top-of-range on every set for 2 sessions with good ratings/clean form/low pain. Step down when missed badly or form broke. Next-morning check applies the same traffic light. Stall and reactive-deload warnings. Auto-swap (`ALT` map) when a move gives red pain or is "couldn't do it / too hard" twice in a row; restorable in Me. Every change writes a plain "what changed and why" message.

## Saving data
In a claude.ai artifact the app uses the `db` capability (publish with `capabilities: {db: {rules: [{path: "", read: "admin", write: "owner"}]}, user: {}}`). Seed the profile and starting levels through the artifact database tool after the first publish (collections: `plan/profile`, `ladders/<key>` with `{step}`, `logs`, `changes`, `checks`, `fit`, `body`). Anywhere else it falls back to localStorage on that device.

## Build
```
python3 build.py          # writes index.html
```
Load three.js r128 from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (already in shell.html).

## Demos — how to write one (demos.js)
Each demo is a list of keyframes: `d` = seconds to move into it, hold = `h` (standing demos) or `hh` (floor demos), `c` = caption, `w: 1` = show as the mistake (red AVOID).
- **Standing (`m` omitted):** set pelvis `py` (height), `pz` (fore/aft), `pit` (torso lean, degrees), feet `x`/`z` (ankle positions, metres), `o` (toe-out degrees), `f` (heel raise), arms `s` (shoulder flex), `a` (abduction), `e` (elbow). Legs are solved by IK; knees track over the toes.
- **Floor (`m: 'F'`):** set joint angles directly (`h` hip flex, `k` knee, `s`, `a`, `e`, `sp` spine) and a contact solver `sol: {a:'handL', b:['kneeR','toeL'], p:'pit', lo, hi}` that tilts the body until both contacts touch the floor.
- Use `L`/`R` suffixes for one side (e.g. `sR`). Check every demo from front and side (`cam: [azimuthDeg, elevationDeg, distance, targetY]`) before shipping — stance width, toe angle, depth, trunk angle (bodyweight squat: torso ≈ parallel to shins), and contacts must be accurate.
- New equipment (dumbbells, bars, bands) needs props in `demo-engine.js` (`buildProps`), e.g. a dumbbell mesh parented to the hand bones.

## Render MP4 clips (optional)
Needs Node, Playwright + Chromium, ffmpeg, and `three.min.js` (npm `three@0.128.0`, copy `build/three.min.js` into `clip-render/`).
```
cd clip-render
node render.js out demoKey:file-slug demoKey2:slug2 ...   # one MP4 per demo, captions burned in
node gallery.js                                            # gallery page (edit its folder names first)
```
Rendering is CPU-heavy (≈1 min per clip with software WebGL); run 3 workers in parallel.

## Honest limits to tell the person
The figure is a real-time 3D render, not photorealistic or AI-generated video. Demos are only as accurate as the keyframes — check them. This is general fitness information, not medical advice.

/* Plan content: ladders, exercises, days, rest times. Short words on purpose. */
(function () {
  const REST = {
    str: { reps: 'No rest — reset breath + form (1–3 sec)', sets: '90 sec (2 min after hardest set)', next: '60 sec' },
    legs: { reps: 'No rest — reset breath + form (1–3 sec)', sets: '90 sec (2 min after hardest set)', next: '2 min (after squats or lunges)' },
    gen: { reps: 'No rest — reset breath + form (1–3 sec)', sets: '90 sec', next: '60 sec' },
    core: { reps: 'Breathe between holds (1–3 sec)', sets: '30 sec', next: '60 sec' },
    hinge: { reps: 'No rest — reset breath + form (1–3 sec)', sets: '90 sec', next: '60 sec' },
    pow: { reps: 'Reset each rep (1–3 sec) · clusters: 20 sec', sets: '2–3 min', next: '60 sec' },
    powSquat: { reps: '10 sec between reps', sets: '2–3 min', next: '2 min (after squats or lunges)' },
    powLunge: { reps: 'Reset each rep (1–3 sec)', sets: '2–3 min', next: '2 min (after squats or lunges)' },
    tHold: { reps: 'One hold per set', sets: '2 min after a 45-sec hold', next: '60 sec' },
    tSlow: { reps: 'One hold per set', sets: '90 sec', next: '60 sec' },
    tPlank: { reps: 'Breathe between 10-sec holds', sets: '90 sec', next: '60 sec' },
    mob: { reps: 'Flow — no rest', sets: 'Move straight on (0–30 sec)', next: 'Straight on' },
    react: { reps: 'Reset to the middle', sets: '60 sec (estimate — no trial sets this)', next: '60 sec' },
    combo: { reps: 'Reset between combos', sets: '1 min between rounds', next: '60 sec' },
  };
  const UNLOCK_RULE = 'Top of the range on every set, 2 sessions in a row, “just right” or “too easy”, clean form, green pain';

  const LADDERS = {
    push: {
      name: 'Push', short: 'PUSH', note: 'Load order (Ebben 2011, % bodyweight in hands): wall → high counter (~41%) → knee push-up (~49%) → low incline (~55%) → floor negatives → floor (~64%). A low incline is harder than a knee push-up.',
      steps: [
        { id: 'push0', name: 'Wall Push-Up', demo: 'wallPush', sets: 3, reps: [10, 20], unit: 'reps', tempo: '2 sec down · 1 sec up', rest: REST.str,
          cues: ['Hands on the wall, shoulder height', 'Body in one straight line', 'Chest to wall, push away'], feel: 'Chest + back of arms. Low back quiet.', wrong: 'Hips sagging toward the wall.', unlock: '3×20 clean, pain ≤2/5, 2 sessions in a row' },
        { id: 'push1', name: 'Knee Push-Up', demo: 'kneePush', sets: 3, reps: [8, 15], unit: 'reps', tempo: '2 sec down · 1 sec up', rest: REST.str,
          cues: ['Hands under shoulders', 'Straight line knees → head (neutral spine)', 'Elbows ~45°, chest to a fist above the mat'], feel: 'Chest, shoulders, triceps.', wrong: 'Hips sag or elbows flare straight out.', unlock: '3×15 clean, 2 sessions in a row' },
        { id: 'push2', name: 'Negative Push-Up', demo: 'negPush', sets: 4, reps: [3, 5], unit: 'reps', tempo: '3–5 sec lowering only', rest: REST.str,
          cues: ['Start at the top of a full push-up', 'Lower slow — count it out', 'Knees down to get back up (only the lowering counts)'], feel: 'Chest + triceps working hard on the way down.', wrong: 'Dropping fast at the end, or hips sagging.', unlock: '4×5 at a true 5-second lower' },
        { id: 'push3', name: 'Full Push-Up', demo: 'fullPush', sets: 3, setsLabel: '3–4', reps: [5, 15], unit: 'reps', tempo: '2 sec down · 1 sec up', rest: REST.str,
          cues: ['Hands under shoulders', 'Glutes tight — one line', 'Chest to a fist above the mat'], feel: 'At 220 lbs a full push-up moves about 145 lbs through your hands.', wrong: 'Hips sag, head pokes forward.', unlock: '3×15' },
        { id: 'push4', name: 'Close-Grip Push-Up (knees → full)', demo: 'closePush', sets: 3, setsLabel: '3–4', reps: [5, 12], unit: 'reps', tempo: '2 sec down · 1 sec up', rest: REST.str,
          cues: ['Hands under the chest', 'Elbows brush the ribs', 'Knees first, then full'], feel: 'Back of the arms (triceps).', wrong: 'Elbows flaring out.', unlock: '3×12 full' },
        { id: 'push5', name: 'Pike Push-Up', demo: 'pikePush', sets: 4, reps: [5, 10], unit: 'reps', tempo: '2 sec down · 1 sec up', rest: REST.str, gate: 'Only after about 10 clean floor push-ups.',
          cues: ['Hips high — upside-down V', 'Head travels in front of the hands', 'Press straight back up'], feel: 'Shoulders.', wrong: 'Hips dropping into a push-up.', unlock: 'Ongoing — keep adding reps' },
      ],
    },
    pull: {
      name: 'Pull', short: 'PULL', note: 'Prone work is shoulder-blade accessory work, not a main pull. If no table is safe: doorway pulls (hold both sides of a door frame, lean back straight, pull hard, hold 10–20 sec, 4–5 times) plus prone rows. With no row, band or bar, your back will get stronger slower than your chest. Best upgrade path: sturdy table row → resistance band → doorway pull-up bar.',
      steps: [
        { id: 'pull0', name: 'Prone Y-T-W Raises (Floor Angels)', demo: 'proneYTW', sets: 3, reps: [6, 10], unit: 'reps', perLabel: 'each letter', tempo: 'Slow · hold 2 sec at the top', rest: REST.gen,
          cues: ['Small lift, forehead light', 'Thumbs up, squeeze shoulder blades', 'Low back quiet — never arch to go higher'], feel: 'Between + below the shoulder blades.', wrong: 'Arching the low back to lift higher.', unlock: UNLOCK_RULE },
        { id: 'pull1', name: 'Back Widow Row', demo: 'backWidow', sets: 3, reps: [8, 15], unit: 'reps', tempo: '1 sec up · hold · 2 sec down', rest: REST.gen,
          cues: ['On your back, elbows bent by your sides', 'Drive elbows into the mat', 'Chest lifts — squeeze shoulder blades'], feel: 'Upper back, not low back.', wrong: 'Pushing with the low back or neck.', unlock: UNLOCK_RULE },
        { id: 'pull2', name: 'Prone Floor Row + Hold', demo: 'proneRowHold', sets: 3, reps: [8, 12], unit: 'reps', perLabel: '+ 10-sec hold', tempo: '1 sec pull · 2 sec reach', rest: REST.gen,
          cues: ['Arms long in front', 'Pull elbows to ribs', 'Last rep: hold 10 sec'], feel: 'Mid back.', wrong: 'Lifting the chest by arching.', unlock: UNLOCK_RULE },
        { id: 'pull3', name: 'Table Row (sturdy table only)', demo: 'tableRow', sets: 3, reps: [6, 12], unit: 'reps', tempo: 'Pull 2 sec · lower 2 sec', rest: REST.str,
          cues: ['Test the table first, every time', 'Body straight knees → head', 'Pull chest to the edge'], feel: 'Lats + upper back + biceps. A real pull.', wrong: 'Using a table that tips, slides, creaks or wobbles. A light folding table is a tip hazard, not a pull station.', unlock: UNLOCK_RULE, extra: 'Knees bent = easier. Legs straight = harder.' },
        { id: 'pull4', name: 'Prone Row — Long Squeeze Holds', demo: 'proneLongSqueeze', sets: 3, reps: [6, 10], unit: 'reps', perLabel: '5-sec holds', tempo: 'Pull · hold 5 sec · reach', rest: REST.gen,
          cues: ['Arms long', 'Row to ribs', 'Hold 5 sec every rep'], feel: 'Shoulder blades squeezing.', wrong: 'Shrugging toward the ears.', unlock: UNLOCK_RULE },
        { id: 'pull5', name: 'Prone Pull — Arms Long, Pull to Ribs', demo: 'pronePullRibs', sets: 3, setsLabel: '3–4', reps: [6, 10], unit: 'reps', perLabel: 'hold 2 sec', tempo: 'Pull · hold 2 sec · reach', rest: REST.gen,
          cues: ['Reach long overhead', 'Pull elbows down to ribs', 'Hold 2 sec'], feel: 'Lats + mid back.', wrong: 'Arching the low back.', unlock: UNLOCK_RULE },
        { id: 'pull6', name: 'Advanced Prone Row — Lift, Row, Hold', demo: 'advProneRow', sets: 4, reps: [5, 8], unit: 'reps', perLabel: '5-sec holds', tempo: 'Lift · row · hold 5 sec', rest: REST.gen,
          cues: ['Lift arms off the mat', 'Row to ribs', 'Hold 5 sec, reach out still lifted'], feel: 'Whole upper back.', wrong: 'Low back takes over.', unlock: 'Top of the home pull ladder' },
      ],
    },
    legs: {
      name: 'Legs', short: 'LEGS', note: 'Reverse lunges and static split squats come first. Forward lunges load the kneecap harder and faster — only months later, once reverse lunges and split squats are pain-free and controlled. Once two-leg work passes ~15 reps, single-leg work beats more two-leg reps.',
      steps: [
        { id: 'legs0', name: 'Partial Squat, Halfway Down', demo: 'partialSquat', sets: 3, reps: [10, 15], unit: 'reps', tempo: '2 sec down · stand', rest: REST.legs,
          cues: ['Feet shoulder-width', 'Hips back, halfway down', 'Stand through the whole foot'], feel: 'Thighs + glutes.', wrong: 'Knees caving in, heels lifting.', unlock: UNLOCK_RULE },
        { id: 'legs1', name: 'Bodyweight Squat to Flat-Back Depth', demo: 'bwSquat', sets: 3, reps: [8, 15], unit: 'reps', tempo: '3 sec down · pause · stand', rest: REST.legs,
          cues: ['Hips back, chest proud', 'Stop where your back would round', 'That point is your depth'], feel: 'Thighs + glutes. Back stays flat.', wrong: 'Low back rounding at the bottom.', unlock: UNLOCK_RULE },
        { id: 'legs2', name: 'Slow Tempo Squat', demo: 'tempoSquat', sets: 3, reps: [8, 12], unit: 'reps', tempo: '3 sec down · 1 sec pause · 1 sec up', rest: REST.legs,
          cues: ['3 sec down', '1 sec pause at your depth', '1 sec up'], feel: 'Thighs burning — control.', wrong: 'Bouncing out of the bottom.', unlock: UNLOCK_RULE },
        { id: 'legs3', name: 'Split Squat on the Mat', demo: 'splitSquat', sets: 3, reps: [6, 12], unit: 'reps/leg', tempo: '2 sec down · 1 sec up', rest: REST.legs,
          cues: ['Feet hip-width like train tracks (not a tightrope)', 'Straight down, torso tall', 'Fingertip on the wall is fine at first'], feel: 'Front thigh + glute.', wrong: 'Sliding forward, chest dropping.', unlock: UNLOCK_RULE },
        { id: 'legs4', name: 'Reverse Lunge on the Mat', demo: 'reverseLunge', sets: 3, reps: [6, 12], unit: 'reps/leg', tempo: '2 sec down · 1 sec up', rest: REST.legs,
          cues: ['Step BACK, not forward', 'Front shin stays upright', 'Drive up through the front foot'], feel: 'Front glute + thigh.', wrong: 'Stepping forward (loads the kneecap harder).', unlock: UNLOCK_RULE },
        { id: 'legs5', name: 'Skater Squat Progression', demo: 'skaterSquat', sets: 4, reps: [5, 8], unit: 'reps/leg', tempo: '3 sec down · 1 sec up', rest: REST.legs,
          cues: ['Balance on one leg', 'Sit back 3 sec, back knee toward the floor', 'Light touch — stand'], feel: 'Single-leg strength, glute + thigh.', wrong: 'Front knee caving in.', unlock: 'Top of the home leg ladder' },
      ],
    },
    core: {
      name: 'Hinge & Glute', short: 'GLUTE', note: 'Glute and hamstring strength, loaded without bending the spine. Bridges are the safest way to load hip extension on a mat. Once two legs is easy, one leg roughly doubles the load (single-leg bridges show high glute activity in EMG studies). The Big 3 core block runs every session alongside this ladder, so core work never replaces glute work.',
      steps: [
        { id: 'core0', name: 'Glute Bridge + Hold', demo: 'gluteBridge', sets: 3, reps: [10, 15], unit: 'reps', perLabel: '2-sec squeeze + 30-sec hold to finish', tempo: '1 sec up · 2 sec squeeze · 2 sec down', rest: REST.hinge,
          cues: ['Feet flat, knees bent', 'Squeeze glutes, hips up', 'Ribs down — no arching'], feel: 'Glutes + hamstrings, NOT low back.', wrong: 'Over-arching at the top.', unlock: UNLOCK_RULE },
        { id: 'glute1', name: 'Single-Leg Bridge — Kickstand', demo: 'kickstandBridge', sets: 3, reps: [6, 10], unit: 'reps/side', perLabel: '2-sec squeeze', tempo: '1 sec up · 2 sec squeeze · 2 sec down', rest: REST.hinge,
          cues: ['Working foot flat under the knee', 'Other heel lightly on the floor — just for balance', 'Hips up level, ribs down'], feel: 'Mostly the working-side glute.', wrong: 'Hips tilting, or pushing through the helper foot.', unlock: 'Top of the range on every set, 2 sessions in a row, “just right” or “too easy”, clean form, green pain' },
        { id: 'glute2', name: 'Single-Leg Bridge', demo: 'singleLegBridge', sets: 3, reps: [6, 12], unit: 'reps/side', perLabel: '2-sec hold at top', tempo: '1 sec up · 2 sec hold · 2 sec down', rest: REST.hinge,
          cues: ['Other knee pulled up (or leg straight)', 'Drive through the heel, hips level', 'No arching at the top'], feel: 'Glute + hamstring, one side.', wrong: 'Hip on the free side dropping.', unlock: 'Top of the range on every set, 2 sessions in a row, “just right” or “too easy”, clean form, green pain' },
        { id: 'glute3', name: 'Single-Leg Bridge — Slow Lower + Hold', demo: 'singleLegBridge', sets: 3, reps: [6, 10], unit: 'reps/side', perLabel: '3-sec lower + 20-sec hold on the last rep', tempo: '1 sec up · 3 sec down', rest: REST.hinge,
          cues: ['Same as single-leg bridge', 'Lower over 3 seconds', 'Last rep: hold 20 sec at the top'], feel: 'Deep glute burn. Pain-free low back.', wrong: 'Low back takes over.', unlock: 'Top of the home glute ladder' },
      ],
    },
    power: {
      name: 'Power', short: 'POWER', note: 'Done first in the session, right after the warm-up, while your legs are fresh. Fast up, slow down. 4–6 reps only. Feet stay on the ground — no jumping, hopping, burpees or sprinting yet. Perfect form or the rep doesn’t count. Power stops when speed stops. Fast-intent training improves how fast you produce force.',
      steps: [
        { id: 'pow0', name: 'Fast Squat — Down Slow, Stand Explosive', demo: 'fastSquat', sets: 3, reps: [5, 5], unit: 'reps', tempo: 'Down 3 sec · stand fast', rest: REST.powSquat,
          cues: ['Down slow, 3 sec', 'Stand up as fast as you can', 'Feet stay on the floor'], feel: 'Snap through the hips.', wrong: 'Jumping off the floor.', unlock: UNLOCK_RULE },
        { id: 'pow1', name: 'Fast Press — Explosive Push-Up, Hands Stay Down', demo: 'fastPress', sets: 3, reps: [5, 5], unit: 'reps', tempo: 'Down 2 sec · push fast', rest: REST.pow,
          cues: ['Wall or knee version', 'Down 2 sec', 'Push fast — hands stay down'], feel: 'Quick chest + triceps.', wrong: 'Hands leaving the floor/wall.', unlock: UNLOCK_RULE },
        { id: 'pow2', name: 'Fast Prone Row — Pull Explosive', demo: 'fastProneRow', sets: 3, reps: [5, 5], unit: 'reps', tempo: 'Pull fast · lower 3 sec', rest: REST.pow,
          cues: ['Arms long', 'Pull fast to ribs', 'Reach back out over 3 sec'], feel: 'Snappy shoulder blades.', wrong: 'Arching the low back.', unlock: UNLOCK_RULE },
        { id: 'pow3', name: 'Fast Lunge Step — Step Back, Drive Up', demo: 'fastLunge', sets: 3, reps: [5, 5], unit: 'reps/leg', tempo: 'Step back slow · drive up fast', rest: REST.powLunge,
          cues: ['Step back slow', 'Lower under control', 'Drive up fast through the front leg'], feel: 'Front glute firing fast.', wrong: 'Stepping forward, or knee wobbling.', unlock: UNLOCK_RULE },
        { id: 'pow4', name: 'Heel Snap — Calf Power, Feet Stay Down', demo: 'heelSnap', sets: 3, reps: [6, 6], unit: 'reps', tempo: 'Rise fast · lower 3 sec', rest: REST.pow, gate: 'Legs at the split-squat step or higher, and squats pain-free for 2+ weeks.',
          cues: ['Rise onto toes fast', 'Lower over 3 sec', 'Feet never leave the floor'], feel: 'Calves + Achilles springy.', wrong: 'Hopping.', unlock: UNLOCK_RULE },
        { id: 'pow5', name: 'Snap-Down to Athletic Stance — Jump Prep Only', demo: 'snapDown', sets: 3, reps: [4, 4], unit: 'reps', tempo: 'Rise tall · snap down · freeze 2 sec', rest: REST.pow, gate: 'All earlier power steps pain-free for 2 weeks, plus Legs at the split-squat step or higher.',
          cues: ['Rise tall, arms up', 'Snap down into a landing shape', 'Freeze 2 sec — feet never leave the floor'], feel: 'Quick, quiet, balanced.', wrong: 'Knees caving, back rounding.', unlock: 'Top of the power ladder' },
      ],
    },
  };


  // Big 3 block: done every Day A and Day B, short perfect holds.
  const BIG3 = [
        { id: 'core1', name: 'Bird Dog — Big 3 #1', demo: 'birdDog', sets: 3, reps: [6, 8], unit: 'reps/side', perLabel: '7–10 sec holds · pyramid 6-4-2', tempo: 'Reach · hold 7–10 sec · return', rest: REST.core, sub: 'Dead bug if balance fails.',
          cues: ['Hands under shoulders, knees under hips', 'Reach long, not high', 'Hips level — hold'], feel: 'Glute + back of shoulder.', wrong: 'Leg too high, low back arches.', unlock: UNLOCK_RULE },
        { id: 'core2', name: 'Modified Curl-Up — Big 3 #2', demo: 'curlUp', sets: 3, reps: [6, 8], unit: 'reps/side', perLabel: '7–10 sec holds · pyramid 6-4-2', tempo: 'Lift a little · hold 7–10 sec', rest: REST.core, sub: 'Dead bug if it bothers your back.',
          cues: ['One knee bent, hands under low back (sensors)', 'Lift only head + shoulders, a little', 'Neck still — this is NOT a crunch'], feel: 'Front abs bracing. Hands feel the low back stay still.', wrong: 'Curling up high like a crunch.', unlock: UNLOCK_RULE },
        { id: 'core3', name: 'Side Plank — Big 3 #3 (knees → full)', demo: 'sidePlankKnees', demoAlt: 'sidePlankFull', sets: 3, reps: [4, 6], unit: 'holds/side', perLabel: '7–10 sec each · pyramid', tempo: 'Hold 7–10 sec', rest: REST.core,
          cues: ['Elbow under shoulder', 'Lift hips — straight line', 'Short perfect holds beat one long shaky hold'], feel: 'Side of the trunk.', wrong: 'Hips sagging or rolling forward.', unlock: UNLOCK_RULE },
  ];
  BIG3.forEach((b) => { b.kind = 'big3'; b.unlock = b.id === 'core3' ? 'Knees → full side plank once 6 clean 10-sec holds per side feel “just right”, 2 sessions in a row' : 'Add holds before seconds: build to 3 sets of 6-4-2 reps with 8–10 sec holds'; });
  const EXTRAS = [
        { id: 'core4', name: 'Standing Hip Hinge — Wall Check, No Load', demo: 'hipHinge', sets: 3, reps: [8, 12], unit: 'reps', tempo: '2 sec back · stand', rest: REST.hinge,
          cues: ['Wall about a foot behind you', 'Hips back until your butt lightly taps the wall', 'Flat back — stop the moment it wants to round'], feel: 'Hamstring stretch, flat back. No weight is ever added in this plan.', wrong: 'Back rounding.', unlock: UNLOCK_RULE },
        { id: 'core5', name: 'Front Plank Pyramid — Short Perfect Holds', demo: 'frontPlank', sets: 3, reps: [6, 6], unit: 'holds', perLabel: '10-sec holds, breathe between', tempo: 'Hold 10 sec', rest: REST.core,
          cues: ['Forearms down, elbows under shoulders', 'One line head → heels', 'Add holds, never hold time'], feel: 'Whole trunk bracing. Never at the cost of neutral spine.', wrong: 'Hips sagging, low back arching.', unlock: 'Top of the core ladder' },
  ];
  EXTRAS.forEach((b) => { b.kind = 'extra'; });
  const EX = {}; // id -> exercise (ladder steps + others)
  for (const k in LADDERS) LADDERS[k].steps.forEach((s, i) => { s.ladder = k; s.step = i; EX[s.id] = s; });
  BIG3.concat(EXTRAS).forEach((b) => { EX[b.id] = b; });

  const TENDON = [
    { id: 'tHalf', name: 'Half-Squat Hold', demo: 'halfSquatHold', tendon: 'Knee (patellar) tendon', sets: 3, reps: [30, 45], unit: 'sec', tempo: 'Hold at a hard effort', rest: REST.tHold, cues: ['Sit halfway down', 'Knees over toes, back flat', 'Hold 30–45 sec'], feel: 'Thighs working hard. Pain ≤3/10.', wrong: 'Knees caving in.' },
    { id: 'tCalf', name: 'Calf Raise Hold', demo: 'calfHold', tendon: 'Achilles tendon', sets: 3, reps: [30, 45], unit: 'sec', tempo: 'Hold at the top · slow raises 3 up / 3 down', rest: REST.tHold, cues: ['Rise high on the big toes', 'Hold at the top', 'Later: single-leg + slow 3/3 raises'], feel: 'Calves. Pain ≤3/10.', wrong: 'Rolling to the outside of the foot.' },
    { id: 'tPlank', name: 'Front Plank Hold, Short Holds', demo: 'plankShort', tendon: 'Shoulder + elbow tendons, trunk', sets: 3, reps: [3, 3], unit: 'holds', perLabel: '10 sec × 3', tempo: '10-sec holds', rest: REST.tPlank, cues: ['Forearms down', 'One straight line', '10 sec × 3'], feel: 'Shoulders + trunk.', wrong: 'Hips sagging.' },
    { id: 'tY', name: 'Prone Y Hold', demo: 'proneYHold', tendon: 'Shoulder + upper-back tendons', sets: 3, reps: [20, 30], unit: 'sec', tempo: 'Hold', rest: REST.tSlow, cues: ['Arms in a Y, thumbs up', 'Lift a little', 'Hold 20–30 sec'], feel: 'Upper back + back of shoulders.', wrong: 'Arching the low back.' },
    { id: 'tSplit', name: 'Split Squat Hold at the Bottom', demo: 'splitHold', tendon: 'Knee + hip tendons', sets: 3, reps: [20, 30], unit: 'sec/leg', tempo: 'Hold', rest: REST.tSlow, cues: ['Split stance', 'Lower to the bottom', 'Hold 20–30 sec each leg'], feel: 'Front thigh + glute.', wrong: 'Leaning forward.' },
    { id: 'tBridge', name: 'Glute Bridge Hold at the Top', demo: 'bridgeHold', tendon: 'Hamstring tendons + glutes', sets: 3, reps: [30, 30], unit: 'sec', tempo: 'Hold', rest: REST.tHold, cues: ['Hips up', 'Glutes tight, ribs down', 'Hold 30 sec'], feel: 'Glutes + hamstrings.', wrong: 'Arching the low back.' },
  ];
  TENDON.forEach((t) => { EX[t.id] = t; t.kind = 'tendon'; });

  const MOBILITY = [
    { id: 'm1', name: 'Walk + Breathe (spine hygiene)', demo: 'walkBreathe', dose: '2 min', cues: ['Walk first', 'Then 4–5 slow belly breaths'] },
    { id: 'm2', name: 'Standing Hip Circles + Hip Hinge Patterning', demo: 'hipCircles', dose: '60 sec + 5 slow wall-check hinges', cues: ['Small circles, both ways', 'Then 5 slow hinges at the wall'] },
    { id: 'm3', name: 'Shoulder Rolls + Arm Circles', demo: 'armCircles', dose: '60 sec', cues: ['Roll the shoulders', 'Arm circles, small → big'] },
    { id: 'm4', name: 'Wrist Prep', demo: 'wristPrep', dose: '45 sec', cues: ['On all fours', 'Gentle leans forward + back'] },
    { id: 'm5', name: 'Hip 90/90 Switches', demo: 'hip9090', dose: '90 sec', cues: ['Rotate at the hips', 'Do not twist the spine'] },
    { id: 'm6', name: 'Half-Kneeling Hip-Flexor Stretch', demo: 'hipFlexor', dose: '60 sec / side', cues: ['Tuck the pelvis', 'Squeeze the back glute', 'Never arch'] },
    { id: 'm7', name: 'Floor Thoracic Opener (prone on elbows)', demo: 'thoracicOpener', dose: '60 sec', cues: ['Upper back extends', 'Low back stays relaxed', 'Pinches the low back? Skip it + log it'] },
    { id: 'm8', name: 'Ankle Rocks', demo: 'ankleRocks', dose: '45 sec', cues: ['Front knee over toes', 'Heel stays down'] },
    { id: 'm9', name: 'Glute Activation: Bridge + Clamshell', demo: 'bridgeClam', dose: '60 sec', cues: ['A few bridges', 'Side-lying clamshells, hips stacked'] },
    { id: 'm10', name: 'Supine Hamstring Stretch (back-safe)', demo: 'hamStretch', dose: '30–60 sec / side · after training only', cues: ['Back flat on the mat, hold behind the thigh', 'Replaces the toe-touch, which you never do', 'Never stretch through leg pain'] },
  ];
  MOBILITY.forEach((m) => { EX[m.id] = m; m.kind = 'mobility'; m.rest = REST.mob; });

  const REACTION = [
    { id: 'r1', name: 'Beep Squat', demo: 'beepSquat', dose: '3 rounds × 5 beeps', cues: ['Random interval timer', 'On the beep: squat + stand fast'], rest: REST.react },
    { id: 'r2', name: 'Point and Step', demo: 'pointStep', dose: '3 × 30 sec', cues: ['Partner points left/right/forward/back', 'Step that way fast, reset to the middle'], rest: REST.react },
    { id: 'r3', name: 'Number Steps', demo: 'numberSteps', dose: '3 × 30 sec', cues: ['1 = forward, 2 = back, 3 = left, 4 = right', 'Called at random'], rest: REST.react },
    { id: 'r4', name: 'Hands Up on Cue', demo: 'handsUp', dose: '3 × 30 sec', cues: ['On a beep, clap or “Go!”', 'Snap hands up: by the chin, elbows in'], rest: REST.react },
    { id: 'r5', name: 'Mirror Shuffle', demo: 'mirrorShuffle', dose: '3 × 20 sec', cues: ['Mirror a partner, or shuffle on a beep timer', 'Feet never cross'], rest: REST.react },
    { id: 'r6', name: 'Called Combos, Shadowboxing', demo: 'combos', dose: '2–3 min rounds × 2–3 · rest 1 min', cues: ['Partner or combo-caller app calls it', 'Jab–cross · jab, slip · cross, step out', 'Straight punches + steps only — no hard punching, no twisting hooks'], rest: REST.combo },
  ];
  REACTION.forEach((r) => { EX[r.id] = r; r.kind = 'reaction'; });
  const FOOTWORK = { id: 'fw', name: 'Footwork: Step-Drag + Shuffle', demo: 'footwork', kind: 'reaction', dose: 'Practice in short rounds', rest: REST.react, cues: ['Stance a little wider than shoulders, one foot slightly forward', 'Forward: front foot first. Back: back foot first', 'Feet never cross · turn by stepping, never twisting the spine'] };
  EX.fw = FOOTWORK;
  const SUBS = [
    { id: 'subDoor', name: 'Doorway Pull Hold', demo: 'doorwayPull', sets: 4, reps: [10, 20], unit: 'sec', tempo: 'Pull hard · hold', tendon: 'Real pull for lats + upper back', dose: 'Hold 10–20 sec × 4–5', cues: ['Hold both sides of a door frame', 'Lean back with a straight body', 'Pull hard and hold'], rest: REST.gen, kind: 'sub' },
    { id: 'subBug', name: 'Dead Bug (bird dog / curl-up substitute)', demo: 'deadBug', dose: '3 × 6–8 / side', cues: ['Arms up, knees over hips', 'Reach opposite arm + leg slowly', 'Low back stays on the mat'], rest: REST.core, kind: 'sub' },
  ];
  SUBS.forEach((s) => { EX[s.id] = s; });
  // Rib-safe swaps: used while "No lying face down" is on (rib pain when prone).
  const RIBSAFE = [
    { id: 'qYT', name: 'All-Fours Y-T Raise', demo: 'quadYT', sets: 3, reps: [6, 10], unit: 'reps', perLabel: 'per letter, each arm', tempo: 'Lift 2 sec · hold 2–5 sec · lower 3 sec', rest: REST.gen, tendon: 'Shoulder blades, no chest pressure', kind: 'sub',
      cues: ['Shoulder blade back + down first, then lift', 'Y: arm up + out, thumb up · T: arm straight out to the side', 'One set = Y then T, each arm'], feel: 'Between your spine and shoulder blade. Not your neck.', wrong: 'Trunk twisting to lift higher.' },
    { id: 'qYH', name: 'All-Fours Y Hold', demo: 'quadYHold', sets: 3, reps: [10, 15], unit: 'sec', perLabel: 'each arm', tempo: 'Hold', rest: REST.tSlow, tendon: 'Shoulder + upper-back tendons', kind: 'tendon',
      cues: ['On all fours, back flat', 'One arm up in a Y, thumb up', 'Hold 10–15 sec, switch'], feel: 'Upper back and back of the shoulder.', wrong: 'Hips tilting or low back sagging.' },
    { id: 'qTR', name: 'All-Fours Thoracic Rotation', demo: 'quadThoracic', dose: '5–8 slow reps / side', kind: 'mobility', rest: REST.mob,
      cues: ['Hand behind your head', 'Rotate the elbow up to the ceiling', 'Hips stay still — only the upper back turns'] },
  ];
  RIBSAFE.forEach((s) => { EX[s.id] = s; });
  const PRONE_SWAP = { pull0: 'qYT', pull2: 'subDoor', pull4: 'subDoor', pull5: 'subDoor', pull6: 'subDoor', tY: 'qYH', m7: 'qTR' };

  const DAYS = {
    // Power first (fresh), then main ladders, Big 3 block, tendon block last.
    A: { name: 'Push + Legs + Glutes + Big 3', items: [{ lad: 'power' }, { lad: 'push' }, { lad: 'legs' }, { lad: 'core' }, { big3: true }, { ex: 'tCalf' }] },
    B: { name: 'Pull + Legs + Glutes + Big 3', items: [{ lad: 'power' }, { lad: 'pull' }, { ex: 'subDoor' }, { lad: 'legs' }, { lad: 'core' }, { big3: true }, { ex: 'tY' }] },
    C: { name: 'Full Body + Mobility', items: [{ lad: 'power' }, { lad: 'push' }, { lad: 'pull' }, { ex: 'subDoor' }, { lad: 'legs' }, { ex: 'tHalf' }, { flow: true }] },
  };


  const VARIATIONS = [
    ['Horizontal push', 'Wall push-up → incline push-up (high → low) → floor push-up → feet-elevated → archer. Wrist pain: fists or hands on a step. Shoulder pain: narrower hands, shorter range, incline only.'],
    ['Vertical push', 'Incline pike (hands on a step) → pike push-up → feet-elevated pike. Needs ~10 clean floor push-ups first.'],
    ['Horizontal pull', 'Doorway isometric pull (10–20 sec) or prone row hold → table/doorway inverted row (bent knees → straight) → feet-elevated row, single-arm towel row, slow negatives. No safe anchor: doorway isometric + prone Y-T-W, plus a backpack row later only in a neutral-spine hinge position.'],
    ['Scapular / upper back', 'Prone W → prone Y-T-W with a 2–3 sec hold → slow 3-sec lowering, prone cobra hold. Neck pain: forehead on a towel, arms low (W and T only).'],
    ['Squat', 'Sit-to-stand from a chair, box squat → bodyweight squat → split squat → Bulgarian split squat → single-leg squat to a box (months later). Knee pain: box squat, wall sit, or a low step-up.'],
    ['Lunge / single-leg', 'Static split squat, short range, hand on wall → reverse lunge, full split squat → Bulgarian split squat, slow eccentric split squat. Knee pain: reverse lunge with a vertical front shin. Balance: hold a wall, stay static.'],
    ['Hinge / posterior chain', 'Wall-tap hinge drill, two-leg glute bridge → hinge drill + glute bridge → single-leg bridge, single-leg hip thrust, backpack RDL much later with neutral spine only. Back rounding: broom-handle check (head, between shoulder blades, tailbone) and stop at the hamstring limit.'],
    ['Core', 'Dead bug (arms only, then legs only), knee side plank, curl-up with hands under the back → McGill Big 3 → full side plank + leg lift, bird dog with 10-sec hold, plank with limb lift.'],
    ['Calf / Achilles', 'Two-leg calf raise, slow → single-leg 3 sec / 3 sec → single-leg off a step only if pain-free. Achilles pain: isometric calf hold 30–45 sec, 2 min rest, pain ≤3/10.'],
    ['Knee / patellar tendon', 'Shallow wall sit 20–30 sec → split-squat hold 30–45 sec, then slow split squat 3/3 → slow single-leg squat to a box.'],
    ['Power, lower body', 'Fast squat, no jump → fast squat + fast push-up, 3–5 reps → low jump + landing drills only after the jump gates. Any joint pain: back to fast non-jump work. Never depth jumps at your weight.'],
    ['Mobility, hips', 'Supine figure-4, supported 90/90 → supported deep squat hold, hip circles, couch stretch → 90/90 transitions, unsupported deep squat hold.'],
    ['Mobility, hamstrings', 'Supine stretch with a strap/towel, neutral spine → standing hinge-position stretch, seated stretch → 60-sec supine hold. Never a toe-touch stretch.'],
    ['Mobility, thoracic', 'Quadruped thoracic rotation → side-lying “open book” → rotation in split stance. Hips still, upper back moves, never loaded twisting.'],
    ['Mobility, shoulders', 'Wall slides, gentle doorway chest stretch → shoulder circles, broom-handle pass-through (wide grip) → overhead reach in split stance. Pain overhead: stay below the pain arc.'],
    ['Mobility, ankles', 'Seated ankle circles, wall calf stretch (knee straight, then bent) → supported deep squat hold, heels down → split-squat ankle mobilisation. Ankle pinching: elevate heels slightly for squats.'],
  ];

  const REST_TABLE = [
    ['Between reps, normal sets', 'No rest — reset breath + form (1–3 sec)'],
    ['Between reps, cluster sets (power / heavy quality reps)', '20 sec between mini-sets of 2–3 reps (15–30 sec)'],
    ['Between sets — strength (main moves, single-leg, push-up ladder)', '90 sec · 2 min after the hardest set (90 sec–3 min)'],
    ['Between sets — general bodyweight, 8–12 reps', '90 sec (90 sec–2 min)'],
    ['Between sets — tendon / isometric', '2 min after a 45-sec hold · 90 sec after slow 3/3 sets'],
    ['Between sets — power / explosive', '2–3 min'],
    ['Between sets — core (Big 3, dead bug)', '30 sec (30–60 sec)'],
    ['Between sets — mobility / stretching', 'Move straight on (0–30 sec)'],
    ['Between exercises', '60 sec · 2 min after squats or lunges (practical estimate — no trial measures this)'],
    ['Between sessions', '48 hours · non-consecutive days · 3× per week'],
  ];

  window.PLAN = { REST, LADDERS, EX, BIG3, EXTRAS, RIBSAFE, PRONE_SWAP, TENDON, MOBILITY, REACTION, FOOTWORK, SUBS, DAYS, VARIATIONS, REST_TABLE, UNLOCK_RULE };
})();

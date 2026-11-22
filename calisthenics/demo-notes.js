/* Setup + feel annotations for every demo. Short, all caps on screen.
   setup: shown one at a time while the figure holds the start position.
   feel: shown at the hardest point of the rep. */
(function () {
  const N = {
    // push
    wallPush: { setup: ['ARM\'S LENGTH FROM THE WALL', 'HANDS SHOULDER HEIGHT + WIDTH'], feel: 'FEEL: CHEST + BACK OF ARMS' },
    kneePush: { setup: ['HANDS UNDER SHOULDERS', 'KNEES DOWN · SQUEEZE GLUTES'], feel: 'FEEL: CHEST + TRICEPS, NOT LOW BACK' },
    negPush: { setup: ['TOP OF A PUSH-UP · HANDS UNDER SHOULDERS', 'GLUTES + ABS TIGHT · ONE LINE'], feel: 'FEEL: CHEST WORKING TO BRAKE' },
    fullPush: { setup: ['HANDS A BIT WIDER THAN SHOULDERS', 'FEET TOGETHER · GLUTES TIGHT'], feel: 'FEEL: CHEST, SHOULDERS, TRICEPS' },
    closePush: { setup: ['HANDS UNDER YOUR CHEST', 'KNEES DOWN · BODY IN ONE LINE'], feel: 'FEEL: BACK OF THE ARMS' },
    pikePush: { setup: ['HANDS SHOULDER-WIDTH', 'WALK FEET IN · HIPS HIGH'], feel: 'FEEL: SHOULDERS DOING THE WORK' },
    fastPress: { setup: ['KNEE PUSH-UP POSITION', 'HANDS STAY GLUED TO THE FLOOR'], feel: 'FEEL: A QUICK SNAP, NOT A GRIND' },
    // pull
    proneYTW: { setup: ['LIE FACE DOWN · FOREHEAD LIGHT', 'LEGS LONG · GLUTES GENTLY ON'], feel: 'FEEL: BETWEEN THE SHOULDER BLADES' },
    proneYHold: { setup: ['LIE FACE DOWN · ARMS IN A Y', 'THUMBS UP · NECK LONG'], feel: 'FEEL: UPPER BACK BURNING, NOT NECK' },
    backWidow: { setup: ['ON YOUR BACK · KNEES BENT', 'ELBOWS BENT AT YOUR SIDES'], feel: 'FEEL: BETWEEN SHOULDER BLADES' },
    proneRowHold: { setup: ['LIE FACE DOWN · ARMS LONG', 'FOREHEAD LIGHT ON THE MAT'], feel: 'FEEL: MID BACK SQUEEZING' },
    proneLongSqueeze: { setup: ['LIE FACE DOWN · ARMS LONG', 'SHOULDERS AWAY FROM EARS'], feel: 'FEEL: SHOULDER BLADES PINCHED' },
    pronePullRibs: { setup: ['LIE FACE DOWN · ARMS OVERHEAD', 'LEGS LONG · LOW BACK QUIET'], feel: 'FEEL: LATS UNDER THE ARMPITS' },
    fastProneRow: { setup: ['LIE FACE DOWN · ARMS LONG', 'GET READY TO SNAP BACK'], feel: 'FEEL: QUICK SQUEEZE, SLOW RETURN' },
    advProneRow: { setup: ['LIE FACE DOWN · ARMS LONG', 'FOREHEAD LIGHT · GLUTES ON'], feel: 'FEEL: WHOLE UPPER BACK WORKING' },
    tableRow: { setup: ['SHAKE THE TABLE FIRST · NO WOBBLE', 'GRIP THE EDGE · HEELS DOWN'], feel: 'FEEL: LATS + UPPER BACK + BICEPS' },
    doorwayPull: { setup: ['GRIP BOTH SIDES OF THE FRAME', 'FEET CLOSE · LEAN BACK STRAIGHT'], feel: 'FEEL: BACK + ARMS PULLING HARD' },
    // legs
    partialSquat: { setup: ['FEET SHOULDER-WIDTH · TOES OUT', 'ARMS FORWARD · CHEST PROUD'], feel: 'FEEL: THIGHS + GLUTES' },
    bwSquat: { setup: ['FEET SHOULDER-WIDTH - TOES OUT', 'ARMS FORWARD · CHEST PROUD'], feel: 'FEEL: THIGHS + GLUTES WORKING' },
    tempoSquat: { setup: ['FEET SHOULDER-WIDTH · TOES OUT', 'BRACE: BREATH IN, ABS TIGHT'], feel: 'FEEL: THIGHS BURNING · CONTROL' },
    fastSquat: { setup: ['FEET SHOULDER-WIDTH · TOES OUT', 'ARMS FORWARD FOR BALANCE'], feel: 'FEEL: A FAST PUSH THROUGH THE HIPS' },
    beepSquat: { setup: ['FEET SHOULDER-WIDTH · TOES OUT', 'EYES + EARS READY FOR THE CUE'], feel: 'FEEL: QUICK, BALANCED, IN CONTROL' },
    halfSquatHold: { setup: ['FEET SHOULDER-WIDTH · TOES OUT', 'ARMS FORWARD · CHEST PROUD'], feel: 'FEEL: THIGHS WORKING HARD · PAIN ≤3/10' },
    splitSquat: { setup: ['ONE BIG STEP · FEET HIP-WIDTH', 'BACK HEEL UP · HANDS ON HIPS'], feel: 'FEEL: FRONT THIGH + GLUTE' },
    splitHold: { setup: ['SPLIT STANCE · FEET HIP-WIDTH', 'BACK HEEL UP · TORSO TALL'], feel: 'FEEL: FRONT THIGH WORKING HARD' },
    reverseLunge: { setup: ['FEET HIP-WIDTH · HANDS ON HIPS', 'WEIGHT ON THE FRONT FOOT'], feel: 'FEEL: FRONT GLUTE + THIGH' },
    fastLunge: { setup: ['FEET HIP-WIDTH · HANDS ON HIPS', 'WEIGHT ON THE FRONT FOOT'], feel: 'FEEL: FRONT GLUTE FIRING FAST' },
    skaterSquat: { setup: ['STAND ON ONE LEG', 'OTHER KNEE BENT BEHIND YOU'], feel: 'FEEL: STANDING GLUTE + THIGH' },
    calfHold: { setup: ['FEET HIP-WIDTH · TOES FORWARD', 'FINGERTIP ON A WALL FOR BALANCE'], feel: 'FEEL: CALVES WORKING HARD' },
    heelSnap: { setup: ['FEET HIP-WIDTH · TOES FORWARD', 'KNEES SOFT · STAND TALL'], feel: 'FEEL: SPRINGY CALVES' },
    snapDown: { setup: ['FEET HIP-TO-SHOULDER WIDTH', 'STAND TALL · ARMS RELAXED'], feel: 'FEEL: QUIET, BALANCED LANDING SHAPE' },
    // hinge & glute
    gluteBridge: { setup: ['ON YOUR BACK · FEET HIP-WIDTH', 'HEELS A HAND\'S LENGTH FROM YOUR BUTT'], feel: 'FEEL: GLUTES + HAMSTRINGS, NOT LOW BACK' },
    kickstandBridge: { setup: ['WORKING FOOT FLAT UNDER KNEE', 'HELPER HEEL OUT · BARELY TOUCHING'], feel: 'FEEL: WORKING-SIDE GLUTE' },
    singleLegBridge: { setup: ['ONE FOOT FLAT UNDER KNEE', 'OTHER LEG LONG · ARMS ON THE MAT'], feel: 'FEEL: ONE GLUTE + HAMSTRING' },
    bridgeHold: { setup: ['ON YOUR BACK · FEET HIP-WIDTH', 'RIBS DOWN · ARMS ON THE MAT'], feel: 'FEEL: GLUTES HOLDING, NOT LOW BACK' },
    hipHinge: { setup: ['BACK TO A WALL · ONE FOOT AWAY', 'SOFT KNEES · ARMS CROSSED'], feel: 'FEEL: STRETCH IN BACK OF THIGHS' },
    // Big 3 + core
    birdDog: { setup: ['HANDS UNDER SHOULDERS', 'KNEES UNDER HIPS · BACK FLAT'], feel: 'FEEL: GLUTE + BACK OF SHOULDER' },
    curlUp: { setup: ['ONE KNEE BENT · ONE LEG LONG', 'HANDS UNDER THE LOW BACK'], feel: 'FEEL: ABS BRACE · LOW BACK STILL' },
    sidePlankKnees: { setup: ['ON YOUR SIDE · ELBOW UNDER SHOULDER', 'KNEES BENT · HIPS STACKED'], feel: 'FEEL: SIDE OF THE TRUNK' },
    sidePlankFull: { setup: ['ON YOUR SIDE · ELBOW UNDER SHOULDER', 'LEGS LONG · FEET STACKED'], feel: 'FEEL: SIDE OF THE TRUNK + HIP' },
    frontPlank: { setup: ['FOREARMS DOWN · ELBOWS UNDER SHOULDERS', 'SQUEEZE GLUTES · RIBS DOWN'], feel: 'FEEL: WHOLE TRUNK BRACED' },
    plankShort: { setup: ['FOREARMS DOWN · ELBOWS UNDER SHOULDERS', 'SQUEEZE GLUTES · RIBS DOWN'], feel: 'FEEL: SHOULDERS + TRUNK WORKING' },
    deadBug: { setup: ['ON YOUR BACK · ARMS TO CEILING', 'KNEES OVER HIPS · LOW BACK DOWN'], feel: 'FEEL: DEEP ABS KEEP BACK FLAT' },
    // mobility
    walkBreathe: { setup: ['WALK EASY · ARMS SWING', 'RELAX THE SHOULDERS'], feel: 'FEEL: LOOSE + WARM · BELLY RISES' },
    hipCircles: { setup: ['FEET WIDER THAN HIPS', 'HANDS ON HIPS · SPINE TALL'], feel: 'FEEL: HIPS LOOSENING' },
    armCircles: { setup: ['STAND TALL · FEET HIP-WIDTH', 'ARMS RELAXED AT YOUR SIDES'], feel: 'FEEL: SHOULDERS WARMING UP' },
    wristPrep: { setup: ['ON ALL FOURS', 'FINGERS SPREAD · HANDS UNDER SHOULDERS'], feel: 'FEEL: GENTLE WRIST STRETCH' },
    hip9090: { setup: ['SIT TALL · KNEES BENT 90°', 'HANDS BEHIND YOU FOR SUPPORT'], feel: 'FEEL: HIPS ROTATING, SPINE STILL' },
    hipFlexor: { setup: ['HALF-KNEEL · BACK KNEE ON THE MAT', 'FRONT FOOT FLAT · TORSO TALL'], feel: 'FEEL: STRETCH AT FRONT OF BACK HIP' },
    thoracicOpener: { setup: ['LIE FACE DOWN', 'ELBOWS UNDER SHOULDERS'], feel: 'FEEL: UPPER BACK OPENING' },
    ankleRocks: { setup: ['HALF-KNEEL · FRONT FOOT FLAT', 'HANDS ON HIPS'], feel: 'FEEL: STRETCH IN FRONT CALF/ANKLE' },
    bridgeClam: { setup: ['ON YOUR BACK · KNEES BENT', 'FEET HIP-WIDTH'], feel: 'FEEL: SIDE OF THE HIP' },
    hamStretch: { setup: ['ON YOUR BACK · BACK FLAT', 'LIFT ONE LEG · HOLD BEHIND THIGH'], feel: 'FEEL: GENTLE PULL BEHIND THE THIGH' },
    // reaction + footwork
    pointStep: { setup: ['FEET WIDE · KNEES SOFT', 'WEIGHT ON THE BALLS OF FEET'], feel: 'FEEL: LIGHT + READY TO MOVE' },
    numberSteps: { setup: ['FEET WIDE · KNEES SOFT', 'HANDS UP · EYES FORWARD'], feel: 'FEEL: QUICK FIRST STEP' },
    handsUp: { setup: ['FEET WIDE · ARMS DOWN', 'STAY RELAXED UNTIL THE CUE'], feel: 'FEEL: SNAP, NOT TENSION' },
    mirrorShuffle: { setup: ['FEET WIDE · KNEES SOFT', 'STAY LOW + LEVEL'], feel: 'FEEL: LEGS WORKING, HEAD STEADY' },
    combos: { setup: ['LEFT FOOT FORWARD · BACK HEEL UP', 'HANDS BY CHIN · ELBOWS IN'], feel: 'FEEL: RELAXED, SNAP BACK TO GUARD' },
    footwork: { setup: ['ONE FOOT A BIT FORWARD', 'KNEES SOFT · HANDS UP'], feel: 'FEEL: LIGHT ON THE BALLS OF FEET' },
  };
  window.DEMO_NOTES = N;
})();
(function () { if (window.DEMOS && window.DEMO_NOTES) for (const k in window.DEMOS) window.DEMOS[k].notes = window.DEMO_NOTES[k] || null; })();

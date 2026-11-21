/* Demo keyframes. Each frame: d = seconds to move into it, h = seconds to hold,
   c = caption shown during that phase, w = "wrong" (shows the mistake in red). */
(function () {
  const HIPS = { s: -12, a: 28, e: 105 }; // hands on hips
  const GUARD = { s: 38, a: -4, e: 138 };
  const QUAD = { m: 'F', pit: 90, h: 90, k: 90, f: 75, s: 90, a: 6, e: 0, sol: { a: 'handL', b: 'kneeR', p: 'pit', lo: 55, hi: 125 } };
  const PRONE = { m: 'F', pit: 90, h: 0, k: 0, f: 78, nk: -6 };
  const SUPINE_BENT = { m: 'F', pit: -90, h: 58, k: 105, flat: 1, s: 0, a: 14, e: 0 };
  const PSOL = { a: 'handL', b: ['kneeR', 'toeL'], p: 'pit', lo: 10, hi: 120 };
  const PLANK = (k) => ({ m: 'F', pit: 80, k: k, f: 8, s: 90, a: 10, e: 0, sol: PSOL });

  const FSOL = { a: 'elbowL', b: ['kneeR', 'toeL'], p: 'pit', lo: 0, hi: 140 };
  const squat = (depth, down, extra) => ({
    cam: [38, 8, 3.5, 0.78],
    f: [
      { x: 0.21, o: 20, h: 1, c: 'FEET SHOULDER-WIDTH · TOES OUT' },
      { d: down, py: depth.py, pz: depth.pz, pit: depth.pit, s: depth.s, a: 6, e: 4, c: depth.cap || 'HIPS BACK · ' + down + ' SEC DOWN' },
      { h: depth.pause || 1, c: 'PAUSE · BACK FLAT · KNEES OVER TOES' },
      { d: depth.up || 1.1, ease: depth.upEase || 'ease', py: 0.955, pz: 0, pit: 0, s: 0, a: 7, e: 10, c: depth.upCap || 'STAND · PUSH THROUGH WHOLE FOOT', h: 0.7 },
    ].concat(extra || []),
  });
  const squatWrong = [
    { d: 1.6, py: 0.62, pz: -0.06, pit: 58, sp: 38, nk: -12, s: 55, w: 1, c: '✗ WRONG: LOW BACK ROUNDS', h: 1.1 },
    { d: 1.1, py: 0.955, pz: 0, pit: 0, sp: 0, nk: 0, s: 0, c: 'YOUR DEPTH = JUST ABOVE THAT POINT', h: 0.8 },
  ];

  const D = {};

  // ---------------- PUSH ----------------
  D.wallPush = {
    cam: [78, 10, 3.3, 0.9], anchor: 'toeL',
    props: [{ type: 'wall', at: 'handL', side: 1 }],
    f: [
      { m: 'F', pit: 14, s: 88, a: 14, e: 2, flat: 1, sol: { a: 'handL', b: 'toeL', ax: 'z', v: 0.78, p: 'pit', lo: -5, hi: 60 }, hh: 1, c: 'HANDS ON WALL · SHOULDER HEIGHT' },
      { d: 2, s: 62, e: 100, a: 22, c: 'CHEST TO WALL · 2 SEC' },
      { hh: 0.4, c: 'BODY STAYS ONE STRAIGHT LINE' },
      { d: 1, s: 88, e: 2, a: 14, c: 'PUSH AWAY · 1 SEC', hh: 0.6 },
      { d: 1.2, s: 62, e: 100, h: -18, sp: -14, w: 1, c: '✗ HIPS SAG TOWARD THE WALL', hh: 1 },
      { d: 1, s: 88, e: 2, h: 0, sp: 0, c: 'SQUEEZE GLUTES · KEEP THE LINE', hh: 0.6 },
    ],
  };

  const pushFrames = (kneel, down, up, upEase, extra) => {
    const c = kneel ? 'kneeR' : 'toeL';
    return [
      Object.assign(PLANK(kneel ? 90 : 0, c), { hh: 1, c: kneel ? 'KNEES DOWN · LINE FROM KNEES TO HEAD' : 'HANDS UNDER SHOULDERS · ONE LINE' }),
      { d: down, s: 38, e: 98, a: 28, c: down >= 3 ? 'LOWER SLOW · ' + down + ' SEC' : 'ELBOWS ~45° · ' + down + ' SEC DOWN' },
      { hh: 0.5, c: 'CHEST A FIST ABOVE THE MAT' },
      { d: up, ease: upEase || 'ease', s: 90, e: 0, a: 10, c: up < 0.5 ? 'PUSH FAST!' : 'PUSH THE FLOOR AWAY', hh: 0.7 },
    ].concat(extra || []);
  };
  const pushWrong = [
    { d: 1.3, h: -16, sp: -16, s: 44, e: 90, a: 70, w: 1, c: '✗ HIPS SAG + ELBOWS FLARE OUT' },
    { d: 0.9, h: 0, sp: 0, s: 90, e: 0, a: 10, c: 'GLUTES TIGHT · ELBOWS IN', hh: 0.6 },
  ];
  pushWrong[0].hh = 1;
  D.kneePush = { anchor: 'handL', cam: [72, 14, 3.1, 0.35], f: pushFrames(true, 2, 1).concat(pushWrong) };
  D.negPush = {
    anchor: 'handL', cam: [72, 14, 3.1, 0.35],
    f: [
      Object.assign(PLANK(0, 'toeL'), { hh: 1, c: 'TOP OF A FULL PUSH-UP' }),
      { d: 5, ease: 'lin', s: 38, e: 98, a: 28, c: 'LOWER SLOW · COUNT 5 SECONDS' },
      { hh: 0.5, c: 'BODY STAYS ONE STRAIGHT LINE' },
      { d: 0.8, k: 90, c: 'KNEES DOWN' },
      { d: 1, s: 90, e: 0, a: 10, c: 'PUSH UP ON KNEES (NOT COUNTED)' },
      { d: 0.8, k: 0, c: 'BACK TO PLANK · NEXT REP', hh: 0.4 },
    ],
  };
  D.fullPush = { anchor: 'handL', cam: [72, 14, 3.1, 0.35], f: pushFrames(false, 2, 1).concat(pushWrong) };
  D.closePush = {
    anchor: 'handL', cam: [40, 18, 3.0, 0.35],
    f: [
      Object.assign(PLANK(90, 'kneeR'), { a: -2, hh: 1, c: 'HANDS UNDER CHEST · CLOSE' }),
      { d: 2, s: 30, e: 105, a: 4, c: 'ELBOWS BRUSH THE RIBS · 2 SEC' },
      { hh: 0.5, c: 'FEEL: BACK OF THE ARMS (TRICEPS)' },
      { d: 1, s: 90, e: 0, a: -2, c: 'PUSH UP · 1 SEC', hh: 0.7 },
    ],
  };
  D.pikePush = {
    anchor: 'handL', cam: [80, 12, 3.3, 0.55],
    f: [
      { m: 'F', pit: 130, h: 92, k: 0, f: 0, s: 172, a: 10, e: 0, sol: { a: 'handL', b: 'toeL', p: 'pit', lo: 95, hi: 175 }, hh: 1, c: 'HIPS HIGH · UPSIDE-DOWN V' },
      { d: 2, s: 140, e: 95, a: 25, c: 'HEAD TOWARD THE MAT · 2 SEC' },
      { hh: 0.4, c: 'HEAD IN FRONT OF HANDS · NECK NEUTRAL' },
      { d: 1, s: 172, e: 0, a: 10, c: 'PRESS UP · 1 SEC', hh: 0.7 },
    ],
  };
  D.fastPress = { anchor: 'handL', cam: [72, 14, 3.1, 0.35], f: pushFrames(true, 2, 0.32, 'fast', [{ hh: 1.2, c: 'RESET · PERFECT FORM OR IT DOESN\'T COUNT' }]) };

  // ---------------- PULL ----------------
  const proneArms = (s, a, e) => ({ s, a, e });
  D.proneYTW = {
    cam: [48, 30, 3.2, 0.2],
    f: [
      Object.assign({}, PRONE, { s: 180, a: 32, e: 0, hh: 0.8, c: 'Y: ARMS UP · THUMBS UP · FOREHEAD LIGHT' }),
      { d: 1, s: 196, c: 'LIFT SMALL · HOLD 2 SEC', hh: 1.6 },
      { d: 0.8, s: 180, c: 'LOWER SLOW' },
      { d: 1, s: 90, a: 90, c: 'T: ARMS OUT TO THE SIDES' },
      { d: 1, a: 106, c: 'SQUEEZE SHOULDER BLADES · HOLD 2', hh: 1.6 },
      { d: 0.8, a: 90 },
      { d: 1, s: 90, a: 92, e: 90, c: 'W: ELBOWS BENT' },
      { d: 1, a: 108, c: 'ELBOWS BACK · HOLD 2', hh: 1.6 },
      { d: 0.8, a: 92, c: 'LOW BACK QUIET — NEVER ARCH TO GO HIGHER' },
    ],
  };
  D.proneYHold = {
    cam: [48, 30, 3.2, 0.2],
    f: [
      Object.assign({}, PRONE, { s: 180, a: 32, e: 0, hh: 0.6, c: 'ARMS IN A Y · THUMBS UP' }),
      { d: 1.2, s: 196, c: 'LIFT ARMS A LITTLE' },
      { hh: 3.5, c: 'HOLD 20–30 SEC · HARD EFFORT' },
      { d: 1, s: 180, c: 'LOWER SLOW · REST 2 MIN' },
    ],
  };
  D.backWidow = {
    cam: [70, 16, 3.1, 0.3], anchor: 'heelL',
    f: [
      Object.assign({}, SUPINE_BENT, { s: -8, a: 40, e: 90, sol: { a: 'elbowL', b: 'glute', p: 'pit', lo: -95, hi: -55 }, hh: 0.8, c: 'ON YOUR BACK · ELBOWS BENT BY SIDES' }),
      { d: 1.3, s: -38, sp: -8, c: 'DRIVE ELBOWS DOWN · CHEST LIFTS' },
      { hh: 1.4, c: 'SQUEEZE BETWEEN SHOULDER BLADES' },
      { d: 1.5, s: -8, sp: 0, c: 'LOWER SLOW', hh: 0.4 },
      { hh: 0.8, c: 'FEEL: UPPER BACK — NOT LOW BACK' },
    ],
  };
  const rowPull = (holdC, hold, fast) => ({
    cam: [50, 32, 3.1, 0.2],
    f: [
      Object.assign({}, PRONE, { s: 182, a: 14, e: 0, hh: 0.8, c: 'ARMS LONG IN FRONT' }),
      { d: fast ? 0.35 : 1.2, ease: fast ? 'fast' : 'ease', s: -14, a: 22, e: 75, c: fast ? 'PULL FAST!' : 'PULL ELBOWS TO RIBS' },
      { hh: hold, c: holdC },
      { d: fast ? 3 : 1.4, s: 182, a: 14, e: 0, c: fast ? 'REACH BACK OUT · 3 SEC' : 'REACH LONG AGAIN' },
      { hh: 0.5, c: 'FOREHEAD LIGHT · LOW BACK QUIET' },
    ],
  });
  D.proneRowHold = rowPull('SQUEEZE · LAST REP: HOLD 10 SEC', 1.6);
  D.proneLongSqueeze = rowPull('LONG SQUEEZE · HOLD 5 SEC', 2.6);
  D.pronePullRibs = rowPull('ARMS LONG → RIBS · HOLD 2 SEC', 1.5);
  D.fastProneRow = rowPull('SNAP THE SHOULDER BLADES BACK', 0.5, true);
  D.advProneRow = {
    cam: [50, 32, 3.1, 0.2],
    f: [
      Object.assign({}, PRONE, { s: 182, a: 14, e: 0, hh: 0.6, c: 'ARMS LONG IN FRONT' }),
      { d: 0.8, s: 194, c: '1 · LIFT ARMS OFF THE MAT' },
      { d: 1.2, s: -14, a: 22, e: 75, c: '2 · ROW ELBOWS TO RIBS' },
      { hh: 2.4, c: '3 · HOLD 5 SEC — SQUEEZE' },
      { d: 1.2, s: 194, a: 14, e: 0, c: 'REACH FORWARD · STILL LIFTED' },
      { d: 0.8, s: 182, c: 'LOWER · LOW BACK STAYS QUIET' },
    ],
  };
  D.tableRow = {
    cam: [82, 6, 3.6, 0.55], anchor: 'handL', anchorY: 0.71, anchorAt: [0.17, 0],
    props: [{ type: 'table', at: 'handL', dz: 0.03 }],
    f: [
      { m: 'F', pit: -60, h: 62, k: 92, flat: 1, s: 92, a: 10, e: 0, sol: { a: 'heelL', b: 'handL', v: -0.71, p: 'pit', lo: -89, hi: -10 }, hh: 1, c: 'STURDY TABLE ONLY · TEST IT FIRST' },
      { d: 2, s: 30, e: 105, a: 28, c: 'PULL CHEST TO EDGE · 2 SEC' },
      { hh: 0.5, c: 'BODY STRAIGHT KNEES → HEAD' },
      { d: 2, s: 92, e: 0, a: 10, c: 'LOWER · 2 SEC', hh: 0.4 },
      { hh: 0.8, c: 'KNEES BENT = EASIER · LEGS STRAIGHT = HARDER' },
    ],
  };
  D.doorwayPull = {
    cam: [38, 10, 3.7, 0.9], anchor: 'toeL',
    props: [{ type: 'door', at: 'handL' }],
    f: [
      { m: 'F', pit: -20, s: 72, a: 18, e: 0, flat: 1, hh: 1, c: 'HOLD BOTH SIDES OF THE DOOR FRAME' },
      { d: 1, e: 12, c: 'LEAN BACK · BODY STRAIGHT' },
      { hh: 3, c: 'PULL HARD · HOLD 10–20 SEC' },
      { d: 1, e: 0, c: 'RELAX · REPEAT 4–5 TIMES', hh: 0.6 },
    ],
  };

  // ---------------- LEGS ----------------
  D.partialSquat = squat({ py: 0.77, pz: -0.08, pit: 20, s: 48, pause: 0.6 }, 2);
  D.bwSquat = squat({ py: 0.56, pz: -0.15, pit: 38, s: 85, cap: 'HIPS BACK · KNEES OVER TOES' }, 3, squatWrong);
  D.bwSquat.f[1].nk = -14; D.bwSquat.f[3].nk = 0;
  D.tempoSquat = squat({ py: 0.6, pz: -0.14, pit: 36, s: 80, cap: '3 SEC DOWN', pause: 1, up: 1 }, 3);
  D.fastSquat = squat({ py: 0.6, pz: -0.14, pit: 36, s: 80, cap: 'DOWN SLOW · 3 SEC', pause: 0.4, up: 0.32, upEase: 'fast', upCap: 'STAND EXPLOSIVE!' }, 3, [{ h: 1.4, c: 'FEET STAY DOWN · REST 10 SEC' }]);
  D.beepSquat = {
    cam: [38, 8, 3.5, 0.78],
    f: [
      { x: 0.21, o: 20, s: 20, e: 30, h: 1.4, c: 'READY · WAIT FOR THE BEEP…' },
      { d: 0.35, ease: 'fast', py: 0.64, pz: -0.12, pit: 32, s: 75, e: 5, c: 'BEEP! SQUAT', beep: 1 },
      { d: 0.35, ease: 'fast', py: 0.955, pz: 0, pit: 0, s: 20, e: 30, c: 'STAND FAST', h: 1.2 },
      { h: 0.6, c: 'RANDOM TIMING BEATS A RHYTHM' },
    ],
  };
  D.halfSquatHold = squat({ py: 0.72, pz: -0.1, pit: 24, s: 62, pause: 3.5, cap: 'SIT HALFWAY DOWN' }, 2);
  D.halfSquatHold.f[2].c = 'HOLD 30–45 SEC · HARD EFFORT';
  D.halfSquatHold.f[3].c = 'STAND · REST 2 MIN';

  const SPLIT = { zL: 0.38, zR: -0.42, fR: 50, xL: 0.11, xR: -0.11, oL: 6, oR: 0 };
  D.splitSquat = {
    cam: [84, 8, 3.6, 0.7],
    f: [
      Object.assign({ py: 0.92 }, SPLIT, HIPS, { h: 1, c: 'FEET HIP-WIDTH · TRAIN TRACKS' }),
      { d: 2, py: 0.53, pit: 4, c: 'STRAIGHT DOWN · 2 SEC' },
      { h: 0.7, c: 'BACK KNEE HOVERS · TORSO TALL' },
      { d: 1, py: 0.92, pit: 0, c: 'DRIVE UP THROUGH FRONT HEEL', h: 0.6 },
      { d: 1.4, py: 0.56, pz: 0.16, pit: 24, w: 1, c: '✗ LEANING + SLIDING FORWARD', h: 1 },
      { d: 1, py: 0.92, pz: 0, pit: 0, c: 'STAY STACKED · DOWN, NOT FORWARD', h: 0.6 },
    ],
  };
  D.splitHold = {
    cam: [84, 8, 3.6, 0.7],
    f: [
      Object.assign({ py: 0.92 }, SPLIT, HIPS, { h: 0.6, c: 'SPLIT STANCE · TORSO TALL' }),
      { d: 1.6, py: 0.55, pit: 4, c: 'LOWER TO THE BOTTOM' },
      { h: 3.5, c: 'HOLD 20–30 SEC · EACH LEG' },
      { d: 1, py: 0.92, pit: 0, c: 'STAND · SWITCH LEGS' },
    ],
  };
  const lunge = (fast) => ({
    cam: [84, 8, 3.6, 0.7],
    f: [
      Object.assign({ xL: 0.1, xR: -0.1, o: 6 }, HIPS, { h: 0.8, c: 'STAND TALL · FEET HIP-WIDTH' }),
      { d: 0.7, zR: -0.22, yR: 0.12, pz: -0.06, c: 'STEP BACK — NOT FORWARD' },
      { d: 0.6, zR: -0.5, yR: 0, fR: 46, pz: -0.19, py: 0.92 },
      { d: fast ? 1.6 : 2, py: 0.52, pit: 4, c: fast ? 'LOWER SLOW' : 'LOWER · FRONT SHIN UPRIGHT' },
      { h: 0.4 },
      { d: fast ? 0.35 : 1, ease: fast ? 'fast' : 'ease', py: 0.92, pit: 0, c: fast ? 'DRIVE UP FAST — FRONT LEG' : 'DRIVE UP THROUGH FRONT FOOT' },
      { d: 0.6, zR: -0.22, yR: 0.12, fR: 8, pz: -0.06, py: 0.94 },
      { d: 0.5, zR: 0, yR: 0, fR: 0, pz: 0, py: 0.955, c: 'FEET TOGETHER · RESET', h: 0.5 },
    ],
  });
  D.reverseLunge = lunge(false);
  D.fastLunge = lunge(true);
  D.skaterSquat = {
    cam: [80, 8, 3.6, 0.7],
    f: [
      { xL: 0.1, xR: -0.08, zR: -0.22, yR: 0.2, s: 30, e: 20, h: 1, c: 'BALANCE ON ONE LEG' },
      { d: 3, py: 0.58, pz: -0.08, pit: 34, zR: -0.42, yR: 0.08, s: 78, e: 5, c: 'SIT BACK · 3 SEC' },
      { h: 0.6, c: 'BACK KNEE TO A LIGHT TOUCH' },
      { d: 1, py: 0.955, pz: 0, pit: 0, zR: -0.22, yR: 0.2, s: 30, e: 20, c: 'STAND · 1 SEC', h: 0.6 },
      { h: 0.6, c: 'FRONT KNEE TRACKS OVER TOES' },
    ],
  };
  D.calfHold = {
    cam: [70, 6, 3.4, 0.7],
    f: [
      { x: 0.11, o: 4, h: 0.8, c: 'FEET HIP-WIDTH · FINGERTIP ON WALL OK' },
      { d: 1.5, f: 38, c: 'RISE HIGH ON THE BIG TOES' },
      { h: 3.2, c: 'HOLD 30–45 SEC AT THE TOP' },
      { d: 3, f: 0, c: 'LOWER · 3 SEC' },
    ],
  };
  D.heelSnap = {
    cam: [70, 6, 3.4, 0.7],
    f: [
      { x: 0.11, o: 4, h: 0.8, c: 'TALL · FEET HIP-WIDTH' },
      { d: 0.22, ease: 'fast', f: 38, c: 'RISE FAST!' },
      { h: 0.4, c: 'FEET NEVER LEAVE THE FLOOR' },
      { d: 3, f: 0, c: 'LOWER · 3 SEC' },
    ],
  };
  D.snapDown = {
    cam: [62, 8, 3.6, 0.8],
    f: [
      { x: 0.2, o: 15, h: 0.6, c: 'STAND TALL · FEET HIP-TO-SHOULDER WIDTH' },
      { d: 0.8, f: 30, s: 168, a: 12, e: 5, c: 'RISE TALL · ARMS UP' },
      { d: 0.3, ease: 'fast', f: 0, py: 0.72, pz: -0.12, pit: 32, nk: -12, s: -32, a: 10, e: 15, c: 'SNAP DOWN!' },
      { h: 2, c: 'FREEZE 2 SEC · LANDING SHAPE' },
      { d: 1, py: 0.955, pz: 0, pit: 0, s: 0, a: 7, e: 10, c: 'FEET NEVER LEAVE THE FLOOR', h: 0.4 },
    ],
  };

  // ---------------- HINGE & CORE ----------------
  D.gluteBridge = {
    cam: [74, 14, 3.1, 0.3], anchor: 'heelL',
    f: [
      Object.assign({}, SUPINE_BENT, { sol: { a: 'upperBack', b: 'heelL', p: 'pit', lo: -150, hi: -80 }, hh: 0.8, c: 'FEET FLAT · KNEES BENT' }),
      { d: 1.2, h: 4, k: 88, c: 'SQUEEZE GLUTES · HIPS UP' },
      { hh: 1, c: 'HOLD 2 SEC · RIBS DOWN' },
      { d: 1.5, h: 58, k: 105, c: 'LOWER SLOW' },
      { d: 1.2, h: -14, k: 82, sp: -24, w: 1, c: '✗ OVER-ARCHING — LOW BACK TAKES OVER' },
      { d: 1.2, h: 58, k: 105, sp: 0, c: 'FEEL: GLUTES + HAMSTRINGS, NOT LOW BACK' },
    ],
  };
  D.kickstandBridge = {
    cam: [74, 14, 3.1, 0.3], anchor: 'heelL',
    f: [
      Object.assign({}, SUPINE_BENT, { hR: 6, kR: 12, sol: { a: 'upperBack', b: 'heelL', p: 'pit', lo: -150, hi: -80 }, hh: 0.8, c: 'WORKING FOOT FLAT · HELPER HEEL OUT' }),
      { d: 1.2, hL: 4, kL: 88, hR: -28, kR: 6, c: 'DRIVE THROUGH THE WORKING HEEL' },
      { hh: 1.2, c: 'HOLD 2 SEC · HIPS LEVEL' },
      { d: 1.6, hL: 58, kL: 105, hR: 6, kR: 12, c: 'LOWER SLOW · HELPER FOOT JUST BALANCES' },
    ],
  };
  D.singleLegBridge = {
    cam: [74, 14, 3.1, 0.3], anchor: 'heelL',
    f: [
      Object.assign({}, SUPINE_BENT, { hR: 40, kR: 4, sol: { a: 'upperBack', b: 'heelL', p: 'pit', lo: -150, hi: -80 }, hh: 0.8, c: 'ONE FOOT DOWN · OTHER LEG LONG' }),
      { d: 1.2, hL: 4, kL: 88, hR: 4, kR: 2, c: 'HIPS UP · LEG IN LINE WITH THIGH' },
      { hh: 1.4, c: 'HOLD 2 SEC · NO ARCH' },
      { d: 2, hL: 58, kL: 105, hR: 40, kR: 4, c: 'LOWER SLOW' },
      { d: 1.2, hL: 4, kL: 88, hR: -14, kR: 2, sp: -18, w: 1, c: '✗ HIPS TWIST + LOW BACK ARCHES' },
      { d: 1.2, hL: 58, kL: 105, hR: 40, kR: 4, sp: 0, c: 'KEEP BOTH HIPS LEVEL' },
    ],
  };
  D.bridgeHold = {
    cam: [74, 14, 3.1, 0.3], anchor: 'heelL',
    f: [
      Object.assign({}, SUPINE_BENT, { sol: { a: 'upperBack', b: 'heelL', p: 'pit', lo: -150, hi: -80 }, hh: 0.6, c: 'FEET FLAT · KNEES BENT' }),
      { d: 1.2, h: 4, k: 88, c: 'HIPS UP · GLUTES TIGHT' },
      { hh: 3.5, c: 'HOLD 30 SEC AT THE TOP' },
      { d: 1.5, h: 58, k: 105, c: 'LOWER SLOW · REST' },
    ],
  };
  const bdSide = (arm, leg, stA, stK) => {
    const o = { sol: { a: 'hand' + stA, b: 'knee' + stK, p: 'pit', lo: 55, hi: 125 } };
    o['s' + arm] = 178; o['h' + leg] = 0; o['k' + leg] = 0; o['f' + leg] = 30;
    return o;
  };
  const bdBack = { sL: 90, sR: 90, hL: 90, hR: 90, kL: 90, kR: 90, fL: 75, fR: 75 };
  D.birdDog = {
    cam: [62, 22, 3.2, 0.4],
    f: [
      Object.assign({}, QUAD, { hh: 0.8, c: 'HANDS UNDER SHOULDERS · KNEES UNDER HIPS' }),
      Object.assign({ d: 1.5, c: 'REACH ARM + OPPOSITE LEG LONG' }, bdSide('R', 'L', 'L', 'R')),
      { hh: 1, c: 'HOLD 7–10 SEC · HIPS LEVEL' },
      Object.assign({ d: 1.2, c: 'BACK DOWN SLOW' }, bdBack),
      Object.assign({ d: 1.5, c: 'OTHER SIDE' }, bdSide('L', 'R', 'R', 'L')),
      { hh: 1, c: 'FEEL: GLUTE + BACK OF SHOULDER' },
      Object.assign({ d: 1.2 }, bdBack, { sol: QUAD.sol }),
      Object.assign({ d: 1.2, w: 1, sp: -22, c: '✗ LEG TOO HIGH — LOW BACK ARCHES' }, bdSide('R', 'L', 'L', 'R'), { hL: -28 }),
      { hh: 1 },
      Object.assign({ d: 1, sp: 0, c: 'REACH LONG, NOT HIGH' }, bdBack, { sol: QUAD.sol }),
    ],
  };
  D.curlUp = {
    cam: [70, 14, 3.0, 0.3],
    f: [
      { m: 'F', pit: -90, hL: 55, kL: 105, flat: 'L', s: -6, a: 18, e: 55, hh: 0.9, c: 'ONE KNEE BENT · HANDS UNDER LOW BACK' },
      { d: 1, sp: 18, nk: 6, c: 'LIFT HEAD + SHOULDERS — A LITTLE' },
      { hh: 1, c: 'HOLD 7–10 SEC · NECK STAYS STILL' },
      { d: 1, sp: 0, nk: 0, c: 'LOWER · SWITCH BENT LEG EACH SET' },
      { d: 1.2, sp: 42, nk: 28, w: 1, c: '✗ NOT A CRUNCH — TOO HIGH' },
      { hh: 0.9 },
      { d: 1, sp: 0, nk: 0, c: 'HANDS FEEL THE LOW BACK STAY STILL' },
    ],
  };
  const SIDE = (knees) => ({ m: 'F', pit: 70, spin: -90, aL: 88, sL: 4, eL: 92, sR: 0, aR: 4, eR: 0, h: knees ? 22 : 0, k: knees ? 92 : 0, f: knees ? 40 : 0, sol: { a: 'elbowL', b: ['kneeL', 'ankleL'], p: 'pit', lo: 5, hi: 130 } });
  const sidePlank = (knees) => ({
    cam: [-88, 12, 3.2, 0.32],
    f: [
      Object.assign(SIDE(knees), { spS: -22, hh: 0.8, c: 'ELBOW UNDER SHOULDER · HIPS DOWN' }),
      { d: 1, spS: 0, c: 'LIFT HIPS · STRAIGHT LINE' },
      { hh: 1, c: 'HOLD 7–10 SEC · DON\'T ROLL' },
      { d: 1, spS: -22, c: 'LOWER · SHORT PERFECT HOLDS' },
    ],
  });
  D.sidePlankKnees = sidePlank(true);
  D.sidePlankFull = sidePlank(false);
  const hinge = {
    cam: [82, 8, 3.4, 0.85],
    props: [{ type: 'wall', at: 'glute', frame: 2, side: -1, face: -1, dz: 0.02 }],
    f: [
      { x: 0.13, o: 10, s: 42, a: -12, e: 128, h: 0.8, c: 'WALL ONE FOOT BEHIND YOU · SOFT KNEES' },
      { d: 2, pit: 52, pz: -0.16, py: 0.9, c: 'PUSH HIPS BACK · FLAT BACK' },
      { h: 0.6, c: 'LIGHT BUTT TAP ON THE WALL' },
      { d: 1.2, pit: 0, pz: 0, py: 0.955, c: 'SQUEEZE GLUTES TO STAND', h: 0.6 },
      { d: 1.4, pit: 58, pz: -0.08, py: 0.92, sp: 38, nk: -16, w: 1, c: '✗ BACK ROUNDS — STOP THE REP' },
      { h: 0.8 },
      { d: 1, pit: 0, pz: 0, py: 0.955, sp: 0, nk: 0, c: 'NO WEIGHT · PATTERN ONLY', h: 0.6 },
    ],
  };
  D.hipHinge = hinge;
  D.frontPlank = {
    cam: [74, 14, 3.1, 0.3], anchor: 'elbowL',
    f: [
      { m: 'F', pit: 70, s: 90, a: 8, e: 90, k: 90, f: 10, sol: FSOL, hh: 0.7, c: 'FOREARMS DOWN · ELBOWS UNDER SHOULDERS' },
      { d: 1, k: 0, sol: FSOL, c: 'ONE LINE · HEAD TO HEELS' },
      { hh: 1, c: 'HOLD 10 SEC · KEEP BREATHING' },
      { d: 1, k: 90, sol: FSOL, c: 'KNEES DOWN · BREATHE · REPEAT' },
      { d: 1, k: 0, h: -16, sp: -18, sol: FSOL, w: 1, c: '✗ HIPS SAG — LOW BACK ARCHES' },
      { hh: 0.8 },
      { d: 1, k: 90, h: 0, sp: 0, sol: FSOL, c: 'ADD HOLDS, NEVER HOLD TIME' },
    ],
  };
  D.plankShort = {
    cam: [74, 14, 3.1, 0.3], anchor: 'elbowL',
    f: [
      { m: 'F', pit: 70, s: 90, a: 8, e: 90, k: 90, f: 10, sol: FSOL, hh: 0.6, c: 'FOREARMS DOWN' },
      { d: 1, k: 0, sol: FSOL, c: 'ONE STRAIGHT LINE' },
      { hh: 2.5, c: 'HOLD 10 SEC × 3 · SHOULDERS + TRUNK' },
      { d: 1, k: 90, sol: FSOL, c: 'KNEES DOWN · SHORT REST' },
    ],
  };
  D.deadBug = {
    cam: [66, 20, 3.0, 0.3],
    f: [
      { m: 'F', pit: -90, s: 90, a: 6, e: 0, h: 90, k: 90, f: 10, sol: { a: 'upperBack', b: 'glute', p: 'pit', lo: -100, hi: -80 }, hh: 0.8, c: 'ARMS UP · KNEES OVER HIPS' },
      { d: 1.8, sR: 172, hL: 18, kL: 8, c: 'REACH OPPOSITE ARM + LEG' },
      { hh: 0.6, c: 'LOW BACK STAYS ON THE MAT' },
      { d: 1.4, sR: 90, hL: 90, kL: 90 },
      { d: 1.8, sL: 172, hR: 18, kR: 8, c: 'OTHER SIDE · SLOW' },
      { d: 1.4, sL: 90, hR: 90, kR: 90 },
    ],
  };

  // ---------------- MOBILITY ----------------
  D.walkBreathe = {
    cam: [40, 8, 3.6, 0.85],
    f: [
      { x: 0.1, h: 0.2, c: 'WALK FIRST · 2 MIN' },
      { d: 0.45, yL: 0.12, zL: 0.12, sR: 25, sL: -18, py: 0.94 },
      { d: 0.45, yL: 0, zL: 0.04, sR: 0, sL: 0 },
      { d: 0.45, yR: 0.12, zR: 0.12, sL: 25, sR: -18 },
      { d: 0.45, yR: 0, zR: 0.04, sL: 0, sR: 0 },
      { d: 0.45, yL: 0.12, zL: 0.12, sR: 25, sL: -18 },
      { d: 0.45, yL: 0, zL: 0.04, sR: 0, sL: 0, zR: 0.04 },
      { d: 0.8, zL: 0, zR: 0, py: 0.955, s: 22, a: -6, e: 100, c: 'HANDS ON BELLY' },
      { d: 1.6, spS: 0, sp: -3, c: 'BREATHE IN · BELLY EXPANDS' },
      { d: 1.8, sp: 0, c: 'BREATHE OUT SLOW · 4–5 BREATHS', h: 0.4 },
    ],
  };
  D.hipCircles = {
    cam: [40, 8, 3.6, 0.85],
    f: [
      Object.assign({ x: 0.14 }, HIPS, { h: 0.5, c: 'HANDS ON HIPS · SMALL CIRCLES' }),
      { d: 0.7, px: 0.05, py: 0.94 },
      { d: 0.7, px: 0, pz: 0.05 },
      { d: 0.7, px: -0.05, pz: 0 },
      { d: 0.7, px: 0, pz: -0.05 },
      { d: 0.7, px: 0.05, pz: 0, c: 'BOTH DIRECTIONS · SPINE TALL' },
      { d: 0.7, px: 0, py: 0.955 },
      { d: 1.4, pit: 45, pz: -0.14, py: 0.91, c: 'THEN 5 SLOW WALL-CHECK HINGES' },
      { d: 1.1, pit: 0, pz: 0, py: 0.955, h: 0.4 },
    ],
  };
  D.armCircles = {
    cam: [20, 8, 3.6, 1.0],
    f: [
      { x: 0.13, h: 0.4, c: 'SHOULDER ROLLS · THEN ARM CIRCLES' },
      { d: 0.6, a: 7, s: 8, e: 30 }, { d: 0.6, s: -8 }, { d: 0.6, s: 0, e: 10 },
      { d: 0.8, a: 88, e: 0, c: 'ARMS OUT · SMALL CIRCLES' },
      { d: 0.45, s: 14, a: 96 }, { d: 0.45, s: 0, a: 104 }, { d: 0.45, s: -14, a: 96 }, { d: 0.45, s: 0, a: 88 },
      { d: 0.45, s: 14, a: 96, c: 'GROW THE CIRCLES · 60 SEC' }, { d: 0.45, s: 0, a: 104 }, { d: 0.45, s: -14, a: 96 }, { d: 0.45, s: 0, a: 88 },
    ],
  };
  D.wristPrep = {
    cam: [64, 18, 3.2, 0.4],
    f: [
      Object.assign({}, QUAD, { hh: 0.6, c: 'ON ALL FOURS · FINGERS SPREAD' }),
      { d: 1.4, s: 112, c: 'GENTLE LEAN FORWARD' },
      { hh: 0.6 },
      { d: 1.4, s: 72, c: 'LEAN BACK' },
      { hh: 0.6, c: '45 SEC · NO SHARP WRIST PAIN' },
      { d: 1, s: 90 },
    ],
  };
  D.hip9090 = {
    cam: [10, 22, 3.0, 0.35],
    f: [
      { m: 'F', pit: -8, h: 88, k: 95, f: 0, s: -30, a: 22, e: 0, hh: 0.8, c: 'SIT TALL · HANDS BEHIND YOU' },
      { d: 1.6, bL: 52, bR: -52, c: 'KNEES DROP TO ONE SIDE' },
      { hh: 0.9, c: 'ROTATE AT THE HIPS — NOT THE SPINE' },
      { d: 1.8, bL: -52, bR: 52, c: 'SWITCH SIDES · SLOW' },
      { hh: 0.9, c: '90 SEC TOTAL' },
      { d: 1.2, bL: 0, bR: 0 },
    ],
  };
  D.hipFlexor = {
    cam: [84, 8, 3.4, 0.55],
    f: [
      Object.assign({ py: 0.53, pz: -0.05, zL: 0.38, zR: -0.5, xL: 0.12, xR: -0.12, fR: 85, yR: -0.15 }, HIPS, { h: 0.8, c: 'HALF-KNEEL · BACK KNEE DOWN' }),
      { d: 1.4, pit: -8, c: 'TUCK PELVIS · SQUEEZE BACK GLUTE' },
      { d: 1.4, pz: 0.04, c: 'SHIFT FORWARD A LITTLE' },
      { h: 2.2, c: 'HOLD 60 SEC · FEEL FRONT OF BACK HIP' },
      { d: 1.2, pz: -0.05, pit: 0, c: 'NEVER ARCH THE LOW BACK' },
    ],
  };
  D.thoracicOpener = {
    cam: [70, 18, 3.0, 0.3], anchor: 'pelvisM',
    f: [
      Object.assign({}, PRONE, { s: 112, a: 10, e: 92, sol: { a: 'elbowL', b: 'pelvisM', p: 'sp', lo: -70, hi: 10 }, hh: 0.8, c: 'PRONE ON ELBOWS' }),
      { d: 1.6, s: 82, c: 'UPPER BACK LIFTS · LOW BACK RELAXED' },
      { hh: 1.6, c: 'BREATHE · 60 SEC' },
      { d: 1.4, s: 112, c: 'PINCHES THE LOW BACK? SKIP + LOG IT' },
    ],
  };
  D.ankleRocks = {
    cam: [84, 8, 3.4, 0.6],
    f: [
      Object.assign({ py: 0.53, pz: -0.05, zL: 0.38, zR: -0.5, xL: 0.12, xR: -0.12, fR: 85, yR: -0.15 }, HIPS, { h: 0.6, c: 'HALF-KNEEL · FRONT FOOT FLAT' }),
      { d: 1.2, pz: 0.12, c: 'KNEE FORWARD OVER TOES' },
      { h: 0.6, c: 'HEEL STAYS DOWN' },
      { d: 1, pz: -0.05 },
      { d: 1.2, pz: 0.12, c: '45 SEC · EACH SIDE' },
      { d: 1, pz: -0.05 },
    ],
  };
  D.bridgeClam = {
    cam: [56, 22, 3.1, 0.3], anchor: 'heelL',
    f: [
      Object.assign({}, SUPINE_BENT, { sol: { a: 'upperBack', b: 'heelL', p: 'pit', lo: -150, hi: -80 }, hh: 0.4, c: 'BRIDGE · SQUEEZE GLUTES' }),
      { d: 1, h: 6, k: 88 },
      { d: 1, h: 58, k: 105 },
      { d: 1.6, pit: -90, spin: 90, h: 45, k: 95, sol: null, flat: 0, f: 20, sL: 175, aL: 10, eL: 30, c: 'ROLL TO YOUR SIDE' },
      { d: 1, rR: 38, c: 'CLAMSHELL · KNEES OPEN, FEET TOGETHER' },
      { d: 1, rR: 0, c: 'HIPS STAY STACKED' },
      { d: 1, rR: 38 }, { d: 1, rR: 0, hh: 0.4 },
      { d: 1.4, spin: 0, h: 58, k: 105, flat: 1, f: 0, sL: 0, aL: 14, eL: 0, sol: { a: 'upperBack', b: 'heelL', p: 'pit', lo: -150, hi: -80 } },
    ],
  };
  D.hamStretch = {
    cam: [78, 14, 3.1, 0.35],
    f: [
      { m: 'F', pit: -90, hR: 62, kR: 8, s: 78, a: -6, e: 40, hh: 0.8, c: 'BACK FLAT · HANDS BEHIND THIGH' },
      { d: 2, hR: 76, c: 'GENTLE PULL · BELOW DISCOMFORT' },
      { hh: 2, c: 'HOLD 30–60 SEC · AFTER TRAINING ONLY' },
      { d: 1.4, hR: 0, kR: 0, hL: 62, kL: 8, c: 'OTHER LEG · NEVER A TOE-TOUCH' },
      { d: 2, hL: 76 }, { hh: 1.4 }, { d: 1.2, hL: 0, kL: 0, hR: 62, kR: 8 },
    ],
  };

  // ---------------- REACTION / FOOTWORK ----------------
  const STANCE = Object.assign({ py: 0.9, pit: 8, zL: 0.17, zR: -0.17, xL: 0.13, xR: -0.13, fR: 14, oL: 20, oR: 45, yaw: 0 }, GUARD);
  D.pointStep = {
    cam: [20, 10, 3.8, 0.8],
    f: [
      Object.assign({}, STANCE, { zL: 0, zR: 0, x: 0.2, fR: 8, fL: 8, h: 0.8, c: 'ATHLETIC STANCE · READY' }),
      { d: 0.28, ease: 'fast', xL: 0.5, c: 'POINT LEFT → STEP!' }, { d: 0.25, xR: 0.1, px: 0.3 },
      { d: 0.28, xR: -0.2, c: 'BACK TO THE MIDDLE' }, { d: 0.25, xL: 0.2, px: 0, h: 0.4 },
      { d: 0.28, ease: 'fast', zL: -0.3, zR: -0.3, pz: -0.3, c: 'POINT BACK → STEP!' }, { d: 0.4, zL: 0, zR: 0, pz: 0, h: 0.5 },
      { d: 0.28, ease: 'fast', xR: -0.5, c: 'POINT RIGHT → STEP!' }, { d: 0.25, xL: -0.1, px: -0.3 },
      { d: 0.28, xL: 0.2 }, { d: 0.25, xR: -0.2, px: 0, h: 0.4, c: 'RESET TO THE MIDDLE' },
    ],
  };
  D.numberSteps = {
    cam: [30, 10, 3.8, 0.8],
    f: [
      Object.assign({}, STANCE, { zL: 0, zR: 0, x: 0.2, fR: 8, fL: 8, h: 0.6, c: '1 FWD · 2 BACK · 3 LEFT · 4 RIGHT' }),
      { d: 0.3, ease: 'fast', zL: 0.3, zR: 0.3, pz: 0.3, c: '"1!" → FORWARD' }, { d: 0.4, zL: 0, zR: 0, pz: 0, h: 0.3 },
      { d: 0.3, ease: 'fast', xR: -0.5, xL: -0.1, px: -0.3, c: '"4!" → RIGHT' }, { d: 0.4, xR: -0.2, xL: 0.2, px: 0, h: 0.3 },
      { d: 0.3, ease: 'fast', zL: -0.3, zR: -0.3, pz: -0.3, c: '"2!" → BACK' }, { d: 0.4, zL: 0, zR: 0, pz: 0, h: 0.3 },
      { d: 0.3, ease: 'fast', xL: 0.5, xR: 0.1, px: 0.3, c: '"3!" → LEFT' }, { d: 0.4, xL: 0.2, xR: -0.2, px: 0, h: 0.4 },
    ],
  };
  D.handsUp = {
    cam: [28, 8, 3.4, 1.0],
    f: [
      { x: 0.16, py: 0.92, h: 1.2, c: 'RELAXED · WAIT FOR THE CUE…' },
      { d: 0.22, ease: 'fast', s: 38, a: -4, e: 138, c: 'GO! HANDS UP TO GUARD', beep: 1 },
      { h: 1, c: 'HANDS BY CHIN · ELBOWS IN' },
      { d: 0.8, s: 0, a: 7, e: 10, h: 0.6, c: 'DROP · RESET' },
    ],
  };
  D.mirrorShuffle = {
    cam: [12, 10, 3.9, 0.8],
    f: [
      Object.assign({}, STANCE, { zL: 0, zR: 0, x: 0.2, fR: 8, fL: 8, h: 0.6, c: 'LOW + LEVEL · FEET NEVER CROSS' }),
      { d: 0.25, xL: 0.42 }, { d: 0.25, xR: 0.02, px: 0.22 }, { d: 0.25, xL: 0.64 }, { d: 0.25, xR: 0.24, px: 0.44, c: 'SHUFFLE LEFT' },
      { d: 0.25, xR: 0.02 }, { d: 0.25, xL: 0.42, px: 0.22 }, { d: 0.25, xR: -0.2 }, { d: 0.25, xL: 0.2, px: 0, c: 'SHUFFLE RIGHT', h: 0.4 },
    ],
  };
  D.combos = {
    cam: [38, 8, 3.6, 1.0],
    f: [
      Object.assign({}, STANCE, { yaw: 20, h: 0.8, c: 'STANCE · HANDS UP' }),
      { d: 0.18, ease: 'fast', sL: 86, aL: -4, eL: 6, c: '"JAB!"' }, { d: 0.25, sL: 38, eL: 138, h: 0.15 },
      { d: 0.2, ease: 'fast', sR: 86, aR: -6, eR: 6, spT: -24, fR: 34, c: '"CROSS!"' }, { d: 0.3, sR: 38, eR: 138, spT: 0, fR: 14, h: 0.4 },
      { d: 0.25, ease: 'fast', spS: 12, px: 0.07, py: 0.86, c: '"SLIP!"' }, { d: 0.3, spS: 0, px: 0, py: 0.9, h: 0.3 },
      { d: 0.18, ease: 'fast', sL: 86, eL: 6, c: 'TECHNIQUE FIRST · SPEED SECOND' }, { d: 0.25, sL: 38, eL: 138, h: 0.5 },
    ],
  };
  D.footwork = {
    cam: [74, 10, 4.0, 0.8],
    f: [
      Object.assign({}, STANCE, { h: 0.8, c: 'STANCE · WEIGHT ON BALLS OF FEET' }),
      { d: 0.3, zL: 0.42, pz: 0.1, c: 'FORWARD: FRONT FOOT FIRST' }, { d: 0.3, zR: 0.08, pz: 0.25, c: 'BACK FOOT SLIDES', h: 0.3 },
      { d: 0.3, zR: -0.17, pz: 0.1, c: 'BACK: BACK FOOT FIRST' }, { d: 0.3, zL: 0.17, pz: 0, c: 'FRONT FOOT FOLLOWS', h: 0.3 },
      { d: 0.6, c: 'FEET NEVER CROSS · TURN BY STEPPING', h: 0.8 },
    ],
  };

  window.DEMOS = D;
})();

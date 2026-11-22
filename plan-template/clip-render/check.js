// Automatic demo checker: measures every demo at every keyframe and flags inaccurate positions
// BEFORE you render videos. Also writes front + side contact sheets to check by eye.
// usage: node check.js [demoKey ...]      (no keys = check all demos)
// needs: playwright (+ Chromium), three.min.js in this folder
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, '..') + '/';
const OUT = path.join(__dirname, 'check-sheets'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 720, height: 720 } });
  for (const f of ['demo-engine.js', 'demos.js', 'demo-notes.js']) await p.route('**/' + f, (r) => r.fulfill({ path: dir + f }));
  await p.goto('file://' + __dirname + '/rharness.html');
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : await p.evaluate(() => Object.keys(DEMOS));
  let fails = 0, warns = 0;
  for (const key of keys) {
    const res = await p.evaluate((key) => {
      const D = DEMOS[key]; P.setDemo(D); const C = DemoEngine.compile(D);
      const FLOOR = 0.012, issues = [];
      const add = (lvl, i, msg) => issues.push([lvl, i, msg]);
      const ang = (a, b) => Math.atan2(Math.hypot(b[0] - a[0], b[2] - a[2]), b[1] - a[1]) * 180 / Math.PI; // angle from vertical
      C.frames.forEach((fr, i) => {
        if (fr.w) return; // the deliberate mistake frame is allowed to be wrong
        const t = (fr.t1 + fr.t2) / 2, q = P.probe(t), m = q.markers, pose = q.pose;
        // 1. nothing sinks into the floor
        let low = Infinity, lowName = ''; for (const k in m) { const v = m[k][1] - m[k][3]; if (v < low) { low = v; lowName = k; } }
        if (low < FLOOR - 0.02) add('FAIL', i, lowName + ' is ' + ((FLOOR - low) * 100).toFixed(0) + ' cm below the floor');
        if (pose.m !== 'F') {
          // 2. standing: planted feet touch the floor
          for (const s of ['L', 'R']) {
            if ((pose['y' + s] || 0) !== 0) continue;
            const toe = m['toe' + s][1] - m['toe' + s][3], heel = m['heel' + s][1] - m['heel' + s][3];
            if (toe - FLOOR > 0.03) add('FAIL', i, s + ' toes float ' + ((toe - FLOOR) * 100).toFixed(0) + ' cm above the floor');
            if ((pose['f' + s] || 0) <= 2 && heel - FLOOR > 0.03) add('FAIL', i, s + ' heel lifts ' + ((heel - FLOOR) * 100).toFixed(0) + ' cm (should be flat)');
            // 3. knee tracks over the toes (sideways offset from the foot line)
            const kn = m['knee' + s], an = m['ankle' + s], to = m['toe' + s];
            const fx = to[0] - an[0], fz = to[2] - an[2], fl = Math.hypot(fx, fz) || 1;
            const lat = ((kn[0] - an[0]) * fz - (kn[2] - an[2]) * fx) / fl;
            const bent = m.pelvisM[1] < 0.85; // hips clearly lowered = knees bent
            if (bent && Math.abs(lat) > 0.07) add('WARN', i, s + ' knee ' + (Math.abs(lat) * 100).toFixed(0) + ' cm off the line of the toes');
          }
          // 4. squat-type: torso roughly parallel to the shins at depth
          const hipY = m.pelvisM[1];
          if (hipY < 0.7 && (pose.yL || 0) === 0 && (pose.yR || 0) === 0 && Math.abs((pose.zL || 0) - (pose.zR || 0)) < 0.1) {
            const torso = ang(m.pelvisM, m.chestM), shin = ang(m.ankleL, m.kneeL);
            if (Math.abs(torso - shin) > 22) add('WARN', i, 'torso ' + torso.toFixed(0) + '° vs shin ' + shin.toFixed(0) + '° (aim for roughly parallel)');
          }
          // 5. stance width report for squats
          const stance = Math.hypot(m.ankleL[0] - m.ankleR[0], m.ankleL[2] - m.ankleR[2]), shoulders = Math.hypot(m.shLM[0] - m.shRM[0], m.shLM[2] - m.shRM[2]);
          if (/[Ss]quat/.test(key) && !/split|Split|skater|Skater/.test(key) && i === 0 && stance < shoulders * 0.85) add('WARN', i, 'stance ' + (stance * 100).toFixed(0) + ' cm is narrower than shoulders ' + (shoulders * 100).toFixed(0) + ' cm');
        }
        // 6. floor contacts named in the solver really touch the floor
        if (pose.sol) for (const part of [pose.sol.a].concat(pose.sol.b)) {
          if (!m[part] || pose.sol.v) continue;
          const v = m[part][1] - m[part][3];
          if (Array.isArray(pose.sol.b) && pose.sol.b.includes(part)) { const best = Math.min(...pose.sol.b.map((k) => m[k][1] - m[k][3])); if (best - FLOOR > 0.03) add('FAIL', i, 'none of ' + pose.sol.b.join('/') + ' touch the floor'); continue; }
          if (v - FLOOR > 0.03) add('FAIL', i, part + ' should touch the floor but is ' + ((v - FLOOR) * 100).toFixed(0) + ' cm above it');
        }
      });
      return { issues, frames: C.frames.length, total: C.total };
    }, key);
    for (const [lvl] of res.issues) lvl === 'FAIL' ? fails++ : warns++;
    console.log((res.issues.some((x) => x[0] === 'FAIL') ? 'FAIL ' : res.issues.length ? 'WARN ' : 'OK   ') + key + '  (' + res.frames + ' keyframes, ' + res.total.toFixed(1) + 's)');
    for (const [lvl, i, msg] of res.issues) console.log('      ' + lvl + ' frame ' + i + ': ' + msg);
    // contact sheet: each keyframe from the demo camera (top row) and from 90° to the side (bottom row)
    const url = await p.evaluate((key) => {
      const D = DEMOS[key]; const C = DemoEngine.compile(D); const cam = D.cam || [50, 8, 3.6, 0.85];
      const times = C.frames.map((f) => (f.t1 + f.t2) / 2); const n = Math.min(times.length, 8);
      const S = document.createElement('canvas'); S.width = n * 220; S.height = 440; const g = S.getContext('2d');
      [0, 90].forEach((off, row) => { P.setDemo(Object.assign({}, D, { cam: [cam[0] + off, cam[1], cam[2], cam[3]] }));
        for (let i = 0; i < n; i++) { P.renderAt(times[Math.round(i * (times.length - 1) / Math.max(1, n - 1))]); g.drawImage(document.getElementById('c'), i * 220, row * 220, 220, 220); } });
      return S.toDataURL('image/jpeg', 0.85);
    }, key);
    fs.writeFileSync(path.join(OUT, key + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('\n' + fails + ' fail(s), ' + warns + ' warning(s). Contact sheets: ' + OUT);
  await b.close(); process.exit(fails ? 1 : 0);
})();

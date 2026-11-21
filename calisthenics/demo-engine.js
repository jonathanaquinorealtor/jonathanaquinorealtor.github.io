/* Demo engine: a solid 3D mannequin fighter on a dark blue stage.
   Poses are keyframes; standing moves use leg IK, floor moves use a contact solver. */
(function () {
  const D2R = Math.PI / 180;
  const T = () => window.THREE;

  // ---------- figure ----------
  const L = { thigh: 0.45, shin: 0.44, ua: 0.30, fa: 0.26 };

  function lathe(THREE, len, prof, mat, seg) {
    // prof: [[t (0..1 along length), radius], ...]
    const pts = prof.map(([t, r]) => new THREE.Vector2(Math.max(r, 0.001), -t * len));
    pts.unshift(new THREE.Vector2(0.001, 0.004));
    pts.push(new THREE.Vector2(0.001, -len - 0.004));
    const g = new THREE.LatheGeometry(pts, seg || 22);
    return new THREE.Mesh(g, mat);
  }
  function ball(THREE, r, mat, sx, sy, sz) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 26, 18), mat);
    m.scale.set(sx || 1, sy || 1, sz || 1);
    return m;
  }
  function node(name, parent, x, y, z, order) {
    const o = new (T().Object3D)();
    o.name = name; o.position.set(x || 0, y || 0, z || 0);
    if (order) o.rotation.order = order;
    if (parent) parent.add(o);
    return o;
  }

  function buildFigure(mats) {
    const THREE = T();
    const { skin, shorts, band, white, stripe } = mats;
    const fig = new THREE.Group();
    const R = {}; // nodes
    const markers = [];
    const mk = (name, parent, x, y, z, r) => { const o = node(name, parent, x, y, z); o.userData.r = r; markers.push(o); R[name] = o; return o; };
    const add = (p, m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; p.add(m); return m; };

    R.root = node('root', fig);
    R.tilt = node('tilt', R.root);
    R.spin = node('spin', R.tilt);
    R.pelvis = node('pelvis', R.spin);
    const P = R.pelvis;
    // pelvis + shorts
    add(P, ball(THREE, 1, shorts, 0.165, 0.125, 0.125), 0, 0.03, 0);
    add(P, ball(THREE, 0.088, shorts, 1, 1, 0.95), 0.07, -0.02, -0.055);
    add(P, ball(THREE, 0.088, shorts, 1, 1, 0.95), -0.07, -0.02, -0.055);
    const wb = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 10, 36), white);
    wb.rotation.x = Math.PI / 2; wb.scale.set(1.08, 0.82, 1); add(P, wb, 0, 0.115, 0);
    mk('glute', P, 0, -0.02, -0.03, 0.12);
    mk('pelvisM', P, 0, 0.02, 0.0, 0.12);

    // spine
    R.abd = node('abd', P, 0, 0.11, 0, 'YXZ');
    add(R.abd, lathe(THREE, 0.2, [[0, 0.135], [0.5, 0.128], [1, 0.14]], skin), 0, 0.2, 0).scale.set(1, 1, 0.74);
    R.chest = node('chest', R.abd, 0, 0.17, 0, 'YXZ');
    const C = R.chest;
    add(C, ball(THREE, 1, skin, 0.185, 0.175, 0.125), 0, 0.13, -0.005);
    add(C, ball(THREE, 0.085, skin, 1.02, 0.82, 0.55), 0.072, 0.165, 0.075);
    add(C, ball(THREE, 0.085, skin, 1.02, 0.82, 0.55), -0.072, 0.165, 0.075);
    add(C, ball(THREE, 1, skin, 0.075, 0.14, 0.085), 0.125, 0.09, -0.03);
    add(C, ball(THREE, 1, skin, 0.075, 0.14, 0.085), -0.125, 0.09, -0.03);
    add(C, ball(THREE, 1, skin, 0.13, 0.065, 0.085), 0, 0.27, -0.035);
    // abs blocks (subtle)
    for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) add(C, ball(THREE, 0.034, skin, 1.1, 0.8, 0.45), sx * 0.034, 0.02 - i * 0.055, 0.1);
    mk('upperBack', C, 0, 0.13, -0.02, 0.11);
    mk('chestM', C, 0, 0.12, 0.02, 0.11);
    R.neck = node('neck', C, 0, 0.29, 0, 'YXZ');
    add(R.neck, lathe(THREE, 0.11, [[0, 0.056], [1, 0.06]], skin), 0, 0.11, 0);
    R.head = node('head', R.neck, 0, 0.13, 0.01);
    const H = R.head;
    add(H, ball(THREE, 1, skin, 0.094, 0.112, 0.104), 0, 0.01, 0);
    add(H, ball(THREE, 1, skin, 0.07, 0.06, 0.075), 0, -0.05, 0.035);
    const hb = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.017, 10, 40), band);
    hb.rotation.x = Math.PI / 2 - 0.12; hb.scale.set(0.98, 1.06, 1); add(H, hb, 0, 0.04, -0.004);
    for (const sx of [-1, 1]) {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.14, 0.008), band);
      tail.rotation.set(0.45, 0, sx * 0.25); add(H, tail, sx * 0.025, -0.03, -0.12);
    }
    mk('headM', H, 0, 0.01, 0, 0.105);

    // arms
    for (const s of ['L', 'R']) {
      const sx = s === 'L' ? 1 : -1;
      const sh = node('sh' + s, C, sx * 0.2, 0.235, -0.01, 'XYZ'); R['sh' + s] = sh;
      add(sh, ball(THREE, 0.07, skin, 1.0, 0.95, 1.0), sx * 0.012, -0.01, 0);
      add(sh, lathe(THREE, L.ua, [[0, 0.052], [0.3, 0.058], [0.5, 0.055], [0.85, 0.043], [1, 0.039]], skin), 0, 0, 0);
      add(sh, ball(THREE, 1, skin, 0.042, 0.075, 0.045), 0, -0.14, 0.03); // bicep
      mk('sh' + s + 'M', sh, 0, 0, 0, 0.07);
      const el = node('el' + s, sh, 0, -L.ua, 0, 'XYZ'); R['el' + s] = el;
      add(el, ball(THREE, 0.041, skin), 0, 0, 0);
      add(el, lathe(THREE, L.fa, [[0, 0.043], [0.22, 0.048], [0.7, 0.034], [1, 0.029]], skin), 0, 0, 0);
      mk('elbow' + s, el, 0, 0, 0, 0.045);
      const wr = node('wr' + s, el, 0, -L.fa, 0, 'XYZ'); R['wr' + s] = wr;
      add(wr, ball(THREE, 1, skin, 0.036, 0.058, 0.024), 0, -0.05, 0);
      add(wr, ball(THREE, 1, skin, 0.014, 0.032, 0.014), sx * 0.03, -0.03, 0.012).rotation.z = sx * 0.5;
      mk('hand' + s, wr, 0, -0.055, 0, 0.035);
    }
    // legs
    for (const s of ['L', 'R']) {
      const sx = s === 'L' ? 1 : -1;
      const hip = node('hip' + s, P, sx * 0.095, -0.03, 0, 'ZYX'); R['hip' + s] = hip;
      add(hip, lathe(THREE, L.thigh, [[0, 0.09], [0.25, 0.094], [0.6, 0.078], [1, 0.056]], skin), 0, 0, 0);
      // shorts leg + stripe
      add(hip, lathe(THREE, 0.2, [[0, 0.104], [1, 0.1]], shorts), 0, 0.02, 0);
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.2, 0.05), stripe); add(hip, st, sx * 0.101, -0.08, 0);
      const kn = node('kn' + s, hip, 0, -L.thigh, 0); R['kn' + s] = kn;
      add(kn, ball(THREE, 0.056, skin), 0, 0, 0.004);
      add(kn, lathe(THREE, L.shin, [[0, 0.052], [0.25, 0.06], [0.7, 0.038], [1, 0.031]], skin), 0, 0, 0).scale.set(1, 1, 1.05);
      add(kn, ball(THREE, 1, skin, 0.048, 0.1, 0.05), 0, -0.13, -0.022); // calf
      mk('knee' + s, kn, 0, 0, 0.01, 0.056);
      const an = node('an' + s, kn, 0, -L.shin, 0); R['an' + s] = an;
      add(an, ball(THREE, 0.034, skin), 0, 0, 0);
      add(an, ball(THREE, 1, skin, 0.043, 0.034, 0.115), 0, -0.04, 0.065);
      add(an, ball(THREE, 0.04, skin, 1, 0.85, 1), 0, -0.035, -0.015);
      mk('ankle' + s, an, 0, 0, 0, 0.045);
      mk('heel' + s, an, 0, -0.035, -0.02, 0.035);
      mk('toe' + s, an, 0, -0.045, 0.16, 0.025);
    }
    R.markers = markers;
    for (const m of markers) R[m.name] = m;
    fig.userData.R = R;
    return fig;
  }

  // ---------- pose math ----------
  const SYM = ['s', 'a', 't', 'e', 'h', 'b', 'r', 'k', 'f', 'z', 'y'];
  const BASE_S = { m: 'S', py: 0.955, pz: 0, px: 0, pit: 0, yaw: 0, sp: 0, spT: 0, spS: 0, nk: 0, zL: 0, zR: 0, xL: 0.12, xR: -0.12, yL: 0, yR: 0, fL: 0, fR: 0, sL: 0, sR: 0, aL: 7, aR: 7, tL: 0, tR: 0, eL: 10, eR: 10 };
  const BASE_F = { m: 'F', pit: 0, spin: 0, yaw: 0, sp: 0, spT: 0, spS: 0, nk: 0, hL: 0, hR: 0, bL: 0, bR: 0, rL: 0, rR: 0, kL: 0, kR: 0, fL: 0, fR: 0, sL: 0, sR: 0, aL: 7, aR: 7, tL: 0, tR: 0, eL: 10, eR: 10 };

  function expand(fr, mode) {
    const o = {};
    for (const k in fr) {
      if (k === 'h' && mode === 'S') continue; // in standing demos h = hold
      if (k === '__mode' || k === 'hh') continue;
      if (SYM.includes(k)) {
        o[k + 'L'] = fr[k];
        o[k + 'R'] = k === 'x' ? -fr[k] : fr[k];
      } else o[k] = fr[k];
    }
    return o;
  }

  // compile demo: inherit fields frame to frame
  function compile(demo) {
    const mode = demo.f[0].m === 'F' ? 'F' : 'S';
    const base = Object.assign({}, mode === 'F' ? BASE_F : BASE_S);
    let cur = Object.assign({}, base);
    const frames = [];
    for (const raw of demo.f) {
      const e = expand(raw, mode);
      const pose = {};
      for (const k in cur) pose[k] = cur[k];
      for (const k in e) if (!['d', 'c', 'w', 'ease', 'sol', 'flat', 'beep'].includes(k)) pose[k] = e[k];
      if ('sol' in e) pose.sol = e.sol; // inherited unless overridden
      if ('flat' in e) pose.flat = e.flat;
      cur = pose;
      frames.push({ d: raw.d || 0, h: (mode === 'F' ? raw.hh : raw.h) || 0, c: raw.c, w: !!raw.w, ease: raw.ease || 'ease', beep: !!raw.beep, pose });
    }
    // timeline
    let t = 0;
    for (const fr of frames) { fr.t0 = t; t += fr.d; fr.t1 = t; t += fr.h; fr.t2 = t; }
    const reset = demo.reset == null ? 0.9 : demo.reset;
    return { frames, total: t + reset, reset, demo };
  }

  const ease = {
    ease: (x) => x * x * (3 - 2 * x),
    fast: (x) => 1 - Math.pow(1 - x, 3),
    lin: (x) => x,
  };
  function lerpPose(a, b, u) {
    const o = {};
    for (const k in b) {
      const va = a[k], vb = b[k];
      o[k] = (typeof va === 'number' && typeof vb === 'number') ? va + (vb - va) * u : vb;
    }
    return o;
  }
  // returns {pose, frameIdx, inReset}
  function sample(C, time) {
    const { frames, total, reset } = C;
    let t = ((time % total) + total) % total;
    const last = frames[frames.length - 1];
    if (t >= last.t2) { // reset to first frame
      const u = reset > 0 ? (t - last.t2) / reset : 1;
      return { pose: lerpPose(last.pose, frames[0].pose, ease.ease(Math.min(1, u))), idx: -1, frame: null };
    }
    for (let i = 0; i < frames.length; i++) {
      const fr = frames[i];
      if (t < fr.t2) {
        if (t >= fr.t1 || i === 0) return { pose: fr.pose, idx: i, frame: fr };
        const prev = frames[i - 1].pose;
        const u = fr.d > 0 ? (t - fr.t0) / fr.d : 1;
        return { pose: lerpPose(prev, fr.pose, ease[fr.ease](u)), idx: i, frame: fr };
      }
    }
    return { pose: last.pose, idx: frames.length - 1, frame: last };
  }

  const tmpV = () => new (T().Vector3)();
  function wpos(o, v) { o.getWorldPosition(v); return v; }

  function applyPose(fig, p, ctx) {
    const R = fig.userData.R;
    const THREE = T();
    fig.rotation.y = (p.yaw || 0) * D2R;
    R.abd.rotation.set(p.sp * 0.5 * D2R, p.spT * 0.5 * D2R, p.spS * 0.5 * D2R);
    R.chest.rotation.set(p.sp * 0.5 * D2R, p.spT * 0.5 * D2R, p.spS * 0.5 * D2R);
    R.neck.rotation.set(p.nk * D2R, 0, 0);
    for (const s of ['L', 'R']) {
      const sd = s === 'L' ? 1 : -1;
      R['sh' + s].rotation.set(-p['s' + s] * D2R, p['t' + s] * sd * D2R, p['a' + s] * sd * D2R);
      R['el' + s].rotation.set(-p['e' + s] * D2R, 0, 0);
    }
    R.spin.rotation.set(0, (p.spin || 0) * D2R, 0);
    R.tilt.rotation.set(p.pit * D2R, 0, 0);

    if (p.m === 'S') {
      R.root.position.set(p.px, p.py, p.pz);
      fig.updateMatrixWorld(true);
      const inv = new THREE.Matrix4();
      for (const s of ['L', 'R']) {
        const hip = R['hip' + s];
        // target ankle in fig space -> pelvis space
        const fdeg = p['f' + s];
        const ay = 0.07 + 0.16 * Math.sin(Math.max(0, fdeg) * D2R) + p['y' + s];
        const tgt = new THREE.Vector3(p['x' + s], ay, p['z' + s]);
        fig.localToWorld(tgt);
        inv.copy(R.pelvis.matrixWorld).invert();
        tgt.applyMatrix4(inv);
        tgt.sub(hip.position);
        const x = tgt.x, y = tgt.y, z = tgt.z;
        const b = Math.atan2(x, -y);
        const dyE = Math.sqrt(x * x + y * y);
        let d = Math.sqrt(dyE * dyE + z * z);
        d = Math.min(d, L.thigh + L.shin - 1e-4);
        const phi = Math.atan2(z, dyE); // angle forward (we use rotation.x = -angle)
        const al = Math.acos(Math.min(1, Math.max(-1, (L.thigh * L.thigh + d * d - L.shin * L.shin) / (2 * L.thigh * d))));
        const be = Math.acos(Math.min(1, Math.max(-1, (L.shin * L.shin + d * d - L.thigh * L.thigh) / (2 * L.shin * d))));
        // rotation.x = θ gives direction z=-sinθ -> forward needs negative θ
        const thighX = -(phi + al);
        const kneeX = al + be;
        hip.rotation.set(thighX, 0, b);
        R['kn' + s].rotation.set(kneeX, 0, 0);
        const footWorld = fdeg * D2R; // desired foot pitch relative to fig
        R['an' + s].rotation.set(footWorld - (p.pit * D2R + thighX + kneeX), 0, 0);
      }
      fig.updateMatrixWorld(true);
      groundFig(fig, ctx && ctx.groundY);
    } else {
      for (const s of ['L', 'R']) {
        const sd = s === 'L' ? 1 : -1;
        R['hip' + s].rotation.set(-p['h' + s] * D2R, p['r' + s] * sd * D2R, p['b' + s] * sd * D2R);
        R['kn' + s].rotation.set(p['k' + s] * D2R, 0, 0);
      }
      setFeet(R, p);
      R.root.position.set(0, 0, 0);
      fig.updateMatrixWorld(true);
      if (p.sol) solve(fig, p);
      // grounding / anchoring
      const an = ctx && ctx.anchor;
      if (an && an.y != null) {
        const v = wpos(R[an.m], tmpV()); fig.worldToLocal(v);
        R.root.position.y += an.y - v.y;
        fig.updateMatrixWorld(true);
      } else groundFig(fig, ctx && ctx.groundY);
      if (an) {
        const v = wpos(R[an.m], tmpV()); fig.worldToLocal(v);
        R.root.position.x += an.x - v.x; R.root.position.z += an.z - v.z;
        fig.updateMatrixWorld(true);
      }
    }
  }
  function setFeet(R, p) {
    for (const s of ['L', 'R']) {
      let fx = p['f' + s] * D2R;
      const flat = p.flat === 1 || p.flat === s;
      if (flat) {
        // make foot level with floor: total pitch along chain -> 0 (spin assumed 0)
        const tot = p.pit - p['h' + s] + p['k' + s];
        fx = -tot * D2R + p['f' + s] * D2R;
      }
      R['an' + s].rotation.set(fx, 0, 0);
    }
  }
  function markerBottom(fig, m) {
    const v = wpos(m, tmpV()); fig.worldToLocal(v);
    return v.y - m.userData.r;
  }
  function groundFig(fig, gy) {
    const R = fig.userData.R;
    let min = Infinity;
    for (const m of R.markers) { const b = markerBottom(fig, m); if (b < min) min = b; }
    R.root.position.y += (gy || 0) - min;
    fig.updateMatrixWorld(true);
  }
  function solve(fig, p) {
    const R = fig.userData.R;
    const s = p.sol;
    const read1 = (name) => {
      const m = R[name]; const v = wpos(m, tmpV()); fig.worldToLocal(v);
      return { x: v.x, y: v.y - m.userData.r, z: v.z };
    };
    const read = (n) => {
      if (!Array.isArray(n)) return read1(n);
      let best = null; for (const k of n) { const r = read1(k); if (!best || r.y < best.y) best = r; } return best;
    };
    const ax = s.ax || 'y';
    const v = s.v || 0;
    const setP = (val) => {
      if (s.p === 'pit') R.tilt.rotation.x = val * D2R;
      else if (s.p === 'sp') { R.abd.rotation.x = val * 0.5 * D2R; R.chest.rotation.x = val * 0.5 * D2R; }
      if (s.p === 'pit') setFeet(R, Object.assign({}, p, { pit: val }));
      fig.updateMatrixWorld(true);
      const A = read(s.a), B = read(s.b);
      return (A[ax] - B[ax]) - v;
    };
    let lo = s.lo, hi = s.hi;
    let flo = setP(lo), fhi = setP(hi);
    if (flo * fhi > 0) { // no sign change: pick closest
      setP(Math.abs(flo) < Math.abs(fhi) ? lo : hi); return;
    }
    for (let i = 0; i < 28; i++) {
      const mid = (lo + hi) / 2; const fm = setP(mid);
      if (fm * flo <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
    }
    setP((lo + hi) / 2);
  }

  // ---------- stage ----------
  function gradTex(THREE, w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }

  function Player(canvas, hud) {
    const THREE = T();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    const scene = new THREE.Scene();
    scene.background = gradTex(THREE, 512, 512, (g, w, h) => {
      const gr = g.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.55, w * 0.75);
      gr.addColorStop(0, '#163456'); gr.addColorStop(0.45, '#0a1a2e'); gr.addColorStop(1, '#03070d');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    scene.fog = new THREE.Fog(new THREE.Color(0x050c16).convertSRGBToLinear(), 5, 13);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 50);

    scene.add(new THREE.HemisphereLight(0x8fb4e8, 0x05070a, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(2.2, 4, 3); scene.add(key);
    const rimA = new THREE.DirectionalLight(0x2f86ff, 2.2); rimA.position.set(-3, 2.5, -3); scene.add(rimA);
    const rimB = new THREE.DirectionalLight(0x3aa0ff, 1.6); rimB.position.set(3, 1.5, -3.5); scene.add(rimB);
    const fill = new THREE.PointLight(0x4f8cff, 0.6, 8); fill.position.set(0, 0.4, 2.2); scene.add(fill);

    // reflective floor (mirror figure under a translucent glossy floor)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(0x07111d).convertSRGBToLinear(), roughness: 0.32, metalness: 0.4, transparent: true, opacity: 0.82 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const glow = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.31, 96), new THREE.MeshBasicMaterial({ color: 0x2b8cff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = 0.003; scene.add(glow);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshBasicMaterial({
      map: gradTex(THREE, 256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(40,120,255,0)'); gr.addColorStop(0.75, 'rgba(40,130,255,0.18)'); gr.addColorStop(1, 'rgba(40,130,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.002; scene.add(halo);
    // mat
    const mat = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.012, 1.9), new THREE.MeshStandardMaterial({ color: new THREE.Color(0x0e3437).convertSRGBToLinear(), roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.9 }));
    mat.position.y = 0.006; scene.add(mat);
    // blob shadow
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
      map: gradTex(THREE, 128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
      transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.014; scene.add(shadow);
    // smoke
    const smokeTex = gradTex(THREE, 256, 256, (g, w, h) => {
      for (let i = 0; i < 26; i++) { const x = w * (0.2 + Math.random() * 0.6), y = h * (0.2 + Math.random() * 0.6), r = w * (0.12 + Math.random() * 0.22); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(120,160,220,0.10)'); gr.addColorStop(1, 'rgba(120,160,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    });
    const smokes = [];
    for (let i = 0; i < 6; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      sp.scale.set(4.5, 3, 1); sp.position.set(-3 + i * 1.2, 1 + (i % 2) * 0.8, -3.6 - (i % 3) * 0.5); scene.add(sp); smokes.push(sp);
    }

    const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
    const mk = (c, r, m, o) => { const oo = Object.assign({}, o || {}); if (oo.emissive != null) oo.emissive = lin(oo.emissive); return new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: r, metalness: m }, oo)); };
    const matsTop = { skin: mk(0x3a414c, 0.38, 0.42), shorts: mk(0x0b0d11, 0.75, 0.1), band: mk(0x1f6dff, 0.35, 0.2, { emissive: 0x0b2a70, emissiveIntensity: 0.9 }), white: mk(0xe9eef5, 0.5, 0.05), stripe: mk(0x2a7bff, 0.4, 0.1, { emissive: 0x0b2a70, emissiveIntensity: 0.7 }) };
    const dim = (m) => { const c = m.clone(); c.color.multiplyScalar(0.45); if (c.emissive) c.emissive.multiplyScalar(0.5); return c; };
    const matsMir = {}; for (const k in matsTop) matsMir[k] = dim(matsTop[k]);
    const fig = buildFigure(matsTop); scene.add(fig);
    const mirWrap = new THREE.Group(); mirWrap.scale.y = -1; scene.add(mirWrap);
    const mir = buildFigure(matsMir); mirWrap.add(mir);
    const nodesA = [], nodesB = [];
    fig.traverse((o) => { if (!o.isMesh) nodesA.push(o); });
    mir.traverse((o) => { if (!o.isMesh) nodesB.push(o); });

    // props
    const propGroup = new THREE.Group(); scene.add(propGroup);
    const propMat = mk(0x1b2633, 0.6, 0.2);
    const propMatHi = mk(0x22364d, 0.45, 0.3);
    function buildProps(demo, C) {
      while (propGroup.children.length) propGroup.remove(propGroup.children[0]);
      mat.visible = demo.mat !== false;
      for (const pr of (demo.props || [])) {
        // position may come from a marker at a frame
        let px = 0, py = 0, pz = 0;
        if (pr.at) {
          const fr = C.frames[pr.frame || 0];
          applyPose(fig, fr.pose, ctxFor(C, fr.pose));
          const v = wpos(fig.userData.R[pr.at], tmpV()); fig.worldToLocal(v);
          const r = fig.userData.R[pr.at].userData.r;
          px = v.x; py = v.y; pz = v.z + (pr.dz || 0) + (pr.side ? pr.side * r : 0);
        }
        if (pr.z != null) pz = pr.z;
        if (pr.type === 'wall') {
          const w = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 0.08), propMat);
          w.position.set(0, 1.2, pz + (pr.face < 0 ? -0.04 : 0.04)); propGroup.add(w);
        } else if (pr.type === 'table') {
          const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.85), propMatHi);
          const ty = py + 0.02;
          top.position.set(0, ty, pz - 0.41); propGroup.add(top);
          for (const lx of [-0.55, 0.55]) for (const lz of [-0.8, -0.04]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, ty, 0.05), propMat); leg.position.set(lx, ty / 2, pz + lz); propGroup.add(leg);
          }
        } else if (pr.type === 'door') {
          for (const sx of [-1, 1]) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.2, 0.14), propMatHi);
            post.position.set(sx * (Math.abs(px) + 0.07), 1.1, pz); propGroup.add(post);
          }
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.09, 0.14), propMatHi); lintel.position.set(0, 2.2, pz); propGroup.add(lintel);
        }
      }
    }
    function ctxFor(C, pose) { return { anchor: C.anchor || null, groundY: 0.012 }; }

    let C = null, time = 0, playing = true, speed = 1, last = 0, raf = 0;
    let az = 50, el = 10, dist = 3.5, ty = 0.8, userAz = 0, userEl = 0;
    let lastCap = null;

    function setDemo(demo) {
      C = compile(demo);
      C.anchor = null;
      if (C.frames[0].pose.m === 'F') {
        // anchor: keep the named contact fixed; place body centred at frame 0
        const anName = demo.anchor || 'pelvisM';
        C.anchor = null;
        applyPose(fig, C.frames[0].pose, { groundY: 0.012 });
        const R = fig.userData.R;
        const pv = wpos(R.pelvisM, tmpV()); fig.worldToLocal(pv);
        const av = wpos(R[anName], tmpV()); fig.worldToLocal(av);
        const cz = demo.center || 0;
        C.anchor = { m: anName, x: av.x - pv.x, z: av.z - pv.z + cz, y: demo.anchorY != null ? demo.anchorY : null };
        if (demo.anchorAt) { C.anchor.x = demo.anchorAt[0]; C.anchor.z = demo.anchorAt[1]; }
      }
      const cam = demo.cam || (C.frames[0].pose.m === 'F' ? [65, 16, 3.2, 0.35] : [50, 8, 3.8, 0.85]);
      [az, el, dist, ty] = cam; userAz = 0; userEl = 0;
      buildProps(demo, C);
      time = 0; lastCap = null;
      render(true);
    }
    function render(force) {
      if (!C) return;
      const s = sample(C, time);
      applyPose(fig, s.pose, ctxFor(C, s.pose));
      // mirror copy
      for (let i = 0; i < nodesA.length; i++) { nodesB[i].position.copy(nodesA[i].position); nodesB[i].quaternion.copy(nodesA[i].quaternion); }
      // shadow follows pelvis
      const pv = wpos(fig.userData.R.pelvisM, tmpV());
      shadow.position.x = pv.x; shadow.position.z = pv.z;
      const lying = Math.abs(Math.cos(s.pose.pit * D2R)) < 0.6;
      shadow.scale.set(lying ? 0.9 : 0.85, lying ? 1.9 : 0.85, 1);
      // wrong tint
      const wrong = s.frame && s.frame.w;
      rimA.color.set(wrong ? 0xff3344 : 0x2f86ff); rimB.color.set(wrong ? 0xff5566 : 0x3aa0ff);
      glow.material.color.set(wrong ? 0xff3344 : 0x2b8cff);
      // camera
      const A = (az + userAz) * D2R, E = Math.max(-5, Math.min(70, el + userEl)) * D2R;
      camera.position.set(Math.sin(A) * Math.cos(E) * dist, ty + Math.sin(E) * dist, Math.cos(A) * Math.cos(E) * dist);
      camera.lookAt(0, ty, 0);
      for (let i = 0; i < smokes.length; i++) smokes[i].position.x = -3 + i * 1.2 + Math.sin(time * 0.15 + i) * 0.4;
      renderer.render(scene, camera);
      // HUD
      if (hud) {
        const cap = s.frame ? (s.frame.c || '') : '';
        const key = cap + '|' + (wrong ? 1 : 0);
        if (key !== lastCap) { lastCap = key; hud.caption(cap, wrong, s.frame && s.frame.beep); }
        hud.progress(((time % C.total) + C.total) % C.total / C.total);
      }
    }
    function loop(ts) {
      raf = requestAnimationFrame(loop);
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts;
      if (playing) time += dt * speed;
      render();
    }
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    // drag to rotate
    let drag = null;
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, az: userAz, el: userEl }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!drag) return; userAz = drag.az - (e.clientX - drag.x) * 0.4; userEl = drag.el + (e.clientY - drag.y) * 0.25; });
    canvas.addEventListener('pointerup', () => { drag = null; });
    canvas.addEventListener('pointercancel', () => { drag = null; });

    return {
      setDemo, resize,
      start() { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } },
      stop() { cancelAnimationFrame(raf); raf = 0; },
      play(v) { playing = v; }, isPlaying: () => playing,
      setSpeed(v) { speed = v; },
      restart() { time = 0; },
      seek(t) { time = t; render(); },
      total: () => (C ? C.total : 0),
      renderAt(t) { time = t; render(true); },
      frameTimes: () => (C ? C.frames.map((f) => (f.t1 + f.t2) / 2) : []),
    };
  }

  window.DemoEngine = { Player, compile };
})();

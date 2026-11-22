/* App: views, saved data, logging, and the adaptation rules (Section 9). */
(function () {
  const P = window.PLAN;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  const fmtDate = (s) => { if (!s) return 'Date not recovered'; const d = new Date(s + 'T12:00:00'); return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); };
  const DEFAULT_STEPS = { push: 1, pull: 0, legs: 0, core: 0, power: 0 }; // step_index (0-based)
  const LADDER_KEYS = ['push', 'pull', 'legs', 'core', 'power'];
  const SN = (i) => i + 1; // steps are shown counting from 1 (your saved data uses this)
  const SNOF = (k) => ' of ' + P.LADDERS[k].steps.length;

  // ---------------- store ----------------
  const COLS = ['plan', 'ladders', 'logs', 'checks', 'changes', 'fit', 'body'];
  const S = { data: {}, mode: 'loading', canWrite: true, loaded: {}, slow: false };
  COLS.forEach((c) => (S.data[c] = {}));
  let db = null;

  async function initStore() {
    const c = window.claude;
    try { db = c && c.use ? await c.use('db') : null; } catch (e) { db = null; }
    if (db) {
      S.mode = 'db';
      try {
        const u = await c.use('user');
        if (u) { const w = await u.can('data.write'); if (w === false) S.canWrite = false; }
      } catch (e) { /* keep inputs */ }
      const timer = setTimeout(() => { if (Object.keys(S.loaded).length < COLS.length) { S.slow = true; render(); } }, 10000);
      for (const col of COLS) {
        db.collection(col).onSnapshot((snap) => {
          const m = {}; snap.docs.forEach((d) => { m[d.id] = d.data(); });
          S.data[col] = m;
          if (!snap.metadata.fromCache) S.loaded[col] = true;
          if (Object.keys(S.loaded).length === COLS.length) { clearTimeout(timer); S.slow = false; }
          scheduleRender();
        }, (err) => { S.err = err && err.code; scheduleRender(); });
      }
    } else {
      S.mode = 'local';
      try { const raw = localStorage.getItem('jc-data'); if (raw) { const o = JSON.parse(raw); COLS.forEach((c) => (S.data[c] = o[c] || {})); } } catch (e) { }
      COLS.forEach((c) => (S.loaded[c] = true));
      render();
    }
  }
  const writeQueue = {};
  async function put(col, id, obj) {
    if (S.mode === 'db') {
      const key = col + '/' + id;
      const prev = writeQueue[key] || Promise.resolve();
      const p = prev.then(() => db.collection(col).doc(id).set(obj)).catch((e) => { toast('Could not save (' + (e && e.code) + '). Try again.'); throw e; });
      writeQueue[key] = p.catch(() => { });
      S.data[col][id] = obj; // optimistic
      return p;
    }
    S.data[col][id] = obj;
    try { localStorage.setItem('jc-data', JSON.stringify(S.data)); } catch (e) { }
    scheduleRender();
  }
  let rq = 0;
  function scheduleRender() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; render(); }); }

  // ---------------- derived ----------------
  const profile = () => S.data.plan.profile || null;
  const ladderState = (k) => S.data.ladders[k] || { step: DEFAULT_STEPS[k], history: [], fallback: true };
  const stepOf = (k) => { const st = ladderState(k).step; return Math.max(0, Math.min(P.LADDERS[k].steps.length - 1, st)); };
  const curEx = (k) => P.LADDERS[k].steps[stepOf(k)];
  const logsSorted = () => Object.entries(S.data.logs).map(([id, l]) => Object.assign({ id }, l))
    .sort((a, b) => (a.createdAt || a.date || '').localeCompare(b.createdAt || b.date || ''));
  const realLogs = () => logsSorted().filter((l) => !l.seeded && l.type !== 'walk');
  function entriesFor(pred) {
    const out = [];
    for (const l of realLogs()) for (const e of (l.entries || [])) if (pred(e, l)) out.push(Object.assign({ date: l.date, logId: l.id }, e));
    return out;
  }
  const changesSorted = () => Object.entries(S.data.changes).map(([id, c]) => Object.assign({ id }, c)).sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  function weekNum() { const p = profile(); const st = (p && p.start) || '2026-11-19'; return Math.floor(daysBetween(st, todayStr()) / 7) + 1; }
  const noProne = () => !!(profile() && profile().noProne);
  const userSwaps = () => (profile() && profile().swaps) || {};
  const swapEx = (ex) => {
    let e = ex, guard = 0;
    while (guard++ < 4) { const s = userSwaps()[e.id]; if (s && P.EX[s.to]) e = P.EX[s.to]; else break; }
    return noProne() && P.PRONE_SWAP[e.id] ? P.EX[P.PRONE_SWAP[e.id]] : e;
  };
  // The day's exercises in order, with rib-safe swaps applied and duplicates removed.
  function dayList(day) {
    const out = []; const seen = new Set();
    for (const it of P.DAYS[day].items) {
      if (it.flow) { out.push({ flow: true }); continue; }
      const list = it.big3 ? P.BIG3.map((b) => ({ ex: b, big3: true })) : [{ ex: it.lad ? curEx(it.lad) : P.EX[it.ex] }];
      for (const x of list) {
        const ex = swapEx(x.ex); if (seen.has(ex.id)) continue; seen.add(ex.id);
        // carry anything already typed on the original card over to the swapped one
        if (ex !== x.ex && draft.items && draft.items[x.ex.id] && !draft.items[ex.id]) { draft.items[ex.id] = draft.items[x.ex.id]; saveDraft(); }
        out.push({ ex, big3: x.big3, swapped: ex !== x.ex, orig: x.ex });
      }
    }
    return out;
  }
  function inDeload() { const p = profile(); return !!(p && p.deloadUntil && p.deloadUntil >= todayStr()); }
  function suggestDay() {
    const ls = logsSorted().filter((l) => l.day);
    const last = ls[ls.length - 1];
    if (!last) return 'A';
    return { A: 'B', B: 'C', C: 'A' }[last.day] || 'A';
  }
  function lastSessionDate() { const ls = logsSorted().filter((l) => l.date && l.type !== 'walk'); return ls.length ? ls[ls.length - 1].date : null; }

  // ---------------- adaptation (Section 9) ----------------
  function setsTarget(ex) { return inDeload() ? Math.ceil(ex.sets / 2) : ex.sets; }
  function aimFor(ex) {
    // last entry for this exercise -> +1 on weakest set (or the range bottom)
    const prev = entriesFor((e) => e.ex === ex.id && e.completed !== false).pop();
    const n = setsTarget(ex);
    const lo = ex.reps[0], hi = ex.reps[1];
    if (!prev || !prev.sets || !prev.sets.length) return Array(n).fill(lo);
    const a = prev.sets.slice(0, n); while (a.length < n) a.push(a[a.length - 1] || lo);
    let wi = 0; a.forEach((v, i) => { if (v < a[wi]) wi = i; });
    const out = a.map((v) => Math.min(hi, Math.max(lo, v)));
    if (out[wi] < hi) out[wi] = Math.min(hi, out[wi] + 1);
    return out;
  }
  function rangeTxt(ex) { return ex.reps[0] === ex.reps[1] ? String(ex.reps[0]) : ex.reps[0] + '–' + ex.reps[1]; }
  function unitTxt(u) { return { 'reps': 'reps', 'reps/leg': 'reps per leg', 'reps/side': 'reps per side', 'holds/side': 'holds per side', 'holds': 'holds', 'sec': 'sec', 'sec/leg': 'sec per leg' }[u] || u; }

  // Evaluate one ladder after a session. Returns {msgs:[], newStep, hold}
  function evaluateLadder(k, entry) {
    const L = ladderState(k); const step = stepOf(k); const ex = P.LADDERS[k].steps[step];
    const name = ex.name; const msgs = [];
    const top = ex.reps[1], bottom = ex.reps[0];
    const sets = entry.sets || [];
    const nT = ex.sets;
    const prevAtStep = entriesFor((e) => e.ladder === k && e.step === step && e.ex === ex.id && e.completed !== false);
    // prevAtStep already excludes this entry (not saved yet)
    const prev = prevAtStep[prevAtStep.length - 1];
    const stepDown = (why) => {
      if (step === 0) { msgs.push(why + ' You are on the first step, so swap to the substitute for this pattern (see How To) or skip it this week.'); return { msgs, newStep: step }; }
      const nx = P.LADDERS[k].steps[step - 1];
      msgs.push(why + ' Next time you drop to Step ' + SN(step - 1) + ': ' + nx.name + '.');
      return { msgs, newStep: step - 1 };
    };
    if (inDeload()) { msgs.push(name + ': deload week — level held. Stop with 4+ reps left.'); return { msgs, newStep: step }; }
    // 1. pain first
    if (entry.pain >= 6) return stepDown(name + ': pain ' + entry.pain + '/10 is RED.');
    if (entry.pain >= 4) {
      const amberAgain = prev && prev.pain >= 4 && prev.pain <= 5;
      msgs.push(name + ': pain ' + entry.pain + '/10 is AMBER — hold. Same level and reps next time.' + (amberAgain ? ' Amber twice in a row: cut reps or range about 25% next time.' : ''));
      return { msgs, newStep: step };
    }
    // 2. form
    if (entry.form === false) return stepDown(name + ': form broke.');
    // 3. reps + feedback
    const enough = sets.length >= nT;
    const allTop = enough && sets.slice(0, nT).every((r) => r >= top);
    const someTop = sets.some((r) => r >= top);
    const missedSets = sets.filter((r) => r < bottom).length;
    const maxMiss = sets.length ? Math.max(0, bottom - Math.min(...sets)) : 0;
    const good = entry.rating === 'easy' || entry.rating === 'right';
    const prevTop = prev && prev.sets && prev.sets.length >= nT && prev.sets.slice(0, nT).every((r) => r >= top) && (prev.rating === 'easy' || prev.rating === 'right') && prev.form !== false && (prev.pain || 0) <= 3;
    if (entry.rating === 'hard') {
      if (maxMiss >= 3 || missedSets >= 2) {
        const r = stepDown(name + ': too hard — missed the target by ' + maxMiss + ' rep' + (maxMiss === 1 ? '' : 's') + (missedSets >= 2 ? ' on ' + missedSets + ' sets' : '') + '.');
        if (prev && prev.rating === 'hard' && L.history && L.history.length && L.history[L.history.length - 1].dir === 'down') r.msgs.push('Too hard two sessions in a row at the easier level: hold here a full week, check sleep and soreness, and consider a deload.');
        return r;
      }
      msgs.push(name + ': too hard, but close (missed by ' + maxMiss + '). Same level, same target next time — no step down for one hard set.');
      if (prev && prev.rating === 'hard' && L.history && L.history.length && L.history[L.history.length - 1].dir === 'down') msgs.push('Too hard two sessions in a row at the easier level: hold a full week, check sleep and soreness, and consider a deload.');
      return { msgs, newStep: step };
    }
    if (allTop && good && entry.pain <= 3) {
      if (L.hold) { msgs.push(name + ': top of range, but your next-morning check said hold. Level held one more session.'); return { msgs, newStep: step, clearHold: true }; }
      if (prevTop && step < P.LADDERS[k].steps.length - 1) {
        const nx = P.LADDERS[k].steps[step + 1];
        if (nx.gate) { msgs.push(name + ': top of range 2 sessions in a row — you earned Step ' + SN(step + 1) + ' (' + nx.name + '), but it has a gate: ' + nx.gate + ' Use “Move up” in Me when you meet it.'); return { msgs, newStep: step }; }
        msgs.push(name + ': top of the range on every set, 2 sessions in a row, form clean, pain green — you move up to Step ' + SN(step + 1) + ': ' + nx.name + '.');
        return { msgs, newStep: step + 1 };
      }
      if (step === P.LADDERS[k].steps.length - 1) { msgs.push(name + ': top of range — you are at the top of this ladder. Add a slower tempo or a pause at the hardest point.'); return { msgs, newStep: step }; }
      msgs.push(name + ': top of the range on every set' + (entry.rating === 'easy' ? ' and too easy' : '') + '. One more session like this and it moves up.' + (entry.rating === 'easy' && top > bottom ? ' Next time aim for +2 reps per set if you can.' : ''));
      return { msgs, newStep: step };
    }
    if (entry.rating === 'easy') {
      if (someTop) msgs.push(name + ': too easy, top on some sets. Add 1–2 reps to the weakest set(s) next time.');
      else msgs.push(name + ': felt too easy, but reps were below the top of the range. In weeks 1–4 your logged reps count more than the feel — aim for +1–2 reps on the weakest set.');
      return { msgs, newStep: step };
    }
    msgs.push(name + ': just right — keep this level. Aim for +1 rep on your weakest set next time.');
    return { msgs, newStep: step };
  }

  // ---------------- draft (unsent log) ----------------
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem('jc-draft') || '{}') || {}; } catch (e) { draft = {}; }
  const saveDraft = () => { try { localStorage.setItem('jc-draft', JSON.stringify(draft)); } catch (e) { } };
  const D = (id) => (draft.items = draft.items || {}, draft.items[id] = draft.items[id] || { sets: [], pain: null, rating: null, form: true }, draft.items[id]);

  // ---------------- UI helpers ----------------
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3600); }
  function ladderDots(k) {
    const n = P.LADDERS[k].steps.length, st = stepOf(k);
    let h = '<span class="dots" aria-label="Step ' + SN(st) + ' of ' + n + '">';
    for (let i = 0; i < n; i++) h += '<i class="' + (i < st ? 'done' : i === st ? 'on' : '') + '"></i>';
    return h + '</span>';
  }
  function restChips(r) {
    if (!r) return '';
    return '<div class="rest"><div><b>Between reps</b><span>' + esc(r.reps) + '</span></div><div><b>Between sets</b><span>' + esc(r.sets) + '</span></div><div><b>Before next exercise</b><span>' + esc(r.next) + '</span></div></div>';
  }
  function demoBtn(id, label) { return '<button class="demo-btn" data-demo="' + esc(id) + '" type="button"><span class="play"></span>' + esc(label || 'Watch 1 rep') + '</button>'; }
  function setupLine(ex) {
    const n = window.DEMO_NOTES && window.DEMO_NOTES[ex.demo];
    if (!n || !n.setup) return '';
    const cap = (t) => t.toLowerCase().replace(/(^|·\s*|-\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());
    return '<p class="setup"><b>Setup:</b> ' + n.setup.map((t) => esc(cap(t))).join(' · ') + '</p>';
  }
  function cueList(ex) { return setupLine(ex) + '<ul class="cues">' + (ex.cues || []).map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul><p class="breath"><b>Breathing:</b> ' + esc(P.breathFor(ex)) + '</p>'; }
  function doseLine(ex) {
    if (ex.dose) return esc(ex.dose);
    const sl = ex.setsLabel || ex.sets;
    return (inDeload() && ex.ladder ? Math.ceil(ex.sets / 2) + ' sets (deload)' : sl + ' sets') + ' · ' + rangeTxt(ex) + ' ' + unitTxt(ex.unit) + (ex.perLabel ? ' · ' + esc(ex.perLabel) : '');
  }

  // ---------------- views ----------------
  const TABS = [['today', 'Today'], ['howto', 'How To'], ['power', 'Speed & Power'], ['mobility', 'Mobility'], ['tendons', 'Tendons'], ['log', 'Log'], ['works', 'What Works'], ['me', 'Me']];
  let tab = (location.hash || '#today').slice(1); if (!TABS.some((t) => t[0] === tab)) tab = 'today';
  let selDay = null;
  let lastResult = null; // messages from the last finish

  function render() {
    const active = document.activeElement;
    if (active && active.closest && active.closest('#view') && /INPUT|TEXTAREA|SELECT/.test(active.tagName)) { render.pending = true; return; }
    $('#tabs').innerHTML = TABS.map(([k, n]) => '<a href="#' + k + '" class="' + (k === tab ? 'on' : '') + '">' + n + '</a>').join('');
    $('#status').innerHTML = statusLine();
    const v = { today: vToday, howto: vHowTo, power: vPower, mobility: vMobility, tendons: vTendons, log: vLog, works: vWorks, me: vMe }[tab];
    $('#view').innerHTML = v();
    const hd = document.querySelector('header.top'); if (hd) document.documentElement.style.setProperty('--hdr', hd.offsetHeight + 'px');
    if (tab === 'today') initDeck();
  }
  // Swipe deck: one exercise per screen
  let deckIdx = 0; try { deckIdx = Number(sessionStorage.getItem('jc-deck') || 0) || 0; } catch (e) { }
  function initDeck() {
    const deck = $('#deck'); if (!deck) return;
    const slides = [...deck.querySelectorAll('.slide')]; if (!slides.length) return;
    deckIdx = Math.max(0, Math.min(slides.length - 1, deckIdx));
    const fit = () => { const s = slides[deckIdx]; if (s) deck.style.height = s.offsetHeight + 'px'; };
    const mark = () => {
      deckIdx = Math.max(0, Math.min(slides.length - 1, deckIdx)); if (!slides[deckIdx] || !slides[deckIdx].isConnected) return;
      $('#deckpos').textContent = (deckIdx + 1) + ' of ' + slides.length;
      const h3 = slides[deckIdx].querySelector('h3'); $('#deckname').textContent = h3 ? h3.textContent : '';
      document.querySelectorAll('.dots2 i').forEach((d, i) => { d.className = i === deckIdx ? 'on' : (isLogged(slides[i]) ? 'done' : ''); });
      try { sessionStorage.setItem('jc-deck', String(deckIdx)); } catch (e) { }
      fit();
    };
    deck.scrollLeft = deckIdx * deck.clientWidth;
    deck._mark = mark;
    mark();
    let t = 0;
    deck.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { if (!deck.isConnected || !deck.clientWidth) return; const i = Math.max(0, Math.min(slides.length - 1, Math.round(deck.scrollLeft / deck.clientWidth))); if (i !== deckIdx) { deckIdx = i; mark(); } }, 80); }, { passive: true });
    if (!window.__deckFit) { window.__deckFit = true; window.addEventListener('resize', () => { const d = $('#deck'); if (d && d._mark) d._mark(); }); }
    deck.addEventListener('input', fit); deck.addEventListener('click', () => setTimeout(fit, 0));
  }
  function isLogged(slide) {
    const card = slide.querySelector('[data-ex]'); if (!card) return false;
    const d = draft.items && draft.items[card.dataset.ex];
    return !!(d && ((d.sets || []).some((v) => v != null && v !== '') || d.skipped || d.done));
  }
  function goSlide(i) {
    const deck = $('#deck'); if (!deck) return;
    if (i === 'finish') { const f = $('#finish'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    deckIdx = Number(i); deck.scrollTo({ left: deckIdx * deck.clientWidth, behavior: 'smooth' }); if (deck._mark) deck._mark();
    const bar = $('#deckbar'), hd = document.querySelector('header.top');
    const y = deck.getBoundingClientRect().top + window.scrollY - ((hd ? hd.offsetHeight : 90) + (bar ? bar.offsetHeight : 50) + 8);
    if (Math.abs(window.scrollY - y) > 4) window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function statusLine() {
    if (S.mode === 'loading') return '<span class="pill">Loading your plan…</span>';
    if (S.mode === 'local') return '<span class="pill amber">Saving on this device only — open this plan on claude.ai while signed in to save to your plan.</span>';
    if (S.err) return '<span class="pill red">Your saved data could not be reached (' + esc(S.err) + '). Nothing is lost — reload later.</span>';
    if (S.slow) return '<span class="pill amber">Your saved data can’t be reached yet. Showing what’s loaded.</span>';
    if (!S.canWrite) return '<span class="pill">View only — you can’t log on this copy.</span>';
    const n = realLogs().length + logsSorted().filter((l) => l.seeded).length;
    return '<span class="pill ok">Saved to your plan · ' + n + ' workouts logged</span>';
  }

  function vToday() {
    const day = selDay || suggestDay();
    const DY = P.DAYS[day];
    const last = lastSessionDate();
    const gap = last ? daysBetween(last, todayStr()) : 99;
    const hr = new Date().getHours();
    let h = '';
    h += '<section class="hero"><div class="eyebrow">Week ' + weekNum() + ' · ' + phaseName() + '</div><h1>Day ' + day + ' <span>' + esc(DY.name) + '</span></h1>';
    h += '<div class="daypick" role="group" aria-label="Pick a day">' + ['A', 'B', 'C'].map((d) => '<button type="button" data-day="' + d + '" class="' + (d === day ? 'on' : '') + '">Day ' + d + (d === suggestDay() ? ' <small>next</small>' : '') + '</button>').join('') + '</div>';
    h += '</section>';
    // alerts
    const alerts = [];
    if (gap < 2 && last) alerts.push(['amber', 'Last workout was ' + (gap === 0 ? 'today' : 'yesterday') + '. Keep 48 hours between hard sessions — today is a good walk + mobility day.']);
    if (hr < 10) alerts.push(['amber', 'Morning: discs are most sensitive 30–60 min after waking. Walk first, train later in the day if you can.']);
    if (inDeload()) alerts.push(['teal', 'DELOAD WEEK: same days, same exercises, about half the sets, same level. Stop with 4+ reps left.']);
    else if (weekNum() >= 6 && !(profile() && profile().deloads && profile().deloads.length)) alerts.push(['teal', 'Week ' + weekNum() + ': a deload week is due (every 6–8 weeks). Start it in Me.']);
    for (const msg of reactiveWarnings()) alerts.push(['amber', msg]);
    h += alerts.map(([c, m]) => '<div class="alert ' + c + '">' + esc(m) + '</div>').join('');
    h += weekCard(day);
    h += morningCheckCard();
    if (lastResult) h += changedCard(lastResult.msgs, 'What changed and why', true);
    else { const recent = changesSorted().slice(0, 3); if (recent.length) h += changedCard(recent.map((c) => c.text), 'Recent changes', false); }
    h += '<section class="prep"><h2>Before you start</h2><ul><li>Light snack 1–2 hours before — not fasted, not a big meal.</li><li>Sip water. No big gulps mid-workout.</li><li>Power goes first while your legs are fresh. Shaky = stop the power sets.</li><li>Rough day? 1–2 sets still count — beginners gain almost as much from fewer sets.</li><li>Very sore muscles (normal 1–3 days after)? Skip the fast and heavy moves for that area, do the rest, and take an easy walk. Dark urine or swollen, very tender muscles: get checked the same day.</li></ul></section>';
    h += '<div class="warm"><b>Warm-up</b> Mobility Flow 1–5 (about 5 min) <a href="#mobility">Open flow</a></div>';
    let n = 0;
    if (noProne()) h += '<div class="alert teal">No lying face down is on (rib pain): face-down moves are swapped for all-fours or doorway versions. Turn it off in Me when your ribs feel fine.</div>';
    const items = dayList(day);
    const total = items.length;
    let slides = '';
    items.forEach((it, i) => {
      let s = '';
      if (it.flow) s = flowCard(n++);
      else {
        if (it.swapped) s += '<div class="swapnote">Swapped in for ' + esc(it.orig.name) + '</div>';
        s += exCard(it.ex, ++n);
      }
      slides += '<div class="slide" data-i="' + i + '">' + s + '<div class="slidenav"><button type="button" data-go="' + (i - 1) + '"' + (i === 0 ? ' disabled' : '') + '>‹ Back</button>' + (i < total - 1 ? '<button type="button" class="primary" data-go="' + (i + 1) + '">Next exercise ›</button>' : '<button type="button" class="primary" data-go="finish">Finish workout ›</button>') + '</div></div>';
    });
    h += '<div class="deckbar" id="deckbar"><b id="deckpos">1 of ' + total + '</b><span id="deckname"></span><div class="dots2">' + items.map((_, i) => '<i data-dot="' + i + '"></i>').join('') + '</div></div>';
    h += '<div class="deck" id="deck">' + slides + '</div>';
    h += '<p class="fine swipehint">Swipe left / right, or use the buttons.</p>';
    h += walkCard();
    h += '<div class="finish"><button type="button" id="finish" class="primary"' + (S.canWrite ? '' : ' disabled') + '>Finish workout + save</button><p class="fine">Saves your sets, ratings and pain. The plan then adapts: pain first, then form, then reps and feedback.</p></div>';
    h += stopRulesCard(true);
    return h;
  }
  function phaseName() { const w = weekNum(); return w <= 2 ? 'Phase 0 · Tendon prep + learning' : w <= 6 ? 'Phase 1 · Base strength' : w <= 12 ? 'Phase 2 · Harder progressions' : 'Phase 3 · Full progressions + skill'; }
  function changedCard(msgs, title, fresh) {
    return '<section class="changed' + (fresh ? ' fresh' : '') + '"><h2>' + esc(title) + '</h2><ul>' + msgs.map((m) => '<li>' + esc(m) + '</li>').join('') + '</ul>' + (fresh ? '<button type="button" class="link" id="dismiss">Got it</button>' : '') + '</section>';
  }
  function exCard(ex, n) {
    const d = D(ex.id);
    const nSets = ex.ladder ? setsTarget(ex) : ex.sets;
    const aim = ex.ladder ? aimFor(ex) : Array(nSets).fill(ex.reps[0]);
    let h = '<article class="card ex" data-ex="' + ex.id + '">';
    h += '<div class="ex-top"><span class="num">' + n + '</span><div class="ex-head">';
    if (ex.ladder) h += '<div class="tag">' + P.LADDERS[ex.ladder].short + ' · STEP ' + SN(ex.step) + SNOF(ex.ladder) + ' ' + ladderDots(ex.ladder) + '</div>';
    else h += '<div class="tag">' + (ex.kind === 'big3' ? 'BIG 3 CORE BLOCK' : ex.kind === 'sub' ? 'MAIN PULL · ' + esc(ex.tendon) : 'TENDON · ' + esc(ex.tendon)) + '</div>';
    h += '<h3>' + esc(ex.name) + '</h3></div></div>';
    h += '<div class="chips2"><span>' + doseLine(ex) + '</span>' + (ex.tempo ? '<span>⏱ ' + esc(ex.tempo) + '</span>' : '') + '</div>';
    h += demoBtn(ex.id);
    h += '<section class="sec"><h4>How to do it</h4>' + cueList(ex) + (ex.feel ? '<p class="feel"><b>Feel:</b> ' + esc(ex.feel) + '</p>' : '') + (ex.wrong ? '<p class="wrongtxt"><b>Avoid:</b> ' + esc(ex.wrong) + '</p>' : '') + (ex.extra ? '<p class="feel">' + esc(ex.extra) + '</p>' : '') + '</section>';
    h += '<section class="sec"><h4>Rest</h4>' + restChips(ex.rest) + '</section>';
    if (ex.unlock) h += '<p class="unlock"><b>Level up:</b> ' + esc(ex.unlock) + '</p>';
    const lastE = entriesFor((e) => e.ex === ex.id).pop();
    if (lastE) h += '<p class="lasttime"><b>Last time (' + fmtDate(lastE.date) + '):</b> ' + (lastE.completed === false ? 'not done' : (lastE.sets || []).join(' · ') + ' ' + (/sec/.test(ex.unit) ? 'sec' : 'reps')) + (lastE.note ? ' — “' + esc(lastE.note) + '”' : '') + '</p>';
    // logging
    const unitShort = /sec/.test(ex.unit) ? 'sec' : /holds/.test(ex.unit) ? 'holds' : 'reps';
    h += '<div class="logbox"><div class="lb-title">Log it' + (/side|leg/.test(ex.unit) ? ' <small>(log your weaker side)</small>' : '') + '</div><div class="sets">';
    for (let i = 0; i < nSets; i++) {
      const v = d.sets[i] != null ? d.sets[i] : '';
      h += '<label class="set"><span>Set ' + (i + 1) + '</span><input id="s-' + ex.id + '-' + i + '" inputmode="numeric" type="number" min="0" max="200" data-set="' + i + '" value="' + esc(v) + '" placeholder="' + aim[i] + '"><em>' + unitShort + '</em></label>';
    }
    h += '</div>';
    h += '<div class="rate" role="group" aria-label="How did it feel">' + [['easy', 'Too easy'], ['right', 'Just right'], ['hard', 'Too hard']].map(([k, t]) => '<button type="button" data-rate="' + k + '" class="' + (d.rating === k ? 'on ' + k : '') + '">' + t + '</button>').join('') + '</div>';
    const pv = d.pain == null ? 0 : d.pain;
    h += '<label class="pain"><span>Back / joint pain <b class="pv ' + painClass(pv) + '">' + (d.pain == null ? '–' : pv) + '/10</b></span><input id="p-' + ex.id + '" type="range" min="0" max="10" step="1" value="' + pv + '" data-pain></label>';
    h += '<div class="painkey"><span class="g">0–3 go</span><span class="a">4–5 hold</span><span class="r">6+ step down</span></div>';
    h += '<label class="formchk"><input id="f-' + ex.id + '" type="checkbox" data-form ' + (d.form !== false ? 'checked' : '') + '> Form stayed clean (neutral spine every rep)</label>';
    h += '<label class="notes"><span>Notes (how it felt)</span><textarea id="n-' + ex.id + '" rows="2" data-note placeholder="Burn, shaky, balance, anything…">' + esc(d.note || '') + '</textarea></label>';
    h += '<label class="formchk"><input id="x-' + ex.id + '" type="checkbox" data-skip ' + (d.skipped ? 'checked' : '') + '> Couldn’t do it today (logs it as not done — not a fail)</label>';
    if (ex.ladder) h += '<p class="fine">Set 1 at RPE 9–10, or 2+ reps short? Drop one step for sets 2–3 instead of grinding.</p>';
    h += '</div></article>';
    return h;
  }
  // Week layout: full body 3x/week, a day off between sessions (48 h), walks on 2-3 off days, one full rest day.
  function weekCard(today) {
    const order = ['A', 'B', 'C'];
    const last = lastSessionDate();
    const todayS = todayStr();
    const trainedToday = logsSorted().some((l) => l.date === todayS && l.type !== 'walk');
    let idx = order.indexOf(today);
    const lifts = new Set(); let gap = last ? daysBetween(last, todayS) : 2;
    if (trainedToday) { lifts.add(0); gap = 0; }
    for (let i = trainedToday ? 1 : 0; i < 7 && lifts.size < 3; i++) { gap = i === 0 ? gap : gap + 1; if (gap >= 2) { lifts.add(i); gap = 0; } }
    const days = []; let offSeen = 0; const offTotal = 7 - lifts.size;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      let what;
      if (lifts.has(i)) what = (i === 0 && trainedToday) ? 'done' : 'Day ' + order[(idx++) % 3];
      else { offSeen++; what = offSeen === offTotal ? 'rest' : 'walk'; }
      days.push({ d, what });
    }
    return '<section class="week"><div class="tag">THIS WEEK</div><div class="wk">' + days.map((x, i) => '<div class="' + (i === 0 ? 'now ' : '') + (x.what.startsWith('Day') ? 'lift' : x.what) + '"><b>' + x.d.toLocaleDateString(undefined, { weekday: 'short' }) + '</b><span>' + (x.what === 'walk' ? 'Walk' : x.what === 'rest' ? 'Rest' : x.what === 'done' ? 'Done ✓' : x.what) + '</span></div>').join('') + '</div><p class="fine">Full body 3× a week with a day between (48 h recovery). Walks on off days, not right before power work. Mobility any day.</p></section>';
  }
  function walkCard() {
    const walks = logsSorted().filter((l) => l.type === 'walk');
    const wk = walks.filter((l) => l.date && daysBetween(l.date, todayStr()) < 7).reduce((a, l) => a + (l.minutes || 0), 0);
    return '<section class="card walk"><div class="tag">CONDITIONING · OFF DAYS</div><h3>Brisk walk 20–30 min</h3><p>Aerobic fitness is one of the main things that decide boxing performance. Walking builds it with the fewest aches at your weight. 2–3 times a week, on non-lifting days. Pace: you can talk, but not sing.</p><p class="fine">This week: <b>' + wk + ' min</b> walked.</p><div class="wrow"><input id="walkmin" type="number" inputmode="numeric" placeholder="minutes"><button type="button" id="saveWalk" class="primary"' + (S.canWrite ? '' : ' disabled') + '>Log walk</button></div></section>';
  }
  function painClass(v) { return v >= 6 ? 'r' : v >= 4 ? 'a' : 'g'; }
  function flowCard(i) {
    const d = D('flow');
    let h = '<article class="card ex" data-ex="flow"><div class="ex-top"><span class="num">' + (i + 1) + '</span><div class="ex-head"><div class="tag">MOBILITY</div><h3>Full Mobility Flow</h3><div class="dose">About 10 minutes · 10 moves</div></div></div>';
    h += '<ol class="flowlist">' + P.MOBILITY.map((m) => swapEx(m)).map((m) => '<li><span>' + esc(m.name) + ' <em>' + esc(m.dose) + '</em></span>' + demoBtn(m.id, 'Watch') + '</li>').join('') + '</ol>';
    h += restChips(P.REST.mob);
    h += '<div class="logbox"><div class="rate">' + [['easy', 'Too easy'], ['right', 'Just right'], ['hard', 'Too hard']].map(([k, t]) => '<button type="button" data-rate="' + k + '" class="' + (d.rating === k ? 'on ' + k : '') + '">' + t + '</button>').join('') + '</div>';
    const pv = d.pain == null ? 0 : d.pain;
    h += '<label class="pain"><span>Pain <b class="pv ' + painClass(pv) + '">' + (d.pain == null ? '–' : pv) + '/10</b></span><input id="p-flow" type="range" min="0" max="10" value="' + pv + '" data-pain></label>';
    h += '<label class="formchk"><input id="done-flow" type="checkbox" data-done ' + (d.done ? 'checked' : '') + '> Did the flow</label></div></article>';
    return h;
  }
  function stopRulesCard(compact) {
    return '<section class="stop"><h2>Stop rules</h2><p>End the session and seek care for: sharp or shooting back pain · new numbness or tingling in a leg or foot · leg weakness · pain shooting below the knee that does not ease · any bladder or bowel change.</p><p><b>Feel sick, dizzy or light-headed?</b> Stop, sit down, sip water. Log the rest as “couldn’t do it”. If it keeps happening, or comes with chest pain or shortness of breath, get checked.</p>' + (compact ? '' : '<p>Muscle burn and effort are fine. Those signals are not.</p>') + '<p class="fine">General fitness information, not medical advice. A clinician or physical therapist’s guidance wins.</p></section>';
  }

  // ---- next-morning check
  function pendingCheck() {
    const ls = logsSorted().filter((l) => l.date && l.date < todayStr() && l.type !== 'walk');
    const last = ls[ls.length - 1];
    if (!last || S.data.checks[last.id]) return null;
    if (daysBetween(last.date, todayStr()) > 2) return null;
    return last;
  }
  let checkState = { feel: null, pain: 0, cause: null };
  function morningCheckCard() {
    const l = pendingCheck(); if (!l) return '';
    let h = '<section class="card check"><div class="tag">24-HOUR CHECK</div><h2>How is your back today vs yesterday?</h2><p class="fine">After ' + esc(l.title || ('Day ' + (l.day || '?'))) + ' · ' + fmtDate(l.date) + (l.time ? ' (' + esc(l.time) + ')' : '') + '. This decides more than how a set felt.</p>';
    h += '<div class="rate">' + [['better', 'Better'], ['same', 'Same'], ['worse', 'Worse']].map(([k, t]) => '<button type="button" data-check="' + k + '" class="' + (checkState.feel === k ? 'on ' + (k === 'worse' ? 'hard' : 'right') : '') + '">' + t + '</button>').join('') + '</div>';
    h += '<label class="pain"><span>Pain right now <b class="pv ' + painClass(checkState.pain) + '">' + checkState.pain + '/10</b></span><input id="chk-pain" type="range" min="0" max="10" value="' + checkState.pain + '" data-chkpain></label>';
    const red = checkState.feel === 'worse' && checkState.pain >= 4 || checkState.pain >= 6;
    if (red) {
      const lads = (l.entries && l.entries.length ? l.entries.filter((e) => e.ladder).map((e) => e.ladder) : (l.day ? P.DAYS[l.day].items.filter((i) => i.lad).map((i) => i.lad) : []));
      h += '<p><b>Which move do you think caused it?</b></p><div class="chips">' + [...new Set(lads)].map((k) => '<button type="button" data-cause="' + k + '" class="' + (checkState.cause === k ? 'on' : '') + '">' + esc(curEx(k).name) + '</button>').join('') + '<button type="button" data-cause="none" class="' + (checkState.cause === 'none' ? 'on' : '') + '">Not sure</button></div>';
    }
    h += '<button type="button" class="primary" id="saveCheck"' + (checkState.feel && S.canWrite ? '' : ' disabled') + '>Save check</button></section>';
    return h;
  }
  async function saveCheck() {
    const l = pendingCheck(); if (!l || !checkState.feel) return;
    const pain = checkState.pain, feel = checkState.feel;
    const msgs = [];
    const lads = [...new Set((l.entries && l.entries.length ? l.entries.filter((e) => e.ladder).map((e) => e.ladder) : (l.day ? P.DAYS[l.day].items.filter((i) => i.lad).map((i) => i.lad) : [])))];
    let level = 'green';
    if (pain >= 6 || (feel === 'worse' && pain >= 4)) level = 'red';
    else if (pain >= 4 || feel === 'worse') level = 'amber';
    const at = new Date().toISOString();
    if (level === 'red') {
      const k = checkState.cause;
      if (k && k !== 'none') {
        const st = stepOf(k); const L = Object.assign({ history: [] }, ladderState(k));
        if (st > 0) {
          const nx = P.LADDERS[k].steps[st - 1];
          await put('ladders', k, { step: st - 1, hold: false, history: (L.history || []).concat([{ date: todayStr(), from: st, to: st - 1, dir: 'down', why: '24-hour check: red' }]) });
          msgs.push('24-hour check is RED (' + pain + '/10, ' + feel + '). ' + P.LADDERS[k].name + ' steps down to Step ' + SN(st - 1) + ': ' + nx.name + '. If it still hurts, remove that move for this week.');
        } else msgs.push('24-hour check is RED. ' + P.LADDERS[k].name + ' is already at Step 1 — swap to the substitute or skip it this week.');
      } else {
        for (const k2 of lads) { const L = ladderState(k2); await put('ladders', k2, { step: stepOf(k2), hold: true, history: (L.history || []).slice() }); }
        msgs.push('24-hour check is RED (' + pain + '/10). Not sure which move: all of that day’s levels are held, and nothing moves up until things settle.');
      }
      msgs.push('Leg weakness, saddle numbness, or any bladder/bowel change: stop and get medical assessment now.');
    } else if (level === 'amber') {
      for (const k2 of lads) { const L = ladderState(k2); await put('ladders', k2, { step: stepOf(k2), hold: true, history: (L.history || []).slice() }); }
      msgs.push('24-hour check is AMBER (' + pain + '/10, ' + feel + '). Hold: no level-ups next session for that day’s moves. If it repeats, cut reps or range about 20–30%.');
    } else msgs.push('24-hour check is GREEN (' + pain + '/10, ' + feel + '). Progress as normal.');
    await put('checks', l.id, { logId: l.id, date: todayStr(), feel, pain, level, cause: checkState.cause || null, at });
    for (const m of msgs) await put('changes', 'c' + Date.now() + Math.random().toString(36).slice(2, 6), { at: new Date().toISOString(), date: todayStr(), text: m });
    checkState = { feel: null, pain: 0, cause: null };
    lastResult = { msgs };
    render();
  }

  function reactiveWarnings() {
    const out = [];
    for (const k of LADDER_KEYS) {
      const step = stepOf(k);
      const es = entriesFor((e) => e.ladder === k && e.step === step && e.completed !== false);
      if (es.length >= 3) {
        const t = es.slice(-3).map((e) => (e.sets || []).reduce((a, b) => a + b, 0));
        if (t[2] < t[1] && t[1] < t[0]) out.push(P.LADDERS[k].name + ': reps dropped two sessions in a row. That is a sign for a lighter week now (reactive deload).');
      }
      if (es.length >= 3) {
        const first = es[0].date, lastD = es[es.length - 1].date;
        if (first && lastD && daysBetween(first, lastD) >= 21) {
          const tot = (e) => (e.sets || []).reduce((a, b) => a + b, 0);
          const recent = es.filter((e) => daysBetween(e.date, lastD) <= 21);
          const older = es.filter((e) => daysBetween(e.date, lastD) > 21);
          if (older.length && Math.max(...recent.map(tot)) <= Math.max(...older.map(tot)) && recent.every((e) => e.rating === 'right')) out.push(P.LADDERS[k].name + ': no progress for 3 weeks. Check missed sessions, short rests, and doing it tired at the end. Then change ONE thing for 2 weeks: move it earlier, add one set, add a 2-sec pause at the hardest point, or swap to the harder variant.');
        }
      }
    }
    return out;
  }

  async function finishWorkout() {
    if (!S.canWrite) return;
    const day = selDay || suggestDay();
    const DY = P.DAYS[day];
    const entries = [];
    const flat = dayList(day).map((x) => (x.flow ? { flow: true } : { ex: x.ex.id }));
    for (const it of flat) {
      if (it.flow) { const d = D('flow'); if (d.done || d.rating) entries.push({ ex: 'flow', kind: 'mobility', rating: d.rating || null, pain: d.pain || 0 }); continue; }
      const ex = it.lad ? curEx(it.lad) : P.EX[it.ex];
      const d = D(ex.id);
      const sets = (d.sets || []).map((v) => (v === '' || v == null ? null : Number(v))).filter((v) => v != null && !isNaN(v));
      if (d.skipped) { entries.push({ ex: ex.id, ladder: ex.ladder || null, step: ex.ladder ? ex.step : null, unit: ex.unit, sets: [], target: ex.reps, completed: false, note: d.note || '', pain: d.pain == null ? 0 : d.pain }); continue; }
      if (!sets.length) continue;
      entries.push({ ex: ex.id, ladder: ex.ladder || null, step: ex.ladder ? ex.step : null, unit: ex.unit, sets, target: ex.reps, rating: d.rating || 'right', pain: d.pain == null ? 0 : d.pain, form: d.form !== false, note: d.note || '', completed: true });
    }
    if (!entries.length) { toast('Log at least one set first.'); return; }
    const msgs = [];
    const id = 'w' + Date.now();
    const at = new Date().toISOString();
    // evaluate before saving (so "previous" = earlier sessions)
    const ladderUpdates = {};
    for (const e of entries) {
      if (e.completed === false) { msgs.push((P.EX[e.ex] ? P.EX[e.ex].name : 'That move') + ': not done today — no change to your level. Same plan next time.' + (/sick|nause|dizz|light/i.test(e.note || '') ? ' Feeling sick is a stop signal, not a fail: eat a light snack 1–2 h before training, sip water, and stop if it comes back.' : '')); continue; }
      if (!e.ladder) {
        if (e.pain >= 6) { const ex0 = P.EX[e.ex]; msgs.push((ex0 ? ex0.name : 'That move') + ': pain ' + e.pain + '/10 is RED.' + (ex0 && ex0.kind === 'tendon' ? ' Tendon work must stay ≤3/10 and be back to baseline by the next morning.' : '') + ' Leg weakness, numbness or pain down the leg: stop and get checked.'); }
        else if (e.pain >= 4) msgs.push((P.EX[e.ex] ? P.EX[e.ex].name : 'Mobility') + ': pain ' + e.pain + '/10 is AMBER. Hold the same hold time next session.');
        else if (P.EX[e.ex] && P.EX[e.ex].kind === 'tendon' && e.sets.every((v) => v >= P.EX[e.ex].reps[1]) && e.rating === 'easy') msgs.push(P.EX[e.ex].name + ': easy at the top time. Make it harder (single-leg or a new angle), not longer. Progress tendon load only ~5–10% per week.');
        continue;
      }
      const r = evaluateLadder(e.ladder, e);
      msgs.push(...r.msgs);
      const L = ladderState(e.ladder);
      const from = stepOf(e.ladder);
      const upd = { step: r.newStep, hold: r.clearHold ? false : (r.newStep === from ? (L.hold && !r.clearHold ? L.hold : false) : false), history: (L.history || []).slice() };
      if (r.newStep !== from) upd.history.push({ date: todayStr(), from, to: r.newStep, dir: r.newStep > from ? 'up' : 'down', why: r.msgs[0] });
      ladderUpdates[e.ladder] = upd;
    }
    // Not working? Swap it automatically: red pain now, or not done / too hard two sessions in a row.
    const swaps = Object.assign({}, userSwaps()); let swapped = false;
    for (const e of entries) {
      const to = P.ALT[e.ex]; if (!to || swaps[e.ex] || !P.EX[to]) continue;
      if (e.ladder && stepOf(e.ladder) > 0) continue; // ladders step down instead; only swap at the first step
      const prev = entriesFor((x) => x.ex === e.ex).pop();
      const bad = (x) => x && (x.completed === false || x.rating === 'hard' || x.form === false);
      let why = null;
      if ((e.pain || 0) >= 6) why = 'pain ' + e.pain + '/10';
      else if (bad(e) && bad(prev)) why = (e.completed === false ? 'couldn’t do it' : 'too hard') + ' two sessions in a row';
      if (why) { swaps[e.ex] = { to, date: todayStr(), why }; swapped = true; msgs.push(P.EX[e.ex].name + ' isn’t working (' + why + '), so next time it’s swapped for ' + P.EX[to].name + '. You can restore it in Me.'); }
    }
    if (swapped) await put('plan', 'profile', Object.assign({}, profile() || {}, { swaps }));
    await put('logs', id, { date: todayStr(), day, title: 'Day ' + day + ' — ' + DY.name, entries, createdAt: at, deload: inDeload() });
    for (const k in ladderUpdates) await put('ladders', k, ladderUpdates[k]);
    let i = 0;
    for (const m of msgs) await put('changes', 'c' + Date.now() + '-' + (i++), { at: new Date(Date.now() + i).toISOString(), date: todayStr(), text: m, logId: id });
    draft = {}; saveDraft();
    lastResult = { msgs };
    selDay = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
    toast('Workout saved.');
  }

  function vHowTo() {
    let h = '<section class="hero slim"><h1>How To</h1><p>Every move, every step. Tap <b>Watch 1 rep</b> for the 3D demo with form notes.</p></section>';
    h += backRulesCard();
    for (const k of ['push', 'pull', 'legs', 'core']) h += ladderSection(k);
    h += '<section class="block"><h2>Big 3 core block</h2><p class="fine">Every Day A and B. Short holds of 8–10 sec, descending reps (6-4-2), 2–3 sets. Low spine load: the curl-up gave the best ratio of ab work to spine compression in McGill’s lab tests. Good, not magic — a Cochrane review found this kind of core work isn’t better than other exercise for back pain.</p>' + P.BIG3.map((b) => miniCard(b)).join('') + '</section>';
    h += '<section class="block"><h2>Rib-safe swaps</h2><p class="fine">Used while “No lying face down” is on.</p>' + P.RIBSAFE.map((b) => miniCard(b)).join('') + '</section>';
    h += '<section class="block"><h2>Extras</h2><p class="fine">The wall-check hinge is now part of the warm-up (Mobility Flow #2). The front plank pyramid is optional core work on Day C or off days.</p>' + P.EXTRAS.map((b) => miniCard(b)).join('') + '</section>';
    h += '<section class="block"><h2>Substitutes</h2>' + P.SUBS.map((s) => miniCard(s)).join('') + '</section>';
    h += '<section class="block"><h2>Swap options by pattern</h2><p class="fine">Easier → standard → harder. Use when a move hurts, doesn’t suit you, or stalls.</p>' + P.VARIATIONS.map(([t, d]) => '<details><summary>' + esc(t) + '</summary><p>' + esc(d) + '</p></details>').join('') + '</section>';
    return h;
  }
  function backRulesCard() {
    return '<section class="rules"><h2>Back-safe rules</h2><ul>' +
      ['Neutral spine always — natural gentle curve, never rounded, never over-arched. Can’t hold it? The set is over.',
        'No sit-ups, crunches, toe-touch stretches, Russian twists, twisting under load, pelvis-tucking leg raises or hollow holds.',
        'No heavy deadlifts or good-mornings. The hinge here is a no-load drill.',
        'Hinge from the hips with a flat back. Stop the moment the back wants to round.',
        'Core = McGill Big 3: bird dog, modified curl-up, side plank.',
        'This isn’t a ban on bending in daily life — it’s how we train under load.'].map((r) => '<li>' + esc(r) + '</li>').join('') + '</ul></section>';
  }
  function ladderSection(k) {
    const L = P.LADDERS[k]; const st = stepOf(k);
    let h = '<section class="block"><h2>' + esc(L.name) + ' ladder ' + ladderDots(k) + '</h2><p class="fine">' + esc(L.note) + '</p>';
    L.steps.forEach((ex, i) => { h += miniCard(ex, i === st ? 'here' : i < st ? 'done' : ''); });
    return h + '</section>';
  }
  function miniCard(ex, state) {
    let h = '<article class="card mini ' + (state || '') + '">';
    h += '<div class="mini-head"><div>' + (ex.ladder ? '<div class="tag">STEP ' + SN(ex.step) + (state === 'here' ? ' · <b>YOU ARE HERE</b>' : state === 'done' ? ' · DONE' : '') + '</div>' : (ex.tendon ? '<div class="tag">' + esc(ex.tendon) + '</div>' : '')) + '<h3>' + esc(ex.name) + '</h3><div class="dose">' + doseLine(ex) + (ex.tempo ? ' · ' + esc(ex.tempo) : '') + '</div></div>' + demoBtn(ex.id) + '</div>';
    h += cueList(ex);
    if (ex.feel) h += '<p class="feel"><b>Feel:</b> ' + esc(ex.feel) + '</p>';
    if (ex.wrong) h += '<p class="wrongtxt"><b>Avoid:</b> ' + esc(ex.wrong) + '</p>';
    if (ex.extra) h += '<p class="feel">' + esc(ex.extra) + '</p>';
    if (ex.sub) h += '<p class="feel"><b>Substitute:</b> ' + esc(ex.sub) + '</p>';
    if (ex.gate) h += '<p class="gate"><b>Gate:</b> ' + esc(ex.gate) + '</p>';
    h += restChips(ex.rest);
    if (ex.unlock) h += '<p class="unlock"><b>Level up:</b> ' + esc(ex.unlock) + '</p>';
    if (ex.demoAlt) h += demoBtn(ex.demoAlt === 'sidePlankFull' ? 'core3full' : ex.demoAlt, 'Watch full version');
    return h + '</article>';
  }

  function vPower() {
    let h = '<section class="hero slim"><h1>Speed &amp; Power</h1><p>Fast up, slow down. 4–6 reps. Feet stay on the ground. Power stops when speed stops.</p></section>';
    h += ladderSection('power');
    h += '<section class="block"><h2>Reaction drills</h2><p class="fine">2–3× per week, 5–10 min, after strength work. Ball drops and generic reaction drills are a cheap warm-up with low-to-moderate transfer to fighting. What transfers: real fight cues — called combos, pad or partner cues, reading a shoulder, hip, guard or weight shift early.</p>' + P.REACTION.map((r) => miniCard(r)).join('') + '</section>';
    h += '<section class="block"><h2>Footwork basics</h2>' + miniCard(P.FOOTWORK) + '</section>';
    h += '<section class="block"><h2>Combat path</h2><ol class="path">' +
      '<li><b>Now · Months 1–3 — Build the base.</b> Strength ladders, power steps 0–3 (Fast Squat → Fast Lunge Step), reaction drills, footwork basics, slow shadowboxing only if pain-free (hands up, no hard punching, no twisting hooks).</li>' +
      '<li><b>Next · Months 3–6 — Get quicker.</b> Power ladder finished, snap-downs perfect, reaction at walking-to-jogging pace, footwork rounds of 30–60 sec, brisk walking or pain-free marching / step-touch intervals. Start looking for a beginner-friendly boxing or MMA gym — visit, watch a class, tell the coach about your disc history.</li>' +
      '<li><b>Later · Month 6+ — Join a gym, with a coach.</b> Beginner classes only at first, bag and pad work with a coach watching, keep this plan 2× per week alongside classes. No hard sparring, takedowns, throws or twisting under load until a coach and your clinician both clear it.</li></ol>' +
      '<p class="fine">No home plan prepares anyone for combat sports without a coach, a club and supervised sparring progression. This plan builds the base.</p></section>';
    h += '<section class="block"><h2>Not yet — locked</h2><div class="locked">' + ['Jumping', 'Box jumps', 'Hopping drills', 'Burpees', 'All-out sprinting', 'Kipping pull-ups', 'Hard sparring', 'Takedowns + throws', 'Twisting under load', 'Plyometrics'].map((x) => '<span>🔒 ' + esc(x) + '</span>').join('') + '</div>';
    h += '<h3>Real jumping gates — all of these, after 8–12 weeks of slow strength</h3><ul class="gates">' + ['15 slow controlled squats, knees over toes, no pain', '30-sec single-leg balance, each leg', '8–10 controlled split squats or reverse lunges per leg', '20 pain-free calf raises', '5 quiet landings from a low step (stick 2 sec, no knee collapse, no thud)', 'No current knee, ankle, hip or back pain'].map((g) => '<li>' + esc(g) + '</li>').join('') + '</ul>';
    h += '<p class="fine">Then only low pogo and line hops: 20–40 foot contacts per session, 1–2× per week, in shoes on a soft surface, 48–72 h apart. No depth jumps, high box jumps or single-leg hops until double-leg landings are quiet and pain-free for weeks. A coach or clinician check first is prudent — at 220 lbs landing forces are several times bodyweight.</p></section>';
    return h;
  }
  function vMobility() {
    let h = '<section class="hero slim"><h1>Mobility Flow</h1><p>Daily · about 10 minutes. Flow before training; static holds after training or as a separate session.</p></section>';
    h += '<section class="block">' + P.MOBILITY.map((m, i) => miniCard(Object.assign({}, m, { name: (i + 1) + '. ' + m.name }))).join('') + '</section>';
    h += '<section class="block"><h2>What the evidence says</h2><ul class="cues"><li>About 10 minutes per week per muscle group is the plateau — more isn’t better.</li><li>Gentle, below discomfort, gains as much range as hard stretching.</li><li>Static holds: 30–60 sec. Right before strength or power, holds of 60 sec or more cut performance ~4.6%; under 60 sec only ~1% (Behm 2016).</li><li>Mobility improves range of motion. Strength training is what reduces injury risk.</li></ul></section>';
    return h;
  }
  function vTendons() {
    let h = '<section class="hero slim"><h1>Tendons</h1><p>Tendons adapt slower than muscle — 8–12 weeks minimum, ideally 12+, before stiffness changes. Muscle strength rises 1–2 months earlier. Don’t rush.</p></section>';
    h += '<section class="rules"><h2>Dose</h2><ul><li>3× per week on training days.</li><li>3–4 sets of 6–15 reps at 3 sec up / 3 sec down, or 3–5 holds of 30–45 sec at a hard effort.</li><li>Pain ≤3/10 during, back to baseline by the next morning.</li><li>Progress load only ~5–10% per week.</li><li>Easy for 15+ reps at 3/3 on two legs? Too light — go single-leg or change the angle.</li><li>What grows tendon is how hard the load is, not how long you hold (Bohm 2015 meta-analysis; Schroll 2024). So progress holds by making the position harder, not longer.</li><li>Stretching and foam rolling don’t build tendon. Never swap them for loading.</li></ul></section>';
    h += '<section class="block">' + P.TENDON.map((t) => miniCard(t)).join('') + '</section>';
    return h;
  }
  function vLog() {
    let h = '<section class="hero slim"><h1>Log</h1><p>Every workout, every change, every morning check. Nothing here is ever wiped.</p></section>';
    const ls = logsSorted().slice().reverse();
    h += '<section class="block"><h2>Workouts (' + ls.length + ')</h2>';
    if (!ls.length) h += '<p class="empty">No workouts yet. Finish one on Today and it shows up here.</p>';
    for (const l of ls) {
      h += '<article class="card logrow"><div class="lr-head"><b>' + esc(l.title || 'Workout') + '</b><span>' + fmtDate(l.date) + (l.time ? ' · ' + esc(l.time) : '') + '</span></div>';
      if (l.seeded) h += '<p class="fine">' + esc(l.note || 'Recovered from your earlier plan.') + '</p>';
      if (l.entries && l.entries.length) h += '<ul class="entries">' + l.entries.map((e) => { const ex = P.EX[e.ex]; return '<li><span>' + esc(ex ? ex.name : e.ex === 'flow' ? 'Mobility Flow' : e.ex) + (e.ladder ? ' <small>step ' + SN(e.step) + '</small>' : '') + '</span><span class="nums">' + (e.completed === false ? '<b class="pv a">Not done</b>' : (e.sets ? e.sets.join(' · ') + (e.setsNote ? ' ' + esc(e.setsNote) : '') : '') + ' <i class="r-' + (e.rating || '') + '">' + ({ easy: 'too easy', right: 'just right', hard: 'too hard' }[e.rating] || '') + '</i>' + (e.difficulty != null ? ' <i>difficulty ' + e.difficulty + ' · effectiveness ' + e.effectiveness + '</i>' : '') + ' <b class="pv ' + painClass(e.pain || 0) + '">pain ' + (e.pain || 0) + '/10</b>') + '</span>' + (e.note ? '<q>' + esc(e.note) + '</q>' : '') + '</li>'; }).join('') + '</ul>';
      const ck = S.data.checks[l.id];
      if (ck) h += '<p class="fine">Next morning: ' + esc(ck.feel) + ', ' + ck.pain + '/10 (' + esc(ck.level) + ')</p>';
      h += '</article>';
    }
    h += '</section>';
    const ch = changesSorted();
    h += '<section class="block"><h2>What changed and why</h2>' + (ch.length ? '<ul class="changes">' + ch.map((c) => '<li><span>' + fmtDate(c.date) + '</span>' + esc(c.text) + '</li>').join('') + '</ul>' : '<p class="empty">Plan changes appear here after each workout.</p>') + '</section>';
    return h;
  }

  // What Works
  function fitStats(id) {
    const notDone = entriesFor((e) => e.ex === id && e.completed === false).length;
    const es = entriesFor((e) => e.ex === id && e.completed !== false);
    if (!es.length) return { n: 0, notDone, avgPain: 0, maxPain: 0, rc: { easy: 0, right: 0, hard: 0 }, prog: 0, auto: 'Keep', why: 'Not done yet' + (notDone ? ' (' + notDone + '× not done)' : '') + ' — no data to rate.', last: null };
    const tot = (e) => (e.sets || []).reduce((a, b) => a + b, 0);
    const avgPain = es.reduce((a, e) => a + (e.pain || 0), 0) / es.length;
    const maxPain = Math.max(...es.map((e) => e.pain || 0));
    const rc = { easy: 0, right: 0, hard: 0 }; es.forEach((e) => { if (rc[e.rating] != null) rc[e.rating]++; });
    const prog = es.length >= 2 ? tot(es[es.length - 1]) - tot(es[0]) : 0;
    let auto = 'Keep', why = 'Pain low and it’s working.';
    if (maxPain >= 6 || avgPain >= 4) { auto = 'Drop'; why = 'Pain has been amber/red. Swap it inside the same pattern.'; }
    else if (avgPain >= 2.5 || (es.length >= 3 && prog <= 0)) { auto = 'Modify'; why = prog <= 0 && es.length >= 3 ? 'No progress yet — change one variable.' : 'Some pain — reduce range or reps.'; }
    return { n: es.length, notDone, avgPain, maxPain, rc, prog, auto, why: why + (notDone ? ' (' + notDone + '× not done)' : ''), last: es[es.length - 1] };
  }
  function vWorks() {
    let h = '<section class="hero slim"><h1>What Works</h1><p>Each move rated on pain, feel, progress and enjoyment → Keep, Modify or Drop.</p></section>';
    const ids = [...new Set(entriesFor(() => true).map((e) => e.ex))].filter((id) => P.EX[id]);
    if (!ids.length) h += '<p class="empty card">No logged sets yet. After your first logged workout, each exercise gets a Keep / Modify / Drop rating here.</p>';
    for (const id of ids) {
      const ex = P.EX[id]; const st = fitStats(id); const f = S.data.fit[id] || {};
      const verdict = f.verdict || st.auto;
      h += '<article class="card works"><div class="mini-head"><div><div class="tag">' + (ex.ladder ? P.LADDERS[ex.ladder].short + ' · STEP ' + SN(ex.step) : 'TENDON') + '</div><h3>' + esc(ex.name) + '</h3></div><span class="verdict v-' + verdict.toLowerCase() + '">' + verdict + '</span></div>';
      h += '<div class="stats"><div><b>' + st.n + '</b><span>sessions</span></div><div><b class="pv ' + painClass(st.avgPain) + '">' + st.avgPain.toFixed(1) + '</b><span>avg pain</span></div><div><b>' + (st.prog > 0 ? '+' : '') + st.prog + '</b><span>progress (total)</span></div><div><b>' + st.rc.easy + '/' + st.rc.right + '/' + st.rc.hard + '</b><span>easy/right/hard</span></div></div>';
      h += '<p class="fine">' + (f.verdict ? 'Your call: ' + esc(f.verdict) + '. Plan’s read: ' + esc(st.auto) + ' — ' : 'Plan’s read: ') + esc(st.why) + '</p>';
      h += '<div class="enjoy" data-fit="' + id + '"><span>Enjoy</span>' + [1, 2, 3, 4, 5].map((n) => '<button type="button" data-enjoy="' + n + '" class="' + ((f.enjoy || 0) >= n ? 'on' : '') + '" aria-label="' + n + ' of 5">★</button>').join('') + '</div>';
      h += '<div class="chips" data-fit="' + id + '">' + ['Keep', 'Modify', 'Drop'].map((v) => '<button type="button" data-verdict="' + v + '" class="' + (f.verdict === v ? 'on' : '') + '">' + v + '</button>').join('') + (f.verdict ? '<button type="button" data-verdict="">Use plan’s read</button>' : '') + '</div>';
      h += '</article>';
    }
    return h;
  }

  let confirmMove = null;
  function vMe() {
    const p = profile() || {};
    let h = '<section class="hero slim"><h1>' + esc(p.name || 'Jonathan') + '</h1><p>' + esc(p.height || '5\'10"') + ' · started at ' + esc(p.startWeight || 220) + ' lbs · beginner · started ' + fmtDate(p.start || '2026-11-19') + ' · week ' + weekNum() + '</p></section>';
    h += '<section class="card"><h2>My condition</h2><p>' + esc(p.condition || 'Herniated lower back disc, about 4 years ago (around 2022). No pain since. No other conditions.') + '</p><p>' + esc(p.tolerance || 'Squats and lunges tolerated pain-free (reported 2026-11-20).') + '</p></section>';
    h += stopRulesCard(false);
    h += backRulesCard();
    // ladders
    h += '<section class="block"><h2>My levels</h2>';
    for (const k of LADDER_KEYS) {
      const L = ladderState(k), st = stepOf(k), ex = curEx(k);
      h += '<article class="card lvl"><div class="mini-head"><div><div class="tag">' + P.LADDERS[k].short + ' ' + ladderDots(k) + '</div><h3>Step ' + SN(st) + SNOF(k) + ': ' + esc(ex.name) + '</h3>' + (L.hold ? '<div class="pill amber">On hold from a 24-hour check</div>' : '') + (L.fallback ? '<div class="fine">Not saved yet — showing the starting step.</div>' : '') + '</div></div>';
      const hist = (L.history || []).slice(-3).reverse();
      if (hist.length) h += '<ul class="hist">' + hist.map((x) => '<li>' + fmtDate(x.date) + ': ' + (x.from == null ? '' : 'Step ' + SN(x.from) + ' → ') + 'Step ' + SN(x.to) + ' — ' + esc(x.why || '') + '</li>').join('') + '</ul>';
      if (confirmMove && confirmMove.k === k) h += '<div class="confirm">Move ' + P.LADDERS[k].name + ' ' + confirmMove.dir + ' one step? <button type="button" class="primary" data-move-yes="' + k + '">Yes, move ' + confirmMove.dir + '</button> <button type="button" data-move-no>Cancel</button></div>';
      else h += '<div class="chips"><button type="button" data-move="' + k + '" data-dir="down"' + (st === 0 || !S.canWrite ? ' disabled' : '') + '>Move down</button><button type="button" data-move="' + k + '" data-dir="up"' + (st === P.LADDERS[k].steps.length - 1 || !S.canWrite ? ' disabled' : '') + '>Move up</button></div>';
      h += '</article>';
    }
    h += '</section>';
    const sw = userSwaps(); const swKeys = Object.keys(sw).filter((k) => P.EX[k] && P.EX[sw[k].to]);
    h += '<section class="card"><h2>Swapped exercises</h2>' + (swKeys.length ? '<ul class="hist">' + swKeys.map((k) => '<li><b>' + esc(P.EX[k].name) + '</b> → ' + esc(P.EX[sw[k].to].name) + ' (' + esc(sw[k].why) + ', ' + fmtDate(sw[k].date) + ') <button type="button" class="link" data-restore="' + k + '">Restore</button></li>').join('') + '</ul>' : '<p class="fine">None. When a move isn’t working (red pain, or couldn’t do it / too hard twice in a row) the plan swaps in an easier or safer version and tells you why.</p>') + '</section>';
    h += '<section class="card"><h2>No lying face down</h2><p>For rib pain when lying on your stomach. Swaps face-down moves for all-fours or doorway versions. Your Pull level is held while it’s on.</p><label class="formchk"><input id="noprone" type="checkbox" ' + (noProne() ? 'checked' : '') + (S.canWrite ? '' : ' disabled') + '> On</label><p class="fine">Get rib pain checked if it hurts to breathe deeply, one spot is very tender, it followed a fall, or it isn’t better in 1–2 weeks. Chest pain with shortness of breath: get care right away.</p></section>';
    // weight
    const ws = Object.entries(S.data.body).map(([id, b]) => Object.assign({ id }, b)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    h += '<section class="card"><h2>Bodyweight</h2><div class="wrow"><input id="wt" type="number" inputmode="decimal" step="0.1" placeholder="lbs"><button type="button" id="saveWt" class="primary"' + (S.canWrite ? '' : ' disabled') + '>Log weight</button></div>';
    h += ws.length ? '<ul class="hist">' + ws.slice(0, 8).map((w) => '<li>' + fmtDate(w.date) + ': <b>' + esc(w.lbs) + ' lbs</b></li>').join('') + '</ul>' : '<p class="fine">Start: 220 lbs. Log your weight any time.</p>';
    h += '</section>';
    // deload
    h += '<section class="card"><h2>Deload</h2><p>Every 6–8 weeks: one lighter week. Same days, same exercises, about half the sets, same level, stop at 4+ reps left. Never deload by stopping.</p><p class="fine">Sooner if performance drops 2 sessions in a row, joints or tendons ache, or sleep or motivation falls.</p>' + (inDeload() ? '<p class="pill ok">Deload week running until ' + fmtDate(p.deloadUntil) + '</p>' : '<button type="button" id="startDeload"' + (S.canWrite ? '' : ' disabled') + '>Start a deload week now</button>') + '</section>';
    // rest table
    h += '<section class="card"><h2>Rest times</h2><p class="fine">Default between sets: 90 seconds. If reps drop by more than 2 from set 1 to set 2 at the same level, the rest was too short. As sets get heavier, stretch rests toward 2–3 min on the hardest lifts.</p><div class="tbl"><table><tbody>' + P.REST_TABLE.map(([a, b]) => '<tr><th>' + esc(a) + '</th><td>' + esc(b) + '</td></tr>').join('') + '</tbody></table></div></section>';
    h += '<section class="card"><h2>Setup</h2><p>Mat on a hard flat floor · clear space ~2 steps each way · a plain wall · bare feet or grippy socks · phone as a timer only. No equipment. 3 days a week, 35–45 min, non-consecutive days. No 1RM testing, no jumping to start.</p></section>';
    h += '<section class="card why"><h2>Why the plan looks like this</h2><p class="fine">Reviewed 2026-11-21 against reviews and meta-analyses. What changed, and what the research confirmed:</p><ul>' +
      '<li><b>Changed: power goes first.</b> Moves done early in a session are done with less fatigue, so they are faster and stronger. Your Fast Squat was shaky after other squats. (<a href="https://us.humankinetics.com/blogs/excerpt/utilize-proper-workout-structure-and-exercise-order" target="_blank" rel="noopener">NSCA program design</a>, <a href="https://pubmed.ncbi.nlm.nih.gov/32077380/" target="_blank" rel="noopener">exercise-order meta-analysis</a>)</li>' +
      '<li><b>Changed: feeling sick is a stop rule.</b> Nausea during exercise is tied to effort, training fasted, and fluid balance. Light snack 1–2 h before, sip water, ease in. (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6680692/" target="_blank" rel="noopener">Sports review</a>)</li>' +
      '<li><b>Changed: tendon holds get harder, not longer.</b> Tendons respond to how heavy the load is, not the type or length of contraction. (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4532714/" target="_blank" rel="noopener">Bohm 2015 meta-analysis</a>, <a href="https://doaj.org/article/6de7373a65ab439ea4609085bb4a8f6e" target="_blank" rel="noopener">Schroll 2024</a>)</li>' +
      '<li><b>Corrected: stretching numbers.</b> Holds of 60 sec or more before training cut performance about 4.6%; under 60 sec about 1%. (<a href="https://pubmed.ncbi.nlm.nih.gov/21659901/" target="_blank" rel="noopener">Kay &amp; Blazevich 2012</a>, Behm 2016)</li>' +
      '<li><b>Changed: Hinge &amp; Glute ladder + Big 3 block.</b> The old ladder replaced glute work with core holds as you levelled up. Now glutes progress to single-leg bridges, and the Big 3 runs every Day A/B. (<a href="https://brookbushinstitute.com/articles/electromyographic-analysis-of-gluteus-maximus-and-hamstring-activity-during-the-supine-resisted-hip-extension-exercise-versus-supine-unilateral-bridge-to-neutral" target="_blank" rel="noopener">single-leg bridge EMG</a>)</li>' +
      '<li><b>Changed: a real pull every pull day.</b> Rows give the most lat work with the least low-back load. The Doorway Pull Hold now joins the prone work. A cheap resistance band would be the biggest upgrade. (<a href="https://www.asep.org/asep/asep/JEPonlineDecember2013_Snarr_Esco.pdf" target="_blank" rel="noopener">inverted row EMG</a>)</li>' +
      '<li><b>Added: walking on off days.</b> Aerobic fitness is a main driver of boxing performance; walking builds it with the fewest aches. (<a href="https://pubmed.ncbi.nlm.nih.gov/40129283/" target="_blank" rel="noopener">network meta-analysis</a>)</li>' +
      '<li><b>Changed: Day A tendon = Calf Raise Hold.</b> Day A already had two squat moves; Half-Squat Hold moved to Day C.</li>' +
      '<li><b>Confirmed: 90 sec rest.</b> Resting over 60 sec helps a little; over 90 sec adds nothing for muscle growth. (<a href="https://pubmed.ncbi.nlm.nih.gov/39205815/" target="_blank" rel="noopener">Singer 2024</a>)</li>' +
      '<li><b>Confirmed: Big 3 is good, not magic.</b> Motor-control core work is not better than other exercise for back pain — pick what you like and tolerate. (<a href="https://pubmed.ncbi.nlm.nih.gov/26742533/" target="_blank" rel="noopener">Cochrane review</a>)</li>' +
      '<li><b>Confirmed: no lifelong bending ban.</b> Flexion limits are for early disc symptoms; exercise is first-line care. (<a href="https://www.frontiersin.org/articles/10.3389/fphys.2024.1309663/full" target="_blank" rel="noopener">2024 review</a>)</li>' +
      '</ul></section>';
    h += '<section class="card"><h2>About the 3D demos</h2><p class="fine">A real-time 3D fighter styled after your reference: dark muscular body, blue headband with tails, satin trunks with blue side panels and a white waistband, high-top boots, bare hands, smoky blue stage with a glowing horizon and a wet floor. It is not those AI videos and not photorealistic — the body is built from rounded parts, so joints show. Drag the figure to turn the camera.</p></section>';
    return h;
  }

  // ---------------- events ----------------
  document.addEventListener('click', async (ev) => {
    const t = ev.target.closest('button, a'); if (!t) return;
    if (t.dataset.demo) { openDemo(t.dataset.demo); return; }
    if (t.dataset.go != null) { goSlide(t.dataset.go); return; }
    if (t.dataset.dot != null) { goSlide(t.dataset.dot); return; }
    if (t.dataset.day) { selDay = t.dataset.day; deckIdx = 0; render(); return; }
    if (t.id === 'dismiss') { lastResult = null; render(); return; }
    if (t.id === 'finish') { t.disabled = true; try { await finishWorkout(); } finally { t.disabled = false; } return; }
    if (t.dataset.check) { checkState.feel = t.dataset.check; render(); return; }
    if (t.dataset.cause) { checkState.cause = t.dataset.cause; render(); return; }
    if (t.id === 'saveCheck') { t.disabled = true; await saveCheck(); return; }
    const card = t.closest('[data-ex]');
    if (t.dataset.rate && card) { const d = D(card.dataset.ex); d.rating = d.rating === t.dataset.rate ? null : t.dataset.rate; saveDraft(); render(); return; }
    const fit = t.closest('[data-fit]');
    if (fit && t.dataset.enjoy) { const id = fit.dataset.fit; await put('fit', id, Object.assign({}, S.data.fit[id] || {}, { enjoy: Number(t.dataset.enjoy) })); render(); return; }
    if (fit && t.dataset.verdict != null) { const id = fit.dataset.fit; const o = Object.assign({}, S.data.fit[id] || {}); if (t.dataset.verdict) o.verdict = t.dataset.verdict; else delete o.verdict; await put('fit', id, o); render(); return; }
    if (t.dataset.move) { confirmMove = { k: t.dataset.move, dir: t.dataset.dir }; render(); return; }
    if (t.dataset.moveNo != null) { confirmMove = null; render(); return; }
    if (t.dataset.moveYes) {
      const k = t.dataset.moveYes; const st = stepOf(k); const to = confirmMove.dir === 'up' ? st + 1 : st - 1;
      const L = ladderState(k);
      const why = 'You moved ' + P.LADDERS[k].name + ' ' + confirmMove.dir + ' by hand.';
      await put('ladders', k, { step: to, hold: false, history: (L.history || []).concat([{ date: todayStr(), from: st, to, dir: confirmMove.dir, why }]) });
      await put('changes', 'c' + Date.now(), { at: new Date().toISOString(), date: todayStr(), text: why + ' Now Step ' + SN(to) + ': ' + P.LADDERS[k].steps[to].name + '.' });
      confirmMove = null; render(); return;
    }
    if (t.dataset.restore) { const p = Object.assign({}, profile() || {}); const s = Object.assign({}, p.swaps || {}); const k = t.dataset.restore; delete s[k]; p.swaps = s; await put('plan', 'profile', p); await put('changes', 'c' + Date.now(), { at: new Date().toISOString(), date: todayStr(), text: P.EX[k].name + ' restored by you.' }); render(); return; }
    if (t.id === 'saveWalk') { const v = Number($('#walkmin').value); if (!v || v < 1 || v > 300) { toast('Enter minutes walked.'); return; } await put('logs', 'walk' + Date.now(), { type: 'walk', date: todayStr(), minutes: v, title: 'Walk — ' + v + ' min', createdAt: new Date().toISOString(), entries: [] }); toast('Walk saved.'); render(); return; }
    if (t.id === 'saveWt') { const v = Number($('#wt').value); if (!v || v < 80 || v > 500) { toast('Enter your weight in lbs.'); return; } await put('body', 'b' + Date.now(), { date: todayStr(), lbs: v }); $('#wt').value = ''; render(); toast('Weight saved.'); return; }
    if (t.id === 'startDeload') { const p = Object.assign({}, profile() || {}); const until = new Date(Date.now() + 6 * 86400000); p.deloadUntil = until.toISOString().slice(0, 10); p.deloads = (p.deloads || []).concat([todayStr()]); await put('plan', 'profile', p); await put('changes', 'c' + Date.now(), { at: new Date().toISOString(), date: todayStr(), text: 'Deload week started: about half the sets, same levels, stop with 4+ reps left.' }); render(); return; }
  });
  document.addEventListener('input', (ev) => {
    const t = ev.target; const card = t.closest('[data-ex]');
    if (t.dataset.chkpain != null) { checkState.pain = Number(t.value); const b = t.parentElement.querySelector('.pv'); b.textContent = t.value + '/10'; b.className = 'pv ' + painClass(+t.value); return; }
    if (!card) return;
    const d = D(card.dataset.ex);
    if (t.dataset.set != null) { d.sets[+t.dataset.set] = t.value === '' ? null : Number(t.value); saveDraft(); }
    if (t.dataset.note != null) { d.note = t.value; saveDraft(); }
    if (t.dataset.pain != null) { d.pain = Number(t.value); saveDraft(); const b = t.parentElement.querySelector('.pv'); b.textContent = t.value + '/10'; b.className = 'pv ' + painClass(+t.value); }
  });
  document.addEventListener('change', (ev) => {
    const t = ev.target; const card = t.closest('[data-ex]');
    if (card && t.dataset.form != null) { D(card.dataset.ex).form = t.checked; saveDraft(); }
    if (card && t.dataset.done != null) { D(card.dataset.ex).done = t.checked; saveDraft(); }
    if (card && t.dataset.skip != null) { D(card.dataset.ex).skipped = t.checked; saveDraft(); }
    if (t.dataset.chkpain != null) render();
    if (t.id === 'noprone') { const p = Object.assign({}, profile() || {}); p.noProne = t.checked; put('plan', 'profile', p).then(() => put('changes', 'c' + Date.now(), { at: new Date().toISOString(), date: todayStr(), text: t.checked ? 'No lying face down turned on (rib pain): prone moves swapped for all-fours / doorway versions; Pull level held.' : 'No lying face down turned off: face-down moves are back.' })); render(); }
  });
  document.addEventListener('focusout', () => { setTimeout(() => { if (render.pending && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) { render.pending = false; render(); } }, 50); });
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (TABS.some((x) => x[0] === h)) { tab = h; render(); window.scrollTo(0, 0); } });

  // ---------------- demo player ----------------
  let player = null;
  const DEMO_ALIAS = { core3full: 'sidePlankFull' };
  function openDemo(id) {
    const ex = P.EX[id];
    const key = DEMO_ALIAS[id] || (ex && ex.demo) || id;
    const demo = window.DEMOS[key];
    const ov = $('#player'); ov.hidden = false; document.body.classList.add('noscroll');
    $('#pl-title').textContent = ex ? ex.name : (id === 'core3full' ? 'Side Plank — Full' : key);
    $('#pl-cues').innerHTML = ex ? cueList(ex) + (ex.wrong ? '<p class="wrongtxt"><b>Avoid:</b> ' + esc(ex.wrong) + '</p>' : '') : '';
    if (!window.THREE || !demo) { $('#pl-fail').hidden = false; return; }
    $('#pl-fail').hidden = true;
    if (!player) { const el = $('#pl-cap'); el.textContent = 'Building 3D figure…'; el.hidden = false; el.className = 'cap'; setTimeout(() => buildAndPlay(demo), 60); return; }
    buildAndPlay(demo);
  }
  function buildAndPlay(demo) {
    try {
      if (!player) {
        player = window.DemoEngine.Player($('#pl-canvas'), {
          caption: (c, w, beep, kind) => { const el = $('#pl-cap'); el.hidden = !c; el.className = 'cap' + (w ? ' wrong' : '') + (beep ? ' beep' : '') + (kind ? ' k-' + kind.toLowerCase() : ''); el.innerHTML = c ? (kind ? '<small>' + esc(kind) + '</small>' : '') + esc(c.replace(/^FEEL:\s*/, '')) : ''; },
          progress: (u) => { $('#pl-bar').style.width = (u * 100).toFixed(1) + '%'; },
        }, { style: 'fm', res: 0.013 });
      }
      requestAnimationFrame(() => { player.resize(); player.setDemo(demo); player.play(true); player.setSpeed(1); $('#pl-pause').textContent = 'Pause'; $('#pl-slow').classList.remove('on'); player.start(); });
    } catch (e) { $('#pl-fail').hidden = false; }
  }
  function closeDemo() { $('#player').hidden = true; document.body.classList.remove('noscroll'); if (player) player.stop(); }
  $('#pl-close').addEventListener('click', closeDemo);
  $('#player').addEventListener('click', (e) => { if (e.target.id === 'player') closeDemo(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#player').hidden) closeDemo(); });
  $('#pl-pause').addEventListener('click', () => { if (!player) return; player.play(!player.isPlaying()); $('#pl-pause').textContent = player.isPlaying() ? 'Pause' : 'Play'; });
  $('#pl-slow').addEventListener('click', (e) => { if (!player) return; const on = !e.target.classList.contains('on'); e.target.classList.toggle('on', on); player.setSpeed(on ? 0.5 : 1); });
  $('#pl-restart').addEventListener('click', () => { if (player) player.restart(); });
  window.addEventListener('resize', () => { if (player && !$('#player').hidden) player.resize(); });
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { /* demos still play on request; nothing autoplays */ }

  window.__app = { S, evaluateLadder, render, openDemo, put };
  render();
  initStore();
})();

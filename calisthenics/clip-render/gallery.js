global.window={}; require('/home/user/jonathanaquinorealtor.github.io/calisthenics/plan-data.js'); const P=window.PLAN; const fs=require('fs');
const slug=s=>s.toLowerCase().replace(/\(.*?\)/g,'').replace(/[—–]/g,' ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const groups=[];
for (const k of ['push','pull','legs','core','power']) groups.push([P.LADDERS[k].name+' ladder', P.LADDERS[k].steps.map((e,i)=>({e, label:'Step '+(i+1)}))]);
groups.push(['Big 3 core block', P.BIG3.map(e=>({e,label:'Every Day A + B'})).concat([{e:{name:'Side Plank (full version)'}, file:'side-plank-full', label:'After the knee version'}])]);
groups.push(['Extras', P.EXTRAS.map(e=>({e,label:'Warm-up / optional'}))]);
groups.push(['Tendons', P.TENDON.map(e=>({e,label:e.tendon}))]);
groups.push(['Mobility flow', P.MOBILITY.map((e,i)=>({e,label:(i+1)+' · '+e.dose}))]);
groups.push(['Reaction + footwork', P.REACTION.concat([P.FOOTWORK]).map(e=>({e,label:e.dose}))]);
groups.push(['Substitutes', P.SUBS.map(e=>({e,label:e.dose}))]);
const have=new Set(fs.readdirSync('fclips')); const files={}; let n=0; const seen=new Set();
let body='';
for (const [g,items] of groups){
  let cards='';
  for (const it of items){
    const f=(it.file||slug(it.e.name))+'-fighter-annotated.mp4';
    if(!have.has(f)||seen.has(f+g)) continue; seen.add(f+g);
    files['clips/'+f]='fclips/'+f; n++;
    cards+=`<figure><video src="clips/${f}" controls loop muted playsinline preload="metadata"></video><figcaption><b>${esc(it.e.name)}</b><span>${esc(it.label||'')}</span></figcaption></figure>`;
  }
  if(cards) body+=`<section><h2>${esc(g)}</h2><div class="grid">${cards}</div></section>`;
}
const html=`<title>Fighter Demo Clips</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;600&display=swap">
<style>
/* Layout: header, then a responsive grid of square clip cards per ladder. Dark-only (teal + black). */
:root{--bg:#050909;--surface:#0b1415;--line:#1c3331;--text:#e7f3f1;--muted:#8fb0ab;--teal:#1fd1bd;--display:'Barlow Condensed','Arial Narrow',sans-serif;--body:'Inter',system-ui,sans-serif;color-scheme:dark}
*{box-sizing:border-box}[hidden]{display:none!important}
body{background:var(--bg);color:var(--text);font:16px/1.5 var(--body);margin:0}
.wrap{max-width:1100px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 60px}
h1,h2{font-family:var(--display);text-transform:uppercase;letter-spacing:.04em;margin:0;text-wrap:balance}
h1{font-size:clamp(34px,7vw,52px);line-height:.95}h1 i{color:var(--teal);font-style:normal}
h2{font-size:24px;margin:34px 0 12px;color:var(--teal)}
.lede{color:var(--muted);max-width:64ch;margin:12px 0 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
figure{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden;min-width:0}
video{width:100%;aspect-ratio:1/1;display:block;background:#03070d}
figcaption{padding:10px 12px;display:grid;gap:2px}figcaption b{font-weight:600}figcaption span{color:var(--muted);font-size:14px}
</style>
<div class="wrap"><h1>Fighter Demo <i>Clips</i></h1>
<p class="lede">${n} standalone demo clips in your reference style: a dark muscular fighter with a blue headband and long tails, satin trunks with blue side panels and a white waistband, high-top boots, and bare hands (no gloves), on a smoky blue stage with a glowing horizon and a wet reflective floor. Each clip shows one full rep, with timed form captions that appear at the right moment. Red captions show the mistake to avoid. Rendered from the same real-time 3D engine as your plan's demos. It is not AI-generated video and not photorealistic, and the figure is built from rounded body parts, so it won't look as smooth as the reference.</p>
${body}</div>`;
fs.writeFileSync('gallery/index.html',html); fs.writeFileSync('gallery/files.json',JSON.stringify(files)); console.log('clips in gallery',n);

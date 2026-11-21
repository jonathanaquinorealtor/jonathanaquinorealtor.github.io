// usage: node render.js out_dir name[:slug] ...
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path'); const {execFileSync}=require('child_process');
const dir='/home/user/jonathanaquinorealtor.github.io/calisthenics/';
const FPS=30; const FONT='/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf';
const CUSTOM = JSON.parse(fs.readFileSync(__dirname+'/custom-caps.json','utf8'));
(async()=>{
  const [out, ...jobs] = process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:720,height:720}, deviceScaleFactor:1});
  p.on('pageerror', e=>console.log('ERR', e.message));
  await p.route('**/demo-engine.js', r=>r.fulfill({path:dir+'demo-engine.js'}));
  await p.route('**/demos.js', r=>r.fulfill({path:dir+'demos.js'}));
  await p.goto('file://'+__dirname+'/rharness.html');
  for (const job of jobs) {
    const [name, slug] = job.split(':');
    const info = await p.evaluate(n=>load(n), name);
    const tmp = path.join(__dirname,'frames',name); fs.rmSync(tmp,{recursive:true,force:true}); fs.mkdirSync(tmp,{recursive:true});
    const n = Math.ceil(info.total*FPS);
    for (let i=0;i<n;i+=30){
      const urls = await p.evaluate(({i,n,FPS})=>{const a=[];for(let k=i;k<Math.min(n,i+30);k++)a.push(frame(k/FPS));return a;},{i,n,FPS});
      urls.forEach((u,k)=>fs.writeFileSync(path.join(tmp,String(i+k).padStart(5,'0')+'.jpg'),Buffer.from(u.split(',')[1],'base64')));
    }
    // captions: one at a time
    let caps = CUSTOM[name] || info.caps.filter(c=>c.c).map(c=>({a:c.t0, b:c.t2, c:c.c, w:c.w}));
    if (!CUSTOM[name]) caps = caps.map(c=>({a:+c.a.toFixed(2), b:+Math.max(c.b, c.a+0.9).toFixed(2), c:c.c, w:c.w}));
    // no overlaps: clip each end at next start
    caps.sort((x,y)=>x.a-y.a); for (let k=0;k<caps.length-1;k++) caps[k].b=Math.min(caps[k].b, caps[k+1].a);
    const filters=[];
    caps.forEach((c,k)=>{
      const txt = c.c.replace(/✗\s*/g,'X  ').replace(/[’]/g,"'");
      const tf = path.join(tmp,'cap'+k+'.txt'); fs.writeFileSync(tf, txt);
      filters.push(`drawtext=fontfile=${FONT}:textfile=${tf}:fontcolor=white:fontsize=30:box=1:boxcolor=${c.w?'0x8a0f18':'0x05080d'}@0.82:boxborderw=16:x=(w-text_w)/2:y=h-text_h-46:enable='between(t,${c.a},${c.b})'`);
    });
    const title = path.join(tmp,'title.txt'); fs.writeFileSync(title, (slug||name).replace(/-/g,' ').toUpperCase());
    filters.unshift(`drawtext=fontfile=${FONT}:textfile=${title}:fontcolor=white:fontsize=34:x=28:y=26:shadowcolor=black@0.8:shadowx=2:shadowy=2`);
    const file = path.join(out,(slug||name)+'-grey-annotated.mp4');
    execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',path.join(tmp,'%05d.jpg'),'-vf',filters.join(','),'-c:v','libx264','-pix_fmt','yuv420p','-crf','23','-movflags','+faststart',file]);
    fs.rmSync(tmp,{recursive:true,force:true});
    console.log('ok', file, info.total.toFixed(1)+'s', (fs.statSync(file).size/1024|0)+'KB');
  }
  await b.close();
})();

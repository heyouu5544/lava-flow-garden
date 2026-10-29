/* Real installed Edge, headless CDP, no npm dependencies. Developer QA, not a user study. */
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'volcano-lab-check-'));
 const edge=spawn(process.env.EDGE_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9333','--remote-allow-origins=http://localhost:9333',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws;
 try{
  let target;for(let n=0;n<50;n++){try{target=await (await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(200);}}
  assert.ok(target,'Edge CDP started');console.log('Edge CDP connected');ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('WebSocket open timeout')),10000);ws.onopen=()=>{clearTimeout(t);r();};ws.onerror=e=>{clearTimeout(t);j(e);};});
  let id=0;const pending=new Map(),errors=[],logs=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+JSON.stringify(m.params.exceptionDetails.exception));else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,t=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method));},15000);pending.set(n,{resolve:v=>{clearTimeout(t);resolve(v);},reject:e=>{clearTimeout(t);reject(e);}});ws.send(JSON.stringify({id:n,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=async(expression,label,timeout=14000)=>{const end=Date.now()+timeout;while(Date.now()<end){if(await evaluate(expression))return;await sleep(120);}throw Error('Timed out: '+label);};
  const click=async selector=>{const b=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:e===document.elementFromPoint(x,y)||e.contains(document.elementFromPoint(x,y))}})()`);assert.ok(b.hit,`Unobstructed hit target: ${selector}`);await call('Input.dispatchMouseEvent',{type:'mousePressed',x:b.x,y:b.y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:b.x,y:b.y,button:'left',clickCount:1});};
  const key=async(key,code=key)=>{const virtual=({Enter:13,' ':32,Escape:27,Home:36,End:35,ArrowRight:39})[key];await call('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:virtual,nativeVirtualKeyCode:virtual});await call('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:virtual,nativeVirtualKeyCode:virtual});};
  const shots=path.resolve(__dirname,'../screenshots');await fs.mkdir(shots,{recursive:true});
  const screenshot=async name=>{await sleep(650);const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(shots,`storybook-${name}.png`),Buffer.from(r.data,'base64'));};
  await call('Page.enable');await call('Runtime.enable');await call('Log.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://127.0.0.1:4173/'});await wait('window.VolcanoLab && document.body.dataset.mode === "opening"','opening ready');await sleep(600);await screenshot('01-title');
  if(process.argv.includes('--layouts-only')){
   await click('#start-exploring');await click('#skip-tour');await click('#continue-dialogue');await screenshot('03-lesson');
   for(const [width,height] of [[390,844],[320,568],[844,390],[768,1024]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=844});await call('Page.navigate',{url:'http://127.0.0.1:4173/'});await wait('window.VolcanoLab && document.body.dataset.mode === "opening"','compact cover');await sleep(400);
    for(const selector of ['#start-exploring','#skip-opening'])assert.equal(await evaluate(`(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()`),true,`Cover action in viewport ${width}×${height}: ${selector}`);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await screenshot(width===390?'08-mobile-title':`layout-${width}-${height}`);
    if(width===390){await click('#start-exploring');await click('#skip-tour');await click('#continue-dialogue');await screenshot('09-mobile-lesson');await click('#skip-intro');}else await click('#skip-opening');await wait('document.body.dataset.mode === "lab"','direct entry');
   }
   assert.deepEqual(errors,[]);console.log('Compact 320×568, landscape 844×390, tablet 768×1024: visible cover actions, direct entry, no overflow or console errors');return;
  }
  const initial=await evaluate('document.querySelector("canvas").toDataURL()');await sleep(300);assert.notEqual(await evaluate('document.querySelector("canvas").toDataURL()'),initial,'Live cover animates');
  await click('#start-exploring');await wait('document.body.dataset.mode === "cinematic"','start CG');await wait('document.querySelector("canvas").dataset.shot === "village"','parallax tour');await screenshot('02-cinematic');
  await wait('!document.querySelector("#cg-dialogue").hidden','CG reaches lesson',12000);
  assert.equal(await evaluate('document.querySelector("#dialogue-progress").textContent'),'01 / 05');
  await click('#continue-dialogue');assert.equal(await evaluate('document.querySelector("#dialogue-text").textContent === document.querySelector("#dialogue-text").getAttribute("aria-label")'),true,'First click completes text');
  await screenshot('03-lesson');await key('Enter');assert.equal(await evaluate('document.querySelector("#dialogue-progress").textContent'),'02 / 05','Enter advances lesson');
  await click('#continue-dialogue');await key(' ','Space');assert.equal(await evaluate('document.querySelector("#dialogue-progress").textContent'),'03 / 05','Space advances lesson');
  await click('#continue-dialogue');await click('#continue-dialogue');await click('#continue-dialogue');await click('#continue-dialogue');await click('#continue-dialogue');await click('#continue-dialogue');
  await wait('document.body.dataset.mode === "lab"','all chapters enter lab');await sleep(800);await evaluate('window.scrollTo(0,0)');await screenshot('04-lab');
  logs.push('Title → 9-second parallax CG → 5 chapters → lab; typing, click, Enter, Space passed');
  await click('#viscosity');await key('End');assert.equal(await evaluate('document.querySelector("#viscosity").value'),'100','Viscosity keyboard End');
  await key('Home');await key('ArrowRight');assert.equal(await evaluate('document.querySelector("#viscosity").value'),'1');assert.match(await evaluate('document.querySelector("#viscosity-value").textContent'),/^1 /,'Live slider value');
  await click('#gas');await key('End');assert.equal(await evaluate('document.querySelector("#gas").value'),'100','Gas keyboard End');await key('Home');assert.equal(await evaluate('document.querySelector("#gas").value'),'0','Gas keyboard Home');
  logs.push('Both sliders accept actual mouse and Home/End/ArrowRight keyboard input; live values update');
  const results=[];
  for(const preset of ['15,15','15,85','85,15','85,85']){
   await click(`[data-preset="${preset}"]`);assert.equal(await evaluate(`document.querySelector('[data-preset="${preset}"]').getAttribute('aria-pressed')`),'true');await click('#trigger');
   assert.equal(await evaluate('document.querySelector("#viscosity").disabled'),true,'Parameters locked');
   if(preset==='15,15'){await click('#trigger');assert.match(await evaluate('document.querySelector("#notice").textContent'),/不会重复触发/);}
   await sleep(4200);await evaluate('document.querySelector(".observatory").scrollIntoView({block:"start",behavior:"instant"})');await screenshot('eruption-'+preset.replace(',','-'));
   await wait('document.querySelector(".results").dataset.revealed === "true"','eruption completes');
   assert.equal(await evaluate('document.querySelector("#history-card").hidden'),false);results.push(await evaluate('({v:document.querySelector("#viscosity").value,g:document.querySelector("#gas").value,metrics:["flow","ash","intensity","hazard"].map(k=>Number(document.getElementById(k+"-result").textContent)),history:document.querySelector("#history-name").textContent})'));
  }
  await evaluate('document.querySelector(".results").scrollIntoView({block:"start",behavior:"instant"})');await screenshot('05-results');
  await click('[data-preset="15,15"]');assert.match(await evaluate('document.querySelector("#result-context").textContent'),/85 \/ 气体 85/,'Old results keep their original inputs');
  for(const part of ['crater','ash','lava','village']){await click(`[data-part="${part}"]`);await sleep(1000);assert.equal(await evaluate('VolcanoLab.scene.part'),part);assert.match(await evaluate('document.querySelector("#part-description").textContent'),new RegExp(({crater:'火山口',ash:'火山灰云',lava:'熔岩流',village:'山脚村庄'})[part]));}
  await screenshot('06-village');await click('#return-overview');await sleep(1000);assert.equal(await evaluate('VolcanoLab.scene.canvas.dataset.shot'),'front');
  await click('[data-view="section"]');await sleep(1000);await screenshot('07-section');
  await click('#reset');assert.deepEqual(await evaluate('[document.querySelector("#viscosity").value,document.querySelector("#gas").value,document.querySelector("#flow-result").textContent,document.querySelector("#history-card").hidden]'),['40','40','—',true]);
  await click('#trigger');await sleep(600);await click('#reset');await sleep(300);assert.equal(await evaluate('document.querySelector("#progress").getAttribute("aria-valuenow")'),'0','Reset cancels active frame');
  await click('[data-preset="15,15"]');await click('#trigger');await wait('document.querySelector(".results").dataset.revealed === "true"','eruption after reset');
  await click('#replay-intro');await wait('document.body.dataset.mode === "cinematic"','replay');await click('#skip-tour');await key('Escape');await wait('document.body.dataset.mode === "lab"','Escape skips lesson');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await call('Page.navigate',{url:'http://127.0.0.1:4173/'});await wait('window.VolcanoLab && document.body.dataset.mode === "opening"','mobile cover');await sleep(600);await screenshot('08-mobile-title');
  await click('#start-exploring');await click('#skip-tour');await click('#continue-dialogue');await screenshot('09-mobile-lesson');await click('#skip-intro');await sleep(800);await evaluate('window.scrollTo(0,0)');await screenshot('10-mobile-lab');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'No mobile horizontal overflow');
  await click('[data-preset="85,85"]');await screenshot('11-mobile-controls');await click('#trigger');await wait('document.querySelector(".results").dataset.revealed === "true"','mobile eruption');await evaluate('document.querySelector(".results").scrollIntoView({block:"start",behavior:"instant"})');await screenshot('12-mobile-results');
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await call('Page.navigate',{url:'http://127.0.0.1:4173/?step=lesson'});await wait('window.VolcanoLab && !document.querySelector("#cg-dialogue").hidden','reduced motion lesson');assert.equal(await evaluate('document.querySelector("#dialogue-text").getAttribute("aria-busy")'),'false','Reduced motion instant text');await key('Escape');
  assert.deepEqual(errors,[],'No console errors or uncaught exceptions');
  console.log(JSON.stringify({browser:'Installed Microsoft Edge / headless CDP',desktop:'1440×1000',mobile:'390×844',results,consoleErrors:errors,checks:[...logs,'4 presets, repeat protection, all observation targets, overview, section, Reset during/after eruption, second eruption, replay, skip, reduced motion, mobile hit targets and overflow passed']},null,2));
 }finally{if(ws)ws.close();edge.kill();await sleep(500);if(path.dirname(profile)===os.tmpdir()&&path.basename(profile).startsWith('volcano-lab-check-'))await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

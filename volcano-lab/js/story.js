(function(){
 'use strict';
 const $=id=>document.getElementById(id),scene=window.VolcanoLab.scene;
 const chapters=[
  {tag:'01 / MEET A VOLCANO',title:'A mountain can be a window into the Earth.',text:'Magma rises through underground passages. When it reaches the surface through the crater, we call it lava. Notice the village below: volcanoes share their landscapes with everyday life.',shot:'front'},
  {tag:'02 / MAGMA VISCOSITY',title:'Runny syrup or thick honey?',text:'Viscosity describes how strongly magma resists flowing. Low-viscosity lava can move quickly and travel far; high-viscosity lava moves slowly and piles up near the crater.',shot:'lava',sample:[15,15]},
  {tag:'03 / GAS CONTENT',title:'Gas trapped in magma wants to escape.',text:'As magma rises, its gas expands. More gas produces stronger jets, while sticky magma can trap that gas and allow pressure to build into a more explosive eruption.',shot:'section',sample:[85,85]},
  {tag:'04 / RUN THE EXPERIMENT',title:'Change one variable at a time.',text:'Move the two sliders, then select Trigger eruption. Watch the lava, ash column, and debris. Afterward, four result cards and a historical comparison explain what happened.',shot:'observe',sample:[15,85]},
  {tag:'05 / YOUR TURN',title:'Now wake the volcano yourself.',text:'Begin with low viscosity and low gas. Then keep viscosity steady and raise only the gas content. Open the lab and make your first comparison.',shot:'front'}
 ];
 let index=0,timers=[],state='opening',typing=null,typed=0,fullText='',lastTick=0;
 function stopTyping(){cancelAnimationFrame(typing);typing=null;}
 function cancel(){timers.forEach(clearTimeout);timers=[];stopTyping();}
 function mode(name){document.body.dataset.mode=name;state=name;}
 function lab(){cancel();mode('lab');scene.draw(null,0);scene.setView('front',650);$('opening').hidden=true;$('cinematic').hidden=true;document.title='Volcano Lab | Interactive Eruption Experiment';$('page-title').focus({preventScroll:true});window.scrollTo(0,0);}
 function finishText(){stopTyping();typed=fullText.length;$('dialogue-text').textContent=fullText;$('dialogue-text').setAttribute('aria-busy','false');}
 function chapter(){
  stopTyping();const data=chapters[index];$('cg-dialogue').hidden=false;$('chapter-tag').textContent=data.tag;$('dialogue-title').textContent=data.title;$('dialogue-progress').textContent=`0${index+1} / 05`;$('continue-dialogue').textContent=index===4?'Open the lab →':'Continue →';$('camera-readout').textContent=['Volcano and village','Flowing lava','Volcano cutaway','Eruption behavior','Full scene'][index];
  scene.tourShot(data.shot,1300);scene.draw(data.sample?window.VolcanoModel.calculate(...data.sample):null,index===2?.12:data.sample?.53:0);
  fullText=data.text;typed=0;$('dialogue-text').textContent='';$('dialogue-text').setAttribute('aria-label',fullText);$('dialogue-text').setAttribute('aria-busy','true');lastTick=performance.now();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)finishText();
  else {const tick=now=>{if(now-lastTick>=32){typed=Math.min(fullText.length,typed+Math.max(1,Math.floor((now-lastTick)/32)));lastTick=now;$('dialogue-text').textContent=fullText.slice(0,typed);}if(typed<fullText.length)typing=requestAnimationFrame(tick);else finishText();};typing=requestAnimationFrame(tick);}
  $('dialogue-title').focus({preventScroll:true});
 }
 function advance(){if(state!=='cinematic'||$('cg-dialogue').hidden)return;if(typed<fullText.length){finishText();return;}if(index<4){index++;chapter();}else lab();}
 function start(immediate=false){
  cancel();mode('cinematic');$('opening').hidden=true;$('cinematic').hidden=false;index=0;$('skip-tour').hidden=false;
  if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){$('skip-tour').hidden=true;chapter();return;}
  $('cg-dialogue').hidden=true;$('skip-tour').focus({preventScroll:true});
  [[0,'wide','Distant mountains and sky'],[1800,'village','Pan · Life at the foothills'],[3600,'slope','Push in · Painted rock layers'],[5400,'crater','Close-up · An opening in the Earth'],[7200,'section','Inside · Beneath the surface']].forEach(([delay,shot,label])=>timers.push(setTimeout(()=>{scene.tourShot(shot,1800);$('camera-readout').textContent=label;},delay)));
  timers.push(setTimeout(()=>{$('skip-tour').hidden=true;chapter();},9000));
 }
 $('start-exploring').addEventListener('click',()=>start());$('skip-opening').addEventListener('click',lab);$('skip-intro').addEventListener('click',lab);
 $('skip-tour').addEventListener('click',()=>{cancel();$('skip-tour').hidden=true;chapter();});
 $('continue-dialogue').addEventListener('click',advance);
 $('cg-dialogue').addEventListener('click',event=>{if(!event.target.closest('button,a'))advance();});
 $('replay-intro').addEventListener('click',event=>{event.preventDefault();window.VolcanoLab.reset();start();window.scrollTo(0,0);});
 document.addEventListener('keydown',event=>{
  if(state!=='cinematic')return;if(event.key==='Escape'){event.preventDefault();lab();return;}
  if((event.key==='Enter'||event.key===' ')&&!event.repeat){
   if(event.target.closest('a,input')||(event.target.closest('button')&&event.target.id!=='continue-dialogue'))return;
   event.preventDefault();if($('cg-dialogue').hidden){cancel();$('skip-tour').hidden=true;chapter();}else advance();
  }
 });
 if(document.body.dataset.entry==='lab')lab();else if(new URLSearchParams(location.search).get('step')==='lesson')start(true);else{mode('opening');scene.tourShot('opening',0);}
 window.addEventListener('pagehide',()=>{cancel();scene.dispose();});
})();

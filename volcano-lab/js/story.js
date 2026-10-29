(function(){
 'use strict';
 const $=id=>document.getElementById(id),scene=window.VolcanoLab.scene;
 const chapters=[
  {tag:'01 / 认识火山',title:'一座山，也是一扇通向地下的窗。',text:'地下的岩浆沿通道上升，从火山口来到地表，就成为熔岩。看看山脚的村庄：火山也与周围的生活相连。',shot:'front'},
  {tag:'02 / 岩浆黏度',title:'像糖浆，还是像浓蜂蜜？',text:'黏度决定岩浆有多难流动。低黏度熔岩能快速流远；高黏度熔岩流得慢，容易在火山口附近厚厚地堆积。',shot:'lava',sample:[15,15]},
  {tag:'03 / 气体含量',title:'藏在岩浆里的气体，想要出来。',text:'岩浆上升时，气体会膨胀。气体越多，喷射越明显；黏稠的岩浆又会阻碍气体逸出，更容易形成强烈爆发。',shot:'section',sample:[85,85]},
  {tag:'04 / 实验操作',title:'一次只改一个参数，发现不同。',text:'拖动两个滑块，再点击 Trigger eruption。观察熔岩、灰柱和碎屑；喷发后，四张结果卡片与历史案例会帮助你理解原因。',shot:'observe',sample:[15,85]},
  {tag:'05 / 轮到你了',title:'现在，亲手唤醒这座火山。',text:'先试试低黏度、低气体，再只提高气体含量。准备好了吗？展开实验台，做出你的第一组比较。',shot:'front'}
 ];
 let index=0,timers=[],state='opening',typing=null,typed=0,fullText='',lastTick=0;
 function stopTyping(){cancelAnimationFrame(typing);typing=null;}
 function cancel(){timers.forEach(clearTimeout);timers=[];stopTyping();}
 function mode(name){document.body.dataset.mode=name;state=name;}
 function lab(){cancel();mode('lab');scene.draw(null,0);scene.setView('front',650);$('opening').hidden=true;$('cinematic').hidden=true;document.title='VOLCANO LAB｜彩色火山实验室';$('page-title').focus({preventScroll:true});window.scrollTo(0,0);}
 function finishText(){stopTyping();typed=fullText.length;$('dialogue-text').textContent=fullText;$('dialogue-text').setAttribute('aria-busy','false');}
 function chapter(){
  stopTyping();const data=chapters[index];$('cg-dialogue').hidden=false;$('chapter-tag').textContent=data.tag;$('dialogue-title').textContent=data.title;$('dialogue-progress').textContent=`0${index+1} / 05`;$('continue-dialogue').textContent=index===4?'展开实验台 →':'继续 →';$('camera-readout').textContent=['火山与村庄','流动的熔岩','山体剖面','喷发表现','场景全景'][index];
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
  [[0,'wide','远山与天空'],[1800,'village','横移 · 山脚的生活'],[3600,'slope','推进 · 斑斓的岩层'],[5400,'crater','靠近 · 地球的出口'],[7200,'section','进入 · 地表之下']].forEach(([delay,shot,label])=>timers.push(setTimeout(()=>{scene.tourShot(shot,1800);$('camera-readout').textContent=label;},delay)));
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

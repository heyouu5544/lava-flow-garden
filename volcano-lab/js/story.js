(function(){
  'use strict';
  const $=id=>document.getElementById(id),scene=window.VolcanoLab.scene;
  const chapters=[
    {tag:'01 / 火山与聚落',title:'这座山，与周围的生活相连。',text:'远山、道路、农田与山脚的村庄，共享这片地形。沿着地表向上观察，我们将从周边环境接近火山口，再走进地表之下。',shot:'village'},
    {tag:'02 / 地球的出口',title:'火山口，是地下与地表的连接。',text:'熔融岩石、晶体与气体组成岩浆。岩浆沿通道上升，到达火山口；流到地表之后，它有了另一个名字：熔岩。观察红色的出口与岩层边缘。',shot:'crater'},
    {tag:'03 / 岩浆与气体',title:'切开山体，看见气体的力量。',text:'剖面中的红色储集区与通道表示岩浆；浅色圆圈表示气体。岩浆上升时，周围压力降低，气体析出并膨胀。黏稠岩浆会阻碍气体逸出，增强爆发倾向。',shot:'section',sample:[85,85]},
    {tag:'04 / 两种不同的喷发',title:'有的流向远处，有的冲向天空。',text:'低黏度熔岩更容易沿沟壑铺展、分叉。高黏度又富含气体时，喷出碎屑更多、灰柱更高。每次喷发会经历压力积累、释放与冷却，低灰柱也不表示没有危险。',shot:'observe',sample:[15,75]},
    {tag:'05 / 轮到你了',title:'让这张地质档案，成为你的实验台。',text:'保持一个参数不变，只调整另一个，比较熔岩、灰柱、强度与范围。完成后可阅读历史喷发对照。这是教学模型，不能由两个滑块预测真实火山。',shot:'observe'}
  ];
  let index=0,timers=[],state='opening';
  function cancel(){timers.forEach(clearTimeout);timers=[];}
  function mode(name){document.body.dataset.mode=name;state=name;}
  function lab(){cancel();scene.draw(null,0);scene.setView('front',650);mode('lab');$('opening').hidden=true;$('cinematic').hidden=true;document.title='VOLCANO LAB｜二维火山实验室';$('page-title').focus({preventScroll:true});window.scrollTo(0,0);}
  function chapter(){const data=chapters[index];$('cg-dialogue').hidden=false;$('chapter-tag').textContent=data.tag;$('dialogue-title').textContent=data.title;$('dialogue-text').textContent=data.text;$('dialogue-progress').textContent=`0${index+1} / 05`;$('continue-dialogue').textContent=index===4?'展开实验台 →':'继续 →';$('camera-readout').textContent=['周边环境','火山口特写','山体剖面','喷发表现','场景全景'][index];scene.tourShot(data.shot,1300);scene.draw(data.sample?window.VolcanoModel.calculate(...data.sample):null,index===2?.1:data.sample?1:0);$('dialogue-title').focus({preventScroll:true});}
  function start(immediate=false){if(state==='cinematic')return;cancel();mode('cinematic');$('opening').hidden=true;$('cinematic').hidden=false;index=0;
    if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){chapter();return;}
    $('cg-dialogue').hidden=true;
    [[0,'wide','全景 / 地质调查区'],[1800,'village','横移 / 山脚聚落'],[3600,'slope','推进 / 火山岩层'],[5400,'crater','特写 / 地表出口'],[7200,'section','剖面 / 岩浆与气体']].forEach(([delay,shot,label])=>timers.push(setTimeout(()=>{scene.tourShot(shot,1800);$('camera-readout').textContent=label;},delay)));
    timers.push(setTimeout(chapter,9000));
  }
  $('start-exploring').addEventListener('click',()=>start());$('skip-opening').addEventListener('click',lab);$('skip-intro').addEventListener('click',lab);$('skip-tour').addEventListener('click',()=>{cancel();chapter();});$('continue-dialogue').addEventListener('click',()=>{if(index<4){index++;chapter();}else lab();});
  $('replay-intro').addEventListener('click',event=>{event.preventDefault();window.VolcanoLab.reset();start(true);window.scrollTo(0,0);});
  if(document.body.dataset.entry==='lab')lab();else if(new URLSearchParams(location.search).get('step')==='lesson')start(true);else{mode('opening');scene.tourShot('opening',0);}
  window.addEventListener('pagehide',cancel);
})();

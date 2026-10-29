/* Original code-drawn picture-book art; no reference illustrations embedded. */
(function(root){
 'use strict';
 const W=1400,H=800,INK='#302b67',RED='#f36b46',PAPER='#fff2cf',YELLOW='#ffe060';
 const clamp=n=>Math.max(0,Math.min(1,n));
 const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const shots={front:[700,400,1],wide:[700,400,.95],opening:[440,370,1.12],crater:[710,250,2.1],section:[710,455,1.15],ash:[735,170,1.65],lava:[870,490,1.7],slope:[850,470,1.5],village:[1150,635,2.5],observe:[700,400,1]};
 class VolcanoScene{
  constructor(canvas){
   this.canvas=canvas;this.ctx=canvas.getContext('2d');this.result=null;this.progress=0;this.view='front';this.part=null;this.camera=[...shots.front];this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
   if(!this.ctx){canvas.hidden=true;const p=document.createElement('p');p.textContent='绘图不可用，请使用下方文字结果继续实验。';canvas.parentElement.append(p);return;}
   const layer=()=>Object.assign(document.createElement('canvas'),{width:W,height:H});
   this.background=layer();this.terrain=layer();this.foreground=layer();this.paper=layer();this.makeTerrain();
   this.ratio=Math.min(devicePixelRatio||1,2);canvas.width=W*this.ratio;canvas.height=H*this.ratio;this.lastAmbient=0;
   const animate=now=>{if(now-this.lastAmbient>65&&!document.hidden){this.lastAmbient=now;if(!this.reduced.matches)this.draw(this.result,this.progress);}this.ambientFrame=requestAnimationFrame(animate);};this.ambientFrame=requestAnimationFrame(animate);
  }
  line(c,pts,color=INK,width=2){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
  polygon(c,pts,fill,stroke=null,width=2){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  brush(c,pts,color,width,seed=0){
   const samples=[];for(let j=1;j<pts.length;j++)for(let k=0;k<7;k++)samples.push(pts[j-1].map((v,a)=>v+(pts[j][a]-v)*k/7));samples.push(pts[pts.length-1]);
   const sides=[[],[]];samples.forEach(([x,y],i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],length=Math.hypot(b[0]-a[0],b[1]-a[1])||1;for(let side=0;side<2;side++){const d=width*(.36+noise(seed+i*3+side*72)*.27)*(side?1:-1);sides[side].push([x+(b[1]-a[1])*d/length,y-(b[0]-a[0])*d/length]);}});this.polygon(c,[...sides[0],...sides[1].reverse()],color);
  }
  blob(c,x,y,rx,ry,color,seed=0){const pts=[];for(let k=0;k<36;k++){const a=k/36*Math.PI*2,r=.93+noise(seed+k)*.14;pts.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r]);}this.polygon(c,pts,color);}
  label(c,x,y,title){c.font='bold 14px "Microsoft YaHei",sans-serif';const w=c.measureText(title).width;c.fillStyle=PAPER;c.fillRect(x-8,y-19,w+16,29);c.fillStyle=INK;c.fillText(title,x,y);}
  texture(c,pts,seed=1){c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();for(let i=0;i<1800;i++){const x=noise(i+seed)*W,y=noise(i+seed+4000)*H;c.fillStyle=i%4?'#fff4d52b':'#2927582b';c.fillRect(x,y,1+noise(i+8)*8,1+noise(i+2)*3);}for(let i=0;i<100;i++){const x=noise(i+seed+80)*W,y=noise(i+seed+200)*H;this.brush(c,[[x,y],[x+7,y-13],[x+12,y-29]],i%2?'#fff4d514':'#302b6712',3+noise(i)*7,i);}c.restore();}
  tree(c,x,y,s,color){c.save();c.translate(x,y);c.scale(s,s);this.blob(c,-9,-38,20,34,color,44);this.blob(c,9,-27,18,28,color,82);this.line(c,[[0,1],[-1,-58]],'#65c1ce',2);this.line(c,[[-1,-20],[-13,-37]],'#65c1ce',2);this.line(c,[[0,-14],[11,-32]],'#65c1ce',2);c.restore();}
  makeTerrain(){
   let c=this.background.getContext('2d');c.fillStyle='#58bdd9';c.fillRect(0,0,W,H);this.blob(c,1110,122,125,118,'#ffe7a0',7);
   this.polygon(c,[[0,335],[160,309],[279,326],[400,294],[530,333],[720,305],[900,338],[1100,294],[1400,322],[1400,800],[0,800]],'#aca9df');
   this.polygon(c,[[0,423],[175,369],[320,410],[470,359],[600,410],[835,369],[1010,398],[1190,351],[1400,395],[1400,800],[0,800]],'#727bc2');
   this.polygon(c,[[0,527],[210,459],[370,496],[610,440],[850,509],[1060,441],[1240,491],[1400,456],[1400,800],[0,800]],'#267caf');
   for(let i=0;i<80;i++){const x=noise(i+30)*1400,y=445+noise(i+71)*120;this.tree(c,x,y,.2+noise(i)*.4,i%2?'#395a94':'#439cc1');}this.texture(c,[[0,0],[1400,0],[1400,800],[0,800]],15);
   c=this.terrain.getContext('2d');
   const mountain=[[90,670],[195,623],[290,570],[381,512],[437,467],[488,409],[543,355],[596,304],[640,244],[670,259],[699,268],[724,261],[755,240],[788,295],[831,342],[884,410],[958,473],[1021,523],[1106,579],[1190,622],[1325,685]];
   this.polygon(c,mountain,INK);c.save();c.beginPath();mountain.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
   const slopes=[
    [[[100,669],[349,538],[529,365],[648,242],[673,263],[587,388],[475,501],[350,610],[226,681]],'#1d85ba'],
    [[[191,680],[379,583],[527,468],[630,320],[679,267],[654,366],[544,522],[396,647],[349,691]],'#669dd0'],
    [[[300,692],[478,588],[598,469],[676,290],[700,273],[683,441],[617,550],[484,687]],'#7c72bb'],
    [[[456,700],[618,558],[673,432],[700,273],[719,269],[747,442],[716,558],[677,704]],'#a28bc7'],
    [[[704,703],[744,557],[738,415],[723,264],[751,241],[816,352],[865,502],[1010,649],[1129,703]],'#57539a'],
    [[[755,277],[813,331],[865,418],[969,514],[1147,614],[1300,682],[1168,693],[1004,604],[903,525],[824,407]],'#3e83b9'],
    [[[640,396],[580,480],[486,560],[381,615],[267,674],[363,676],[517,593],[619,492]],'#c2a2c8'],
    [[[753,370],[790,451],[781,512],[825,584],[943,697],[1006,697],[894,568],[831,485]],'#d9afad']
   ];slopes.forEach(([pts,color],i)=>{this.polygon(c,pts,color);this.texture(c,pts,i*29+1);});
   for(let i=0;i<95;i++){const side=i%2?-1:1,t=noise(i+3),y=320+t*345,x=710+side*(50+t*350)*noise(i+61);this.line(c,[[x,y],[x+side*(8+noise(i)*25),y+11],[x+side*36,y+29]],i%3?'#373e7e88':'#f5cba67c',2+noise(i+1)*7);}
   for(let i=0;i<46;i++){const x=180+noise(i+76)*1050,y=350+noise(i+92)*330;this.polygon(c,[[x,y],[x+8,y-9],[x+18,y-5],[x+20,y+11],[x+6,y+15]],i%3?'#343568':'#b0a1ca');}c.restore();
   this.polygon(c,[[639,245],[662,235],[699,247],[729,234],[756,241],[739,268],[708,280],[670,269]],'#2e326a',RED,7);this.line(c,[[654,247],[681,254],[710,259],[738,246]],YELLOW,4);
   this.polygon(c,[[0,690],[166,673],[307,697],[509,676],[735,700],[947,663],[1124,679],[1400,662],[1400,800],[0,800]],'#52579d');
   this.polygon(c,[[942,691],[1040,643],[1128,660],[1250,623],[1400,666],[1400,800],[1010,800]],'#7275bb');
   this.line(c,[[1390,657],[1306,682],[1320,713],[1221,742],[1203,800]],'#70cad8',13);this.line(c,[[1108,626],[1070,674],[1111,701],[1050,750],[1090,800]],'#eeb39e',12);
   for(let j=0;j<5;j++){this.polygon(c,[[1114+j*23,718],[1134+j*23,705],[1190+j*23,742],[1167+j*23,757]],j%2?'#b6a5d6':'#e5b7b5');this.line(c,[[1120+j*23,718],[1170+j*23,749]],'#fff0cd',2);}
   [[1080,624,1],[1140,616,1.15],[1191,650,.9],[1118,670,.85],[1240,617,.8],[1280,674,.8],[1217,689,.7]].forEach(([x,y,s],i)=>{c.save();c.translate(x,y);c.scale(s,s);this.polygon(c,[[0,0],[27,-2],[27,29],[0,30]],i%2?'#fff2cf':'#efbfbc',INK,2);this.polygon(c,[[27,-2],[39,-13],[39,17],[27,29]],'#a5a2d4');this.polygon(c,[[-5,1],[13,-20],[43,-15],[27,-2]],i%2?RED:'#eb9a76',INK,2);c.fillStyle=INK;c.fillRect(11,15,7,15);c.fillStyle='#469ec4';c.fillRect(3,9,5,6);this.line(c,[[9,-15],[25,-11]],'#ffe3a5',2);c.restore();});
   for(let i=0;i<25;i++)this.tree(c,80+noise(i+70)*1260,682+noise(i+99)*100,.35+noise(i)*.45,i%3?'#274c81':'#4589af');this.texture(c,[[0,665],[1400,665],[1400,800],[0,800]],47);
   c=this.foreground.getContext('2d');[[45,819,2.4],[133,837,1.8],[1340,830,2.2],[1410,813,2.6],[272,829,1.3]].forEach(([x,y,s],i)=>this.tree(c,x,y,s,i%2?'#4975b0':'#35376e'));
   for(let i=0;i<35;i++){const x=noise(i+37)*1400,y=769+noise(i)*31;this.polygon(c,[[x,y],[x+6,y-12],[x+19,y-9],[x+26,y+3],[x+11,y+8]],i%2?'#30396e':'#8177b7');}
   c=this.paper.getContext('2d');for(let i=0;i<38000;i++){const x=noise(i)*W,y=noise(i+39000)*H;c.fillStyle=i%3?'#fff4d525':'#30306618';c.fillRect(x,y,.4+noise(i+5)*2.5,.4+noise(i+6)*1.8);}
  }
  moveTo(name,duration=900){cancelAnimationFrame(this.cameraFrame);let target=shots[name]||shots.front;if(name==='opening'&&matchMedia('(max-width:760px)').matches)target=[690,390,1];const from=[...this.camera],start=performance.now();this.canvas.dataset.shot=name;this.canvas.setAttribute('aria-busy','true');if(this.reduced.matches||!duration){this.camera=[...target];this.draw(this.result,this.progress);this.canvas.setAttribute('aria-busy','false');return;}const animate=now=>{const t=clamp((now-start)/duration),e=1-Math.pow(1-t,3);this.camera=from.map((n,i)=>n+(target[i]-n)*e);this.draw(this.result,this.progress);if(t<1)this.cameraFrame=requestAnimationFrame(animate);else this.canvas.setAttribute('aria-busy','false');};this.cameraFrame=requestAnimationFrame(animate);}
  setView(view,duration=900){this.view=view;this.part=null;this.moveTo(view,duration);}
  setPart(part,duration=900){this.part=part;if(part){this.view='front';this.moveTo(part,duration);}this.draw(this.result,this.progress);}
  tourShot(name,duration=1300){this.view=name==='section'?'section':'front';this.part=null;this.moveTo(name,duration);}
  clouds(c,time){[[210,133,1],[920,69,1.3],[1270,188,.7]].forEach(([x,y,s],i)=>{x+=Math.sin(time*.09+i)*35;c.save();c.translate(x,y);c.scale(s,s);this.blob(c,15,18,108,30,'#a8afd4',22);this.blob(c,0,0,99,29,PAPER,7);this.blob(c,-44,-15,38,31,PAPER,19);this.blob(c,19,-27,44,35,PAPER,33);this.blob(c,69,-7,39,28,PAPER,45);this.line(c,[[-76,12],[-38,17],[-11,13]],'#e0d1c1',4);c.restore();});}
  draw(result=null,progress=0){
   this.result=result;this.progress=progress;const c=this.ctx;if(!c)return;const time=this.reduced.matches?0:performance.now()/1000,p=this.reduced.matches&&result?1:progress,release=clamp((p-.16)/.64),opening=document.body.dataset.mode==='opening';
   c.setTransform(this.ratio,0,0,this.ratio,0,0);c.fillStyle='#58bdd9';c.fillRect(0,0,W,H);c.save();c.translate(700,400);const z=1.1+(this.camera[2]-1)*.18;c.scale(z,z);c.translate(-(700+(this.camera[0]-700)*.18),-(400+(this.camera[1]-400)*.18));c.drawImage(this.background,0,0);this.clouds(c,time);c.restore();
   c.save();c.translate(700,400);c.scale(this.camera[2],this.camera[2]);c.translate(-this.camera[0],-this.camera[1]);c.drawImage(this.terrain,0,0);if(this.view==='section')this.section(c,result,time);
   if(result){const growth=Math.pow(release,.55+result.viscosity/85);this.lava(c,result,p,growth,time);this.debris(c,result,p,time);this.ash(c,result,p,release,time);c.save();c.setLineDash([10,9]);c.strokeStyle='#ffe5a199';c.lineWidth=2;c.beginPath();c.ellipse(713,714,(130+result.hazard*4)*growth,30*growth,0,0,Math.PI*2);c.stroke();c.restore();}
   else if(opening){this.lava(c,{viscosity:20,flow:68,gas:35},.4,.81,time);this.ash(c,{ash:34},.4,.55,time);this.debris(c,{intensity:30,gas:35,viscosity:20},.4,time);}
   const targets={crater:[706,257,65,32,'火山口'],ash:[730,result?267-(27+result.ash*2.1)*release:180,80,50,'火山灰云'],lava:[865,478,85,52,'熔岩流'],village:[1160,654,119,68,'山脚村庄']};if(this.part){const [x,y,rx,ry,title]=targets[this.part];c.strokeStyle=YELLOW;c.lineWidth=4;c.setLineDash([10,7]);c.beginPath();c.ellipse(x,y,rx,ry,-.08,0,Math.PI*2);c.stroke();c.setLineDash([]);this.label(c,x-rx,y+ry+25,'✦ '+title);}c.restore();
   c.save();c.translate(700,400);c.scale(this.camera[2]*1.03,this.camera[2]*1.03);c.translate(-(700+(this.camera[0]-700)*1.1),-(400+(this.camera[1]-400)*1.1));c.drawImage(this.foreground,0,0);c.restore();c.drawImage(this.paper,0,0);
  }
  section(c,r,time){const pts=[[698,279],[735,273],[972,685],[473,685]];this.polygon(c,pts,'#c6a5d1',INK,4);c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();for(let j=0;j<10;j++){const y=325+j*39;this.line(c,[[450,y],[600,y+24],[738,y-8],[974,y+25]],j%2?'#6e62a3':'#e7c0b8',16);this.line(c,[[450,y+12],[600,y+32],[738,y+4],[974,y+39]],INK,3);}c.beginPath();c.moveTo(712,577);c.bezierCurveTo(668,461,751,384,713,267);c.strokeStyle=RED;c.lineWidth=42;c.stroke();c.strokeStyle=YELLOW;c.lineWidth=23;c.stroke();this.blob(c,712,587,111,58,RED,19);this.blob(c,712,587,89,39,YELLOW,9);this.line(c,[[705,503],[623,447],[600,390]],RED,13);this.line(c,[[705,503],[623,447],[600,390]],YELLOW,5);this.line(c,[[726,466],[796,408],[811,354]],RED,13);this.line(c,[[726,466],[796,408],[811,354]],YELLOW,5);for(let i=0;i<12;i++){const t=(i/12+time*.1)%1;this.blob(c,711+Math.sin(i)*8,553-t*258,3+(r?r.gas:40)/24,5,PAPER,i);}c.restore();this.line(c,[[750,569],[990,550]],YELLOW,3);this.label(c,990,548,'岩浆储集区');this.line(c,[[725,416],[970,381]],YELLOW,3);this.label(c,970,379,'气体上升 ↑');}
  lava(c,r,p,growth,time){
   const reach=clamp((.12+r.flow*.0088)*growth),paths=[[[709,270],[741,311],[735,351],[783,387],[797,428],[858,467],[905,511],[984,550],[1037,605],[1175,675],[1320,699]],[[700,273],[671,319],[656,355],[615,393],[594,439],[532,483],[491,539],[408,578],[331,636],[202,675]],[[783,387],[837,419],[851,461],[917,489],[967,529],[1068,568]]];
   paths.forEach((path,j)=>{const branch=j===2?clamp((reach-.27)/.73):reach,count=branch*(path.length-1),whole=Math.floor(count),pts=path.slice(0,whole+1);if(whole<path.length-1)pts.push(path[whole].map((n,k)=>n+(path[whole+1][k]-n)*(count-whole)));if(pts.length<2)return;const width=(10+r.viscosity*.2)*(j===2?.5:1);this.brush(c,pts,RED,width+7,j*33);this.brush(c,pts,'#ffae48',width*.68,j*21);this.brush(c,pts,YELLOW,Math.max(2,width*.31),j*15);c.save();c.setLineDash([5,12,3,19]);c.lineDashOffset=-time*(72-r.viscosity*.5);this.line(c,pts,'#fff3a9',Math.max(1,width*.12));c.restore();if(p>.72){c.save();c.globalAlpha=(p-.72)*1.5;c.setLineDash([6,18,11,20]);this.line(c,pts,INK,width*.3);c.restore();}});
   if(r.viscosity>=60&&r.gas<40&&growth>0){c.save();c.translate(707,270);c.scale(growth,growth);this.blob(c,0,-12,52,35,RED,80);this.blob(c,0,-18,43,26,'#62589b',71);for(let i=0;i<5;i++)this.line(c,[[-28+i*14,-31],[-33+i*16,-8]],i%2?YELLOW:RED,4);c.restore();}
  }
  ash(c,r,p,growth,time){
   if(growth<=0)return;const height=(27+r.ash*2.1)*growth,width=15+r.ash*.85;c.save();c.globalAlpha=p>.76?1-(p-.76)*1.2:1;
   for(let i=0;i<22;i++){const t=i/21,x=710+Math.sin(i*2.3+time*.5)*width*t*.24+t*t*width*.45,y=252-t*height,rad=(7+t*width*.5)*growth;this.blob(c,x+5,y+8,rad*1.35,rad,'#969bca',i*31);this.blob(c,x,y,rad*1.28,rad*.85,i%3?'#f9e8c4':'#c9badb',i*31);this.line(c,[[x-rad*.5,y+rad*.34],[x-rad*.2,y+rad*.5]],'#ada7c36b',Math.max(2,rad*.1));}
   if(r.ash>=60){const x=710+width*.45,y=252-height,s=growth;this.blob(c,x,y+10,110*s,37*s,'#929bc6',73);for(let i=0;i<4;i++)this.blob(c,x+(i-1.5)*43*s,y-Math.sin(i)*12*s,45*s,29*s,i%2?'#c9badb':PAPER,100+i*24);}
   c.restore();
  }
  debris(c,r,p,time){if(p<.17)return;const active=p>.78?1-clamp((p-.78)/.22):1,count=Math.floor(3+r.gas*.65);c.save();c.globalAlpha=active;if(r.intensity>60&&p>.18&&p<.31){const burst=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2,rad=i%2?28:65+(p-.18)*230;burst.push([710+Math.cos(a)*rad,258+Math.sin(a)*rad]);}this.polygon(c,burst,RED);this.blob(c,710,258,29,35,YELLOW,84);}if(r.gas>=60){for(let j=0;j<11;j++){const t=(time*(.5+r.gas*.006)+j*.117)%1,pts=[];for(let k=0;k<16;k++){const q=t*k/15;pts.push([710+(j-5)*29*q,260-(45+r.gas)*4*q*(1-q)]);}this.line(c,pts,RED,5);this.line(c,pts,YELLOW,2);}}for(let i=0;i<count;i++){const t=(time*(.35+r.gas*.006)+i*.173)%1,spread=(noise(i+36)-.5)*(110+r.intensity*6),x=710+spread*t,y=260-(30+r.gas*1.7)*4*t*(1-t);this.polygon(c,[[x,y-4],[x+5,y-2],[x+7,y+5],[x-3,y+6]],i%3?INK:RED);if(i%4===0)this.line(c,[[x,y],[x+3,y+3]],YELLOW,2);}c.restore();}
  reset(){this.view='front';this.part=null;this.moveTo('front',0);this.draw();}
  dispose(){cancelAnimationFrame(this.cameraFrame);cancelAnimationFrame(this.ambientFrame);}
 }
 root.VolcanoScene=VolcanoScene;
})(globalThis);

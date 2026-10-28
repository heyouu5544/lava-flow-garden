(function(root){
  'use strict';
  const W=1400,H=800,INK='#252421',RED='#991f25',PAPER='#f7f5ef';
  const clamp=n=>Math.max(0,Math.min(1,n));
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const shots={front:[700,400,1],wide:[700,400,1],opening:[420,375,1.06],crater:[715,280,2.1],side:[700,465,1.05],section:[700,465,1.05],top:[715,280,2.1],ash:[735,205,1.6],lava:[840,490,1.65],slope:[840,490,1.65],village:[1150,610,2.5],observe:[700,400,1]};
  class VolcanoScene{
    constructor(canvas){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.result=null;this.progress=0;this.view='front';this.part=null;this.camera=[...shots.front];this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
      if(!this.ctx){canvas.hidden=true;const fallback=document.createElement('p');fallback.className='static-volcano';fallback.textContent='△ 绘图不可用。请使用参数与下方文字结果继续实验。';canvas.parentElement.append(fallback);return;}
      this.terrain=document.createElement('canvas');this.terrain.width=W;this.terrain.height=H;this.makeTerrain(this.terrain.getContext('2d'));
      const ratio=Math.min(devicePixelRatio||1,2);canvas.width=W*ratio;canvas.height=H*ratio;this.ratio=ratio;
    }
    line(c,points,color=INK,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
    polygon(c,points,fill,stroke=INK,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
    label(c,x,y,title,subtitle=''){c.fillStyle=INK;c.font='bold 13px "Microsoft YaHei", sans-serif';c.fillText(title,x,y);c.font='10px Consolas,monospace';c.fillStyle='#65625c';c.fillText(subtitle,x,y+17);}
    makeTerrain(c){
      c.fillStyle=PAPER;c.fillRect(0,0,W,H);
      // Faint contour survey, leaving the upper sky open.
      c.strokeStyle='#d5d2ca';c.lineWidth=.7;
      for(let j=0;j<24;j++){c.beginPath();for(let x=-30;x<=1450;x+=14){const y=400+j*15+Math.sin(x/130+j*.19)*20+Math.cos(x/69)*7;x===-30?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
      [[80,328,350,64],[1100,355,280,60]].forEach(([cx,cy,rx,ry])=>{for(let k=0;k<7;k++){c.beginPath();c.ellipse(cx,cy,rx+k*20,ry+k*13,-.1,0,Math.PI*2);c.stroke();}});
      this.polygon(c,[[0,450],[95,385],[168,416],[278,340],[392,405],[478,359],[600,432],[800,409],[922,339],[1040,391],[1178,325],[1302,393],[1400,361],[1400,560],[0,560]],'#e4e2dc','#b1aea7');
      for(let i=0;i<220;i++){let x=noise(i)*1400,y=421+noise(i+20)*108;this.line(c,[[x,y],[x+7+noise(i+4)*22,y-6]],'#c4c0b8',.7);}
      this.background=document.createElement('canvas');this.background.width=W;this.background.height=H;this.background.getContext('2d').drawImage(this.terrain,0,0);c.clearRect(0,0,W,H);
      // Torn-paper silhouette and etched strata.
      const mountain=[[112,659],[213,606],[316,565],[397,489],[463,451],[519,394],[575,353],[617,292],[647,259],[670,267],[700,276],[726,273],[753,258],[780,292],[816,316],[855,376],[918,419],[973,480],[1046,519],[1119,584],[1243,642],[1312,670]];
      c.save();c.shadowColor='#3b332525';c.shadowBlur=12;c.shadowOffsetY=7;this.polygon(c,mountain,'#eeece5',INK,2.5);c.restore();
      c.save();c.beginPath();mountain.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
      this.polygon(c,[[706,273],[789,325],[828,441],[955,559],[1050,692],[682,692],[648,521]],'#b3b0a7',null);
      this.polygon(c,[[753,260],[855,376],[973,480],[1312,670],[1110,670],[868,523],[817,405]],'#d3d0c7',null);
      for(let i=0;i<450;i++){
        const t=i/449,x=117+t*1200,peak=700+(noise(i+1)-.5)*128;
        const endY=655+noise(i+5)*45;
        const pts=[];for(let k=0;k<=16;k++){let q=k/16;pts.push([peak+(x-peak)*q+Math.sin(k*.9+i)*q*10,266+(endY-266)*q]);}
        this.line(c,pts,i%5===0?'#36342e':'#79766e',i%7===0?1.2:.55);
      }
      for(let j=0;j<20;j++){let y=302+j*19+noise(j+60)*12,pts=[];for(let k=0;k<=25;k++){let x=160+k*46;pts.push([x,y+Math.sin(k*.36+j*.7)*10+noise(j*41+k)*8+(x-700)*.065]);}this.line(c,pts,'#e8e4db',j%3===0?2.1:.9);this.line(c,pts.map(([x,y])=>[x,y+2]),'#54514b',.65);}
      for(let i=0;i<5700;i++){const x=80+noise(i)*1250,y=265+noise(i+9000)*425;c.fillStyle=i%3?'#45423d55':'#f9f7f0';c.fillRect(x,y,noise(i+1)*1.6+.4,noise(i+2)*1.9+.4);}
      for(let i=0;i<36;i++){const x=548+i*2.4;this.line(c,[[x,353-i*.7],[x-37,407-i*.4],[x-19,433],[x-65,483],[x-102,524]],i%4?'#991f2540':'#991f2588',i%4?.55:1.1);}
      c.restore();
      // Crater rim: irregular double contour.
      this.polygon(c,[[646,259],[671,250],[707,254],[734,247],[754,259],[739,280],[709,288],[678,280]],'#292823',INK,2);
      this.polygon(c,[[667,265],[691,261],[717,265],[739,259],[730,276],[702,281]],RED,'#eee9df',1);
      this.line(c,[[647,259],[666,250],[691,254],[709,251],[734,247],[754,259]],'#fffdf8',3);
      // Fields, road, watercourse and village.
      this.line(c,[[1080,562],[1058,602],[1102,637],[1030,702],[1200,761]],'#d1ccc0',22);
      this.line(c,[[1080,562],[1058,602],[1102,637],[1030,702],[1200,761]],'#77736a',1);
      this.line(c,[[1270,580],[1242,628],[1270,676],[1237,720],[1325,784]],'#99988f',3);
      for(let j=0;j<4;j++){this.polygon(c,[[1120+j*21,679],[1135+j*21,670],[1180+j*21,710],[1160+j*21,720]],'#ddd9cd','#9b978b',.7);}
      [[1082,597,1],[1135,590,1.1],[1176,624,.9],[1118,644,.8],[1224,594,.7],[1273,647,.8],[1205,660,.75]].forEach(([x,y,s])=>{
        c.save();c.translate(x,y);c.scale(s,s);this.polygon(c,[[0,0],[25,-3],[25,24],[0,27]],'#eeeae0',INK,1.3);this.polygon(c,[[25,-3],[37,-13],[37,14],[25,24]],'#9c998f');this.polygon(c,[[-5,0],[13,-19],[41,-15],[25,-3]],'#4f4c46');c.fillStyle=INK;c.fillRect(10,12,6,13);c.fillRect(2,7,4,5);c.restore();
      });
      // Foreground ink-cut vegetation, kept on its own parallax layer.
      this.foreground=document.createElement('canvas');this.foreground.width=W;this.foreground.height=H;const terrainContext=c;c=this.foreground.getContext('2d');
      for(let i=0;i<47;i++){let x=noise(i+300)*1400,y=725+noise(i+400)*65,s=12+noise(i+600)*22;this.line(c,[[x,y],[x+1,y-s]],'#47453d',1);this.polygon(c,[[x,y-s-12],[x-s*.4,y-8],[x+s*.4,y-9]],'#4b493f',null);}
      this.label(terrainContext,89,709,'地质调查 / SECTOR 07','TOPOGRAPHIC FIELD RECORD');this.line(terrainContext,[[89,717],[260,717]],RED,2);
    }
    moveTo(name,duration=900){
      cancelAnimationFrame(this.cameraFrame);const target=shots[name]||shots.front;const from=[...this.camera],start=performance.now();this.canvas.setAttribute('aria-busy','true');this.canvas.dataset.shot=name;
      if(this.reduced.matches||!duration){this.camera=[...target];this.draw(this.result,this.progress);this.canvas.setAttribute('aria-busy','false');return;}
      const animate=now=>{let t=clamp((now-start)/duration),e=1-Math.pow(1-t,3);this.camera=from.map((n,i)=>n+(target[i]-n)*e);this.draw(this.result,this.progress);if(t<1)this.cameraFrame=requestAnimationFrame(animate);else this.canvas.setAttribute('aria-busy','false');};this.cameraFrame=requestAnimationFrame(animate);
    }
    setView(view,duration=900){this.view=view;this.part=null;this.moveTo(view,duration);}
    setPart(part,duration=900){this.part=part;if(part){this.view='front';this.moveTo(part,duration);}this.draw(this.result,this.progress);}
    tourShot(name,duration=1300){this.view=name==='section'?'section':'front';this.part=['village','crater','lava','ash'].includes(name)?name:null;this.moveTo(name,duration);}
    draw(result=null,progress=0){
      this.result=result;this.progress=progress;const c=this.ctx;if(!c)return;
      c.setTransform(this.ratio,0,0,this.ratio,0,0);c.fillStyle=PAPER;c.fillRect(0,0,W,H);
      const p=this.reduced.matches&&result?1:progress,release=clamp((p-.16)/.64);
      const energy=result?result.intensity/100:0;
      const shake=result&&!this.reduced.matches&&p>.18&&p<.3?Math.sin(p*500)*energy*3*(1-(p-.18)/.12):0;
      // Three actual drawing layers travel at distinct rates.
      c.save();c.translate(700,400);const distantZoom=1.18+(this.camera[2]-1)*.18;c.scale(distantZoom,distantZoom);c.translate(-(700+(this.camera[0]-700)*.18),-(400+(this.camera[1]-400)*.18));c.drawImage(this.background,0,0);c.restore();
      c.save();c.translate(700+shake,400);c.scale(this.camera[2],this.camera[2]);c.translate(-this.camera[0],-this.camera[1]);
      c.drawImage(this.terrain,0,0);
      if(this.view==='section'||this.view==='side')this.section(c,result,p);
      if(result){
        const growth=Math.pow(release,.6+result.viscosity/115);
        c.save();c.setLineDash([8,7]);c.strokeStyle='#991f2577';c.lineWidth=1.1;c.beginPath();c.ellipse(713,662,(145+result.hazard*4)*growth,36*growth,0,0,Math.PI*2);c.stroke();c.restore();
        this.lava(c,result,p,growth);this.ash(c,result,p,release);this.debris(c,result,p,release);
      }
      const targets={crater:[706,267,61,29,'火山口 / CRATER'],ash:[727,result?267-(25+result.ash*2.3)*release:196,60,44,'灰云 / ASH PLUME'],lava:[870,482,80,45,'熔岩流 / LAVA FLOW'],village:[1165,627,121,63,'聚落 / SETTLEMENT']};
      if(this.part){const [x,y,rx,ry,title]=targets[this.part];c.save();c.strokeStyle=RED;c.lineWidth=1.5;c.setLineDash([6,4]);c.beginPath();c.ellipse(x,y,rx,ry,-.1,0,Math.PI*2);c.stroke();c.setLineDash([]);const left=this.camera[0]-660/this.camera[2],right=this.camera[0]+660/this.camera[2],toLeft=x+rx+212>right,anchor=Math.max(left,Math.min(right-180,toLeft?x-rx-210:x+rx+32));this.line(c,[[x+(toLeft?-rx:rx),y],[anchor+(toLeft?180:0),y-34],[anchor+(toLeft?0:180),y-34]],RED,1);c.fillStyle=PAPER;c.fillRect(anchor,y-61,180,24);this.label(c,anchor+5,y-44,title);c.restore();}
      c.restore();
      c.save();c.translate(700,400);c.scale(this.camera[2]*1.03,this.camera[2]*1.03);c.translate(-(700+(this.camera[0]-700)*1.1),-(400+(this.camera[1]-400)*1.1));c.drawImage(this.foreground,0,0);c.restore();
      // Fixed registration markings remain legible at every camera scale.
      c.fillStyle=INK;c.font='10px Consolas,monospace';c.fillText('VL / FIELD SURVEY — 001',30,30);c.fillText('N 35°  /  E 138°  ·  SCHEMATIC',W-290,30);
      [[22,50,1,1],[1378,50,-1,1],[22,760,1,-1],[1378,760,-1,-1]].forEach(([x,y,a,b])=>this.line(c,[[x+17*a,y],[x,y],[x,y+17*b]],INK,1));
      c.fillStyle=RED;c.fillRect(30,45,58,4);c.fillRect(93,45,10,4);
      if(result){c.fillStyle=RED;c.font='bold 12px Consolas,monospace';c.fillText(`V ${String(result.viscosity).padStart(3,'0')}  /  G ${String(result.gas).padStart(3,'0')}     ${p<.16?'PRESSURE':p<.78?'RELEASE':'COOLING'}`,30,746);}
    }
    section(c,r,p){
      const points=[[694,281],[739,282],[914,659],[481,659]];
      this.polygon(c,points,'#eeebe3',INK,2);
      c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
      for(let j=0;j<20;j++){this.line(c,[[450,315+j*20],[650,329+j*19],[807,312+j*20],[950,335+j*20]],j%3?'#858078':'#403c36',j%3?1:3);}
      c.fillStyle='#272522';c.beginPath();c.ellipse(708,566,111,62,-.05,0,Math.PI*2);c.fill();
      c.strokeStyle='#2a2723';c.lineWidth=37;c.beginPath();c.moveTo(707,559);c.bezierCurveTo(659,459,753,382,713,275);c.stroke();
      c.strokeStyle=RED;c.lineWidth=22;c.stroke();c.fillStyle=RED;c.beginPath();c.ellipse(708,566,95,49,-.05,0,Math.PI*2);c.fill();
      this.line(c,[[632,575],[667,553],[710,578],[756,551],[787,569]],'#e9c3b0',3);
      for(let i=0;i<20;i++){let t=(i/20+(this.reduced.matches?0:p*.7))%1,x=710+Math.sin(i*2)*12,y=538-t*240;c.strokeStyle='#f2dbca';c.lineWidth=1;c.beginPath();c.arc(x,y,2+(r?r.gas:40)/30,0,Math.PI*2);c.stroke();}
      c.restore();this.line(c,[[713,454],[935,401],[1058,401]],RED,1);this.label(c,956,383,'气体膨胀 ↑','GAS EXSOLUTION');this.line(c,[[751,576],[951,558],[1080,558]],RED,1);this.label(c,968,540,'岩浆储集区','MAGMA RESERVOIR');
    }
    lava(c,r,p,growth){
      const reach=(.12+r.flow*.0088)*growth;
      const paths=[[[710,274],[744,315],[737,351],[785,383],[792,420],[860,462],[902,501],[982,539],[1031,600],[1170,672],[1320,693]],[[704,278],[673,318],[660,353],[613,394],[594,437],[528,479],[497,534],[408,576],[333,633],[202,674]],[[781,383],[836,413],[849,454],[914,482],[962,526],[1062,559]]];
      c.save();c.lineCap='round';c.lineJoin='round';
      paths.forEach((path,j)=>{
        const branch=j===2?clamp((reach-.27)/.73):reach;const count=branch*(path.length-1),whole=Math.floor(count),pts=path.slice(0,whole+1);if(whole<path.length-1){const t=count-whole;pts.push(path[whole].map((n,k)=>n+(path[whole+1][k]-n)*t));}if(pts.length<2)return;
        const width=(8+r.viscosity*.17)*(j===2?.5:1),cool=clamp((p-.66)/.34);
        const samples=[];for(let k=1;k<pts.length;k++){for(let step=0;step<5;step++){const t=step/5;samples.push(pts[k-1].map((n,a)=>n+(pts[k][a]-n)*t));}}samples.push(pts[pts.length-1]);
        const edges=[[],[]];samples.forEach(([x,y],i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],length=Math.hypot(b[0]-a[0],b[1]-a[1])||1;for(let side=0;side<2;side++){const radius=width*.5*(.55+noise(i*3+j+side*37)*.7)*(i===samples.length-1?.28:1),sign=side?1:-1;edges[side].push([x+(b[1]-a[1])/length*radius*sign,y-(b[0]-a[0])/length*radius*sign]);}});
        this.polygon(c,[...edges[0],...edges[1].reverse()],RED,'#4a3029',1.1);
        c.save();c.setLineDash([7,4,12,6]);c.lineDashOffset=-p*(180-r.viscosity);this.line(c,samples,'#e5b6a2',Math.max(.8,width*.1));c.restore();
        if(cool){c.save();c.globalAlpha=cool*.85;c.setLineDash([11,8,4,13]);this.line(c,samples,'#3c3530',width*.44);c.restore();}
      });
      if(r.viscosity>=60&&r.gas<40&&growth>0){c.save();c.translate(708,276);c.scale(growth,growth);this.polygon(c,[[-40,0],[-33,-15],[-23,-25],[-7,-31],[8,-29],[24,-20],[38,-3]],'#63544c',INK,1.2);for(let i=0;i<14;i++){let x=-30+i*4;this.line(c,[[x,0],[x*.6,-17-noise(i)*10]],i%3?'#b6a49a':RED,i%3?.7:2);}c.restore();}c.restore();
    }
    ash(c,r,p,growth){
      if(growth<=0)return;const height=(27+r.ash*2.1)*growth,width=15+r.ash*.8,fade=p>.76?1-(p-.76)*1.8:1;
      c.save();c.globalAlpha=fade;
      for(let i=0;i<42;i++){
        let t=i/41,x=710+Math.sin(i*2.7+p*9)*width*t*.57+t*t*width*.65,y=265-t*height,rad=(5+t*width*.46)*growth;
        c.beginPath();for(let k=0;k<=24;k++){const a=k/24*Math.PI*2,rr=rad*(.85+noise(i*30+k)*.3);let xx=x+Math.cos(a)*rr*1.4,yy=y+Math.sin(a)*rr;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();c.fillStyle=i%3?'#77756ee0':'#aaa69dc9';c.fill();c.strokeStyle='#3b39367a';c.lineWidth=.8;c.stroke();
        c.save();c.clip();c.fillStyle='#2c2a2670';for(let d=0;d<40;d++){let dx=x+(noise(i*43+d)-.5)*rad*3,dy=y+(noise(i*71+d)-.5)*rad*2;c.beginPath();c.arc(dx,dy,.7+(d%3)*.4,0,Math.PI*2);c.fill();}c.restore();
      }
      c.restore();
      if(r.ash>35){this.line(c,[[795+width*.2,263-height],[900+width*.2,263-height]],INK,.8);this.label(c,911+width*.2,263-height,'灰柱高度 '+r.ash,'RELATIVE INDEX / 100');}
    }
    debris(c,r,p,growth){
      if(p<.17)return;const active=1-clamp((p-.72)/.28),count=Math.floor(3+r.intensity*.65),tempo=1.2+r.gas*.045;
      c.save();c.globalAlpha=active;
      if(r.viscosity<40&&r.gas>=60){for(let jet=0;jet<9;jet++){const time=(p*tempo+jet*.113)%1,pts=[];for(let step=0;step<=12;step++){let t=time*step/12;pts.push([711+(jet-4)*18*t,267-(30+r.gas*.8)*4*t*(1-t)]);}this.line(c,pts,jet%3?RED:'#bc5a4b',1.2+jet%2);}}
      for(let i=0;i<count;i++){
        let t=(p*tempo+i*.173)%1,spread=(noise(i+36)-.5)*(110+r.intensity*5),x=711+spread*t,y=267-(30+r.intensity*1.6)*4*t*(1-t);
        this.line(c,[[x-spread*.03,y+3],[x,y]],'#55504a77',1);
        this.polygon(c,[[x,y-3],[x+3+noise(i)*3,y],[x+1,y+4],[x-3,y+2]],i%3?INK:RED,null);
      }
      if(p>.19&&p<.34&&r.intensity>35){c.globalAlpha=(1-(p-.19)/.15)*.8;for(let i=0;i<19;i++){let a=i/19*Math.PI*2,ra=28+growth*100;this.line(c,[[711+Math.cos(a)*ra,264+Math.sin(a)*ra],[711+Math.cos(a)*(ra+22+r.intensity*.3),264+Math.sin(a)*(ra+22+r.intensity*.3)]],i%4?INK:RED,1.5);}}
      if(p>.35){c.globalAlpha=active*.13;for(let i=0;i<12;i++){c.fillStyle=INK;c.beginPath();c.ellipse(500+i*32,659,22+growth*30,8+noise(i)*9,0,0,Math.PI*2);c.fill();}}c.restore();
    }
    reset(){this.view='front';this.part=null;this.moveTo('front',0);this.draw();}
    dispose(){cancelAnimationFrame(this.cameraFrame);}
  }
  root.VolcanoScene=VolcanoScene;
})(globalThis);

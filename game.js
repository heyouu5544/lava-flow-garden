/* Last 30 Seconds — 3D terrain revision. Three.js r160, bundled locally. */
(() => {
'use strict';
const $ = id => document.getElementById(id), canvas=$('world');
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,antialias:true}); }
catch(e) { $('status').textContent='3D graphics could not start. Enable hardware acceleration in your browser and reload.'; $('startBtn').disabled=true; return; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene();scene.background=new THREE.Color('#09111e');scene.fog=new THREE.FogExp2('#09111e',.014);
const camera=new THREE.PerspectiveCamera(43,1,.1,160), target=new THREE.Vector3(0,1.8,0);
let yaw=.48,pitch=.66,distance=37;
function cameraUpdate(){camera.position.set(target.x+distance*Math.sin(yaw)*Math.cos(pitch),target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(target);}
cameraUpdate();
scene.add(new THREE.HemisphereLight(0xabcaff,0x312325,2.1));
const moon=new THREE.DirectionalLight(0xa7c7ff,3.2);moon.position.set(-14,24,8);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-17,right:17,top:17,bottom:-17});moon.shadow.bias=-.001;scene.add(moon);
const fire=new THREE.PointLight(0xff5b18,65,20,1.4);fire.position.set(0,6,-3);scene.add(fire);
const material=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:.95,...more});
const stone=material(0x506071,{flatShading:true}), roof=material(0x243748), home=material(0xb8b3a1), molten=material(0xff5620,{emissive:0xff3300,emissiveIntensity:2}), gold=new THREE.LineDashedMaterial({color:0xffd58a,dashSize:.28,gapSize:.2});
function mesh(geometry,mat,x,y,z,parent=scene){let m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function terrainY(x,z){
 const r=Math.hypot(x,(z+3)*1.03), a=Math.atan2(z+3,x);
 const cone=Math.max(0,1-r/9.4)*6.8;
 const crater=Math.max(0,1-r/1.42)*2.6;
 const ridges=Math.sin(a*9+.5)*.29*Math.min(r/2,1)*Math.max(0,1-r/10);
 const noise=(Math.sin(x*2.7+z*1.3)*Math.cos(z*2.4-x)*.13+Math.sin(x*.8-z*.6)*.22)*Math.min(r,1);
 return Math.max(-.8,.18+cone-crater+ridges+noise-Math.max(0,Math.hypot(x,z)/11.7-1)*4);
}
const geo=new THREE.PlaneGeometry(29,29,110,110);geo.rotateX(-Math.PI/2);
const pos=geo.attributes.position,colors=[];
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=terrainY(x,z);pos.setY(i,y);let c=new THREE.Color(y>4?0x564750:y>1.5?0x414b56:0x354c49);c.multiplyScalar(.88+.15*Math.sin(x*4+z*3));colors.push(c.r,c.g,c.b);}
geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
const terrain=mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}),0,0,0);
const sea=mesh(new THREE.PlaneGeometry(180,180),material(0x103047,{metalness:.4,roughness:.38}),0,-.3,0);sea.rotation.x=-Math.PI/2;sea.receiveShadow=false;
// A visible crater rim and recessed pool are part of the terrain model.
const pool=mesh(new THREE.CircleGeometry(1.1,48),molten,0,4.85,-3);pool.rotation.x=-Math.PI/2;
function surfacePoint(x,z,offset=.1){return new THREE.Vector3(x,terrainY(x,z)+offset,z);}
function tube(points,radius,mat,parent=scene){if(points.length<2)return;const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*3),radius,5,false),mat,0,0,0,parent);}
// Glowing fissures on the upper cone.
for(let a=0;a<6;a++){const points=[];for(let r=1.2;r<4.5;r+=.15){let t=a*1.06+Math.sin(r*4+a)*.05;points.push(surfacePoint(Math.sin(t)*r,-3+Math.cos(t)*r,.09));}tube(points,.035,molten);}
const village={x:2,z:7}, dangerRadius=2.2;
for(let i=0;i<8;i++){const x=village.x+(i%3-1)*.85,z=village.z+(Math.floor(i/3)-1)*.95,y=terrainY(x,z);mesh(new THREE.BoxGeometry(.59,.6,.7),home,x,y+.3,z);let r=mesh(new THREE.ConeGeometry(.56,.4,4),roof,x,y+.8,z);r.rotation.y=Math.PI/4;mesh(new THREE.BoxGeometry(.14,.18,.012),material(0xffdb84,{emissive:0xffa42a,emissiveIntensity:1.3}),x,y+.35,z+.358);}
const villageLight=new THREE.PointLight(0xffc573,7,6);villageLight.position.set(2,2,7);scene.add(villageLight);
const dangerMat=new THREE.MeshBasicMaterial({color:0xe96260,transparent:true,opacity:.55});
const ring=[];for(let a=0;a<=80;a++){const t=a/80*Math.PI*2;ring.push(surfacePoint(2+Math.cos(t)*dangerRadius,7+Math.sin(t)*dangerRadius,.09));}tube(ring,.025,dangerMat);
let seed=7;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
for(let i=0;i<100;i++){const x=(rand()-.5)*24,z=(rand()-.5)*23,y=terrainY(x,z);if(y<0||y>2.5||Math.hypot(x-2,z-7)<2.5)continue;const r=mesh(new THREE.DodecahedronGeometry(.12+rand()*.35,0),stone,x,y+.12,z);r.scale.y=.7+rand();}
const exits={west:{x:-9,z:5,name:'Western Bay'},east:{x:9,z:6,name:'Eastern Quarry'},north:{x:7,z:-6,name:'North Basin'}};
const labels=[], exitRings={};
function label(text,p,key){const el=document.createElement('div');el.className='world-label';el.textContent=text;$('labels').append(el);labels.push({el,p,key});}
label('CRATER',new THREE.Vector3(0,6.6,-3));label('VILLAGE',surfacePoint(2,7,1.7));
for(const [key,p]of Object.entries(exits)){const m=mesh(new THREE.TorusGeometry(.55,.06,6,32),new THREE.MeshBasicMaterial({color:0x78d1d4}),p.x,terrainY(p.x,p.z)+.13,p.z);m.rotation.x=-Math.PI/2;exitRings[key]=m;label(p.name.toUpperCase(),surfacePoint(p.x,p.z,.75),key);}
// Soft smoke sprites, ash and hot particles, all generated locally.
const smokeCanvas=document.createElement('canvas');smokeCanvas.width=64;smokeCanvas.height=64;const ctx=smokeCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(160,157,165,.45)');gradient.addColorStop(1,'rgba(80,80,90,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
const smokeTex=new THREE.CanvasTexture(smokeCanvas), smoke=[];
for(let i=0;i<18;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,color:0x7c7b8b}));scene.add(s);smoke.push(s);}
const emberGeo=new THREE.BufferGeometry(), emberPositions=new Float32Array(60*3);emberGeo.setAttribute('position',new THREE.BufferAttribute(emberPositions,3));const embers=new THREE.Points(emberGeo,new THREE.PointsMaterial({color:0xffa044,size:.055,transparent:true,opacity:.85}));scene.add(embers);
// Hidden navigation samples on the continuous 3D surface; no visible tile map.
const STEP=.65,N=35,HALF=17,source={x:0,z:-1.05};
const node=(x,z)=>({r:Math.max(0,Math.min(N-1,Math.round(z/STEP)+HALF)),c:Math.max(0,Math.min(N-1,Math.round(x/STEP)+HALF))});
const world=n=>({x:(n.c-HALF)*STEP,z:(n.r-HALF)*STEP});const key=n=>n.r*N+n.c;const same=(a,b)=>a.r===b.r&&a.c===b.c;
const initial=node(source.x,source.z);let state;
const barrierGroup=new THREE.Group(),flowGroup=new THREE.Group(),previewGroup=new THREE.Group();scene.add(barrierGroup,flowGroup,previewGroup);
function clearGroup(g){for(const c of [...g.children]){g.remove(c);c.geometry?.dispose();}}
function fresh(){return{phase:'ready',outlet:'west',barriers:[],current:initial,trail:[world(initial)],hits:new Set(),seconds:30,started:0,lastStep:0,route:[],reached:false};}
state=fresh();
function blocked(n){const p=world(n);return state.barriers.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<.85);}
function findRoute(){
 const goal=node(exits[state.outlet].x,exits[state.outlet].z),start=state.current,dist=new Float64Array(N*N).fill(Infinity),prev=new Int32Array(N*N).fill(-1),open=[{...start,cost:0}];dist[key(start)]=0;
 while(open.length){open.sort((a,b)=>b.cost-a.cost);const here=open.pop(),hk=key(here);if(here.cost!==dist[hk])continue;if(same(here,goal))break;const p=world(here),hy=terrainY(p.x,p.z);
 for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const n={r:here.r+dr,c:here.c+dc};if(n.r<0||n.c<0||n.r>=N||n.c>=N||blocked(n))continue;if(dr&&dc&&(blocked({r:here.r+dr,c:here.c})||blocked({r:here.r,c:here.c+dc})))continue;const q=world(n),qy=terrainY(q.x,q.z);if(qy<-.1||Math.hypot(q.x,q.z+3)<1.1)continue;const cost=here.cost+Math.hypot(dr,dc)+Math.max(0,qy-hy)*9;const k=key(n);if(cost<dist[k]){dist[k]=cost;prev[k]=hk;open.push({...n,cost});}}
 }
 if(!Number.isFinite(dist[key(goal)]))return[];let k=key(goal),out=[];while(k!==-1){out.push({r:Math.floor(k/N),c:k%N});if(k===key(start))break;k=prev[k];}return out.reverse();
}
function sampled(points,offset=.14){const out=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];for(let t=0;t<1;t+=.2)out.push(surfacePoint(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,offset));}if(points.length)out.push(surfacePoint(points.at(-1).x,points.at(-1).z,offset));return out;}
function toast(text){$('toast').textContent=text;}
function updateRoute(){state.route=findRoute();clearGroup(previewGroup);if(state.route.length>1){const points=sampled(state.route.map(world),.23),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),gold);line.computeLineDistances();previewGroup.add(line);}
 const risky=state.route.some(n=>{const p=world(n);return Math.hypot(p.x-2,p.z-7)<dangerRadius;});$('routeReadout').textContent=state.route.length?`${exits[state.outlet].name} · ${risky?'Warning: route enters the village zone.':'Village buffer clear.'}`:'No open route. Remove a barrier or choose another outlet.';
 $('rockCount').textContent=`${3-state.barriers.length} available`;document.querySelectorAll('.rock-pip').forEach((el,i)=>el.classList.toggle('used',i>=3-state.barriers.length));
 document.querySelectorAll('[data-outlet]').forEach(el=>{const selected=el.dataset.outlet===state.outlet;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);});for(const [k,m]of Object.entries(exitRings))m.material.color.set(k===state.outlet?0xffc768:0x559caa);
}
function redrawBarriers(){clearGroup(barrierGroup);state.barriers.forEach((b,i)=>{const m=mesh(new THREE.DodecahedronGeometry(.64,0),stone,b.x,terrainY(b.x,b.z)+.43,b.z,barrierGroup);m.scale.set(1.3,1,1);m.userData.barrierIndex=i;});updateRoute();}
function addBarrier(p){if(state.phase==='finished'){toast('Reset to begin a new response.');return;}const existing=state.barriers.findIndex(b=>Math.hypot(p.x-b.x,p.z-b.z)<.9);if(existing>=0){state.barriers.splice(existing,1);redrawBarriers();toast('Barrier removed. Route updated.');return;}
 if(Math.hypot(p.x,p.z+3)<1.8||terrainY(p.x,p.z)<.05||Math.hypot(p.x-2,p.z-7)<1.6||Object.values(exits).some(e=>Math.hypot(p.x-e.x,p.z-e.z)<1)){toast('Keep the crater, village, water and outlets clear.');return;}
 if(state.trail.some(t=>Math.hypot(t.x-p.x,t.z-p.z)<.8)){toast('Lava is already here. Place the barrier ahead of the flow.');return;}
 if(state.barriers.length===3){toast('All three barriers are placed. Click a rock to remove it first.');return;}
 state.barriers.push({x:p.x,z:p.z});redrawBarriers();toast('Barrier placed. The gold forecast shows the new route.');}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,dragged=false;
function pick(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster;}
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY};dragged=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!down)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)dragged=true;if(dragged){yaw-=(e.clientX-down.lastX)*.007;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-down.lastY)*.006,.22,1.48);cameraUpdate();}down.lastX=e.clientX;down.lastY=e.clientY;});
canvas.addEventListener('pointerup',e=>{if(!down)return;if(!dragged){const ray=pick(e),rocks=ray.intersectObjects(barrierGroup.children),ground=ray.intersectObject(terrain);if(rocks.length&&(!ground.length||rocks[0].distance<ground[0].distance))addBarrier(state.barriers[rocks[0].object.userData.barrierIndex]);else if(ground.length)addBarrier(ground[0].point);else toast('Click dry land to place a barrier.');}down=null;});
canvas.addEventListener('pointercancel',()=>down=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.025,18,55);cameraUpdate();},{passive:false});
$('viewReset').onclick=()=>{yaw=.48;pitch=.66;distance=37;cameraUpdate();};$('viewTop').onclick=()=>{yaw=0;pitch=1.47;distance=34;cameraUpdate();};
function setPhase(text){$('phaseLabel').textContent=text;}
function reset(){state=fresh();clearGroup(flowGroup);redrawBarriers();$('timer').textContent='30';$('timer').classList.remove('urgent');$('result').classList.remove('show');$('startBtn').disabled=false;$('startBtn').textContent='START RESPONSE';setPhase('READY');$('mapHint').textContent='Choose an outlet, then start the response.';$('status').textContent='Place up to three barriers on the mountain and choose an outlet. Start when ready; you can keep adjusting as lava advances.';toast('Drag to orbit · scroll to zoom · click land to place a barrier.');}
function finish(reached){state.phase='finished';state.reached=reached;let score=Math.max(0,100-state.hits.size*18-(reached?0:24));$('score').textContent=score;$('resultTitle').textContent=reached&&!state.hits.size?'Village protected':'Village safety report';$('resultText').textContent=state.hits.size?`Lava entered ${state.hits.size} sections of the village buffer. Block the southern approach earlier or choose a route farther from the houses.`:reached?`Lava reached ${exits[state.outlet].name} safely. Try a different outlet and compare your result.`:'The village stayed clear, but lava did not reach an outlet within 30 seconds. Try a shorter diversion or remove a blocking rock.';$('result').classList.add('show');setPhase('REPORT');$('mapHint').textContent='Response complete · inspect the route and report.';$('startBtn').disabled=false;$('startBtn').textContent='PLAY AGAIN';$('status').textContent=reached?'Flow contained. Review your safety report.':'Time is up. Review the route and try another strategy.';}
$('startBtn').onclick=()=>{if(state.phase==='finished'){reset();return;}if(state.phase!=='ready')return;state.phase='running';state.started=performance.now();state.lastStep=state.started;setPhase('LIVE FLOW');$('mapHint').textContent='Live flow · click ahead of the lava to redirect.';$('startBtn').disabled=true;$('startBtn').textContent='FLOW IN PROGRESS';$('status').textContent='Lava is advancing. Place barriers ahead of the glowing front; you may still change outlets.';toast('The 30-second response has started.');};
$('resetBtn').onclick=reset;document.querySelectorAll('[data-outlet]').forEach(el=>el.onclick=()=>{if(state.phase==='finished'){toast('Reset before changing outlets.');return;}state.outlet=el.dataset.outlet;updateRoute();toast(`${exits[state.outlet].name} selected.`);});
function step(now){if(state.route.length<2){setPhase('FLOW BLOCKED');return;}setPhase('LIVE FLOW');state.current=state.route[1];const p=world(state.current);state.trail.push(p);if(Math.hypot(p.x-2,p.z-7)<dangerRadius)state.hits.add(key(state.current));updateRoute();if(same(state.current,node(exits[state.outlet].x,exits[state.outlet].z)))finish(true);}
let flowSignature='',lastDraw=0;
function animate(now){requestAnimationFrame(animate);const time=now*.001;
 if(state.phase==='running'){const elapsed=(now-state.started)/1000;state.seconds=Math.max(0,30-elapsed);$('timer').textContent=String(Math.ceil(state.seconds)).padStart(2,'0');$('timer').classList.toggle('urgent',state.seconds<=10);while(now-state.lastStep>=700&&state.phase==='running'&&state.lastStep+700-state.started<=30000){state.lastStep+=700;step(state.lastStep);}if(state.phase==='running'&&elapsed>=30)finish(false);}
 if(now-lastDraw>65){lastDraw=now;const points=[...state.trail];if(state.phase==='running'&&state.route.length>1){const a=world(state.current),b=world(state.route[1]),t=Math.min(1,(now-state.lastStep)/700);points.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});}const signature=JSON.stringify(points);if(signature!==flowSignature){flowSignature=signature;clearGroup(flowGroup);if(points.length>1)tube(sampled(points,.19),.15,molten,flowGroup);}}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 smoke.forEach((s,i)=>{const a=((reduced?i*.45:time*.65+i*.45)%8);s.position.set(a*.24+Math.sin(i*3)*.35,5.3+a*.8,-3+Math.cos(i)*.3);s.scale.setScalar(1+a*.36);s.material.opacity=.8*(1-a/8);});
 for(let i=0;i<60;i++){const a=((reduced?i*.13:time+i*.13)%3);emberPositions[i*3]=Math.sin(i*14)*a*.4;emberPositions[i*3+1]=5+a*1.5-a*a*.28;emberPositions[i*3+2]=-3+Math.cos(i*12)*a*.4;}emberGeo.attributes.position.needsUpdate=true;
 fire.intensity=reduced?65:62+Math.sin(time*5)*5;pool.scale.setScalar(1+(reduced?0:Math.sin(time*2)*.025));
 for(const l of labels){const p=l.p.clone().project(camera);l.el.style.left=`${(p.x*.5+.5)*canvas.clientWidth}px`;l.el.style.top=`${(-p.y*.5+.5)*canvas.clientHeight}px`;l.el.style.display=p.z>1?'none':'block';l.el.classList.toggle('active',l.key===state.outlet);}
 renderer.render(scene,camera);
}
new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}).observe(canvas);
reset();requestAnimationFrame(animate);
})();

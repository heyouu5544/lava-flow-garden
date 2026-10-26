/* Last 30 Seconds — expanded 3D village edition. Three.js r160, bundled locally. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("world"), TOTAL_RESIDENTS=780, TOTAL_BUILDINGS=30, LIMIT=3, ROUND=30;
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,antialias:true}); }
catch(e){ $("status").textContent="3D graphics could not start. Enable hardware acceleration and reload."; $("startBtn").disabled=true; return; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.62;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x10243c); scene.fog=new THREE.FogExp2(0x10243c,.009);
const camera=new THREE.PerspectiveCamera(43,1,.1,180), cameraTarget=new THREE.Vector3(0,1.7,.8);
let yaw=.46,pitch=.63,distance=39;
function updateCamera(){camera.position.set(cameraTarget.x+distance*Math.sin(yaw)*Math.cos(pitch),cameraTarget.y+distance*Math.sin(pitch),cameraTarget.z+distance*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(cameraTarget);}
updateCamera();

scene.add(new THREE.HemisphereLight(0xc9ddff,0x584238,3.25));
const moonLight=new THREE.DirectionalLight(0xc8dcff,4.4);moonLight.position.set(-16,26,12);moonLight.castShadow=true;moonLight.shadow.mapSize.set(2048,2048);Object.assign(moonLight.shadow.camera,{left:-21,right:21,top:21,bottom:-21});moonLight.shadow.bias=-.001;scene.add(moonLight);
const warmFill=new THREE.DirectionalLight(0xffaa72,1.35);warmFill.position.set(12,10,-8);scene.add(warmFill);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra});
const stone=mat(0x667584,{flatShading:true}),darkStone=mat(0x3c4653,{flatShading:true}),wall=mat(0xc7c0aa);
const roofs=[mat(0x395168),mat(0x7a493f),mat(0x455c4d)],molten=mat(0xff642c,{emissive:0xff3210,emissiveIntensity:2.35}),roadMat=mat(0xb69f77),forestMat=mat(0x315c4d);
const dangerMat=new THREE.MeshBasicMaterial({color:0xff7369,transparent:true,opacity:.75});
const safeLine=new THREE.LineDashedMaterial({color:0xffdc8a,dashSize:.32,gapSize:.2}),riskLine=new THREE.LineDashedMaterial({color:0xff6e58,dashSize:.32,gapSize:.15});
function mesh(geometry,material,x,y,z,parent=scene){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function terrainY(x,z){const zz=z+4.2,r=Math.hypot(x,zz*1.02),a=Math.atan2(zz,x),cone=Math.max(0,1-r/11.7)*7.8,crater=Math.max(0,1-r/1.55)*3.25,ridge=Math.sin(a*10+.3)*.38*Math.min(r/2,1)*Math.max(0,1-r/13),erosion=Math.sin(x*2.6+z*1.5)*Math.cos(z*2.1-x*.9)*.14,broad=Math.sin(x*.72-z*.55)*.25,coast=Math.max(0,Math.hypot(x*.95,z)/15.5-.88)*4;return Math.max(-.72,.48+cone-crater+ridge+erosion+broad-coast);}
const surface=(x,z,o=.1)=>new THREE.Vector3(x,terrainY(x,z)+o,z);
function tube(points,radius,material,parent=scene){if(points.length<2)return null;const curve=new THREE.CatmullRomCurve3(points,false,"centripetal");return mesh(new THREE.TubeGeometry(curve,Math.max(18,points.length*3),radius,6,false),material,0,0,0,parent);}

const terrainGeo=new THREE.PlaneGeometry(36,34,155,145);terrainGeo.rotateX(-Math.PI/2);
const tp=terrainGeo.attributes.position,colors=[];
for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),y=terrainY(x,z);tp.setY(i,y);const c=new THREE.Color(y>4.8?0x705b58:y>2.2?0x556372:y>.5?0x42675f:0x355f64);c.multiplyScalar(.94+.11*Math.sin(x*3.7+z*2.8));colors.push(c.r,c.g,c.b);}
terrainGeo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));terrainGeo.computeVertexNormals();
const terrain=mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.96}),0,0,0);
const sea=mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshPhysicalMaterial({color:0x1b5674,roughness:.28,metalness:.2,transparent:true,opacity:.92}),0,-.35,0);sea.rotation.x=-Math.PI/2;sea.receiveShadow=false;
const pool=mesh(new THREE.CircleGeometry(1.22,56),molten,0,5.24,-4.2);pool.rotation.x=-Math.PI/2;
const fire=new THREE.PointLight(0xff5d20,90,24,1.35);fire.position.set(0,7,-4.2);scene.add(fire);

for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=1.34+Math.sin(i*2.1)*.12,x=Math.cos(a)*r,z=-4.2+Math.sin(a)*r,rock=mesh(new THREE.DodecahedronGeometry(.22+(i%4)*.035,0),darkStone,x,terrainY(x,z)+.22,z);rock.scale.y=.8+(i%3)*.2;}
for(let f=0;f<8;f++){const points=[];for(let r=1.25;r<5.7;r+=.16){const a=f*.79+Math.sin(r*3.7+f)*.055;points.push(surface(Math.sin(a)*r,-4.2+Math.cos(a)*r,.11));}tube(points,.035,molten);}
let seed=37;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};

const districts=[
{id:"old",name:"Old Town",x:1.5,z:7,radius:2.3,population:320,buildings:12,houses:[]},
{id:"river",name:"River Ward",x:5.9,z:8.2,radius:2.05,population:270,buildings:10,houses:[]},
{id:"farm",name:"Farm Ridge",x:-3,z:8.7,radius:1.9,population:190,buildings:8,houses:[]}
];
function addHouse(x,z,v,d){const y=terrainY(x,z),g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const w=.62+(v%3)*.07,dep=.68+((v+1)%3)*.06,h=.62+(v%2)*.14;mesh(new THREE.BoxGeometry(w,h,dep),wall,0,h/2,0,g);const roof=mesh(new THREE.ConeGeometry(Math.max(w,dep)*.78,.42,4),roofs[v%3],0,h+.18,0,g);roof.rotation.y=Math.PI/4;mesh(new THREE.BoxGeometry(.12,.28,.12),darkStone,w*.23,h+.35,-dep*.15,g);mesh(new THREE.BoxGeometry(.18,.3,.025),mat(0x6f4a37),0,.2,dep/2+.014,g);const win=mat(0xffdc83,{emissive:0xffa62d,emissiveIntensity:1.6});mesh(new THREE.BoxGeometry(.14,.14,.026),win,-w*.25,h*.58,dep/2+.015,g);mesh(new THREE.BoxGeometry(.14,.14,.026),win,w*.25,h*.58,dep/2+.015,g);d.houses.push({x,z,object:g});}
function addTree(x,z,s=1){const y=terrainY(x,z);mesh(new THREE.CylinderGeometry(.055*s,.075*s,.45*s,6),mat(0x6a4b35),x,y+.22*s,z);mesh(new THREE.ConeGeometry(.3*s,.9*s,7),forestMat,x,y+.75*s,z);}
function addRing(d){const points=[];for(let i=0;i<=90;i++){const a=i/90*Math.PI*2;points.push(surface(d.x+Math.cos(a)*d.radius,d.z+Math.sin(a)*d.radius,.12));}tube(points,.028,dangerMat);}
districts.forEach((d,di)=>{addRing(d);const cols=d.id==="old"?4:d.id==="river"?5:4;for(let i=0;i<d.buildings;i++){const row=Math.floor(i/cols),col=i%cols,x=d.x+(col-(cols-1)/2)*.72+Math.sin(i*1.7)*.08,z=d.z+(row-.7)*.78+Math.cos(i*2.1)*.08;addHouse(x,z,i+di*4,d);}});
const towerY=terrainY(1.5,6.15);mesh(new THREE.BoxGeometry(.8,1.5,.8),mat(0xb4ac96),1.5,towerY+.75,6.15);const towerRoof=mesh(new THREE.ConeGeometry(.72,.72,4),roofs[1],1.5,towerY+1.85,6.15);towerRoof.rotation.y=Math.PI/4;const clock=mesh(new THREE.CylinderGeometry(.19,.19,.025,24),mat(0xf4dca2),1.5,towerY+1.25,6.565);clock.rotation.x=Math.PI/2;
[
[[-4.7,8.7],[-1.2,8.1],[1.5,7],[4.1,7.6],[7.6,8.4]],
[[1.5,10.3],[1.5,7],[.3,4.3],[-2.8,2.4]],
[[5.9,10],[5.9,8.2],[8.7,7.5],[11.5,7.2]]
].forEach(path=>tube(path.map(([x,z])=>surface(x,z,.08)),.09,roadMat));
for(let i=0;i<28;i++){const d=districts[i%3],a=random()*Math.PI*2,r=d.radius+.25+random()*1.25;addTree(d.x+Math.cos(a)*r,d.z+Math.sin(a)*r,.75+random()*.45);}
for(let i=0;i<12;i++){const x=-4.5+i*1.05,z=9.9+Math.sin(i*.8)*.35,y=terrainY(x,z);mesh(new THREE.CylinderGeometry(.025,.035,.55,6),darkStone,x,y+.27,z);const bulb=mesh(new THREE.SphereGeometry(.07,8,6),mat(0xffd98d,{emissive:0xffa62d,emissiveIntensity:2}),x,y+.58,z);bulb.castShadow=false;}
districts.forEach(d=>{const light=new THREE.PointLight(0xffc875,9,6.5);light.position.set(d.x,2.1,d.z);scene.add(light);});
for(let i=0;i<145;i++){const x=(random()-.5)*31,z=(random()-.5)*29,y=terrainY(x,z);if(y<.1||y>3.5||districts.some(d=>Math.hypot(x-d.x,z-d.z)<d.radius+.5))continue;const rock=mesh(new THREE.DodecahedronGeometry(.1+random()*.28,0),random()>.5?stone:darkStone,x,y+.12,z);rock.scale.y=.65+random();}

const moon=mesh(new THREE.SphereGeometry(1.15,24,16),new THREE.MeshBasicMaterial({color:0xe9f1ff}),-17,19,-30);moon.castShadow=false;
const starGeo=new THREE.BufferGeometry(),starPos=[];for(let i=0;i<260;i++)starPos.push((random()-.5)*115,10+random()*44,(random()-.5)*100);starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xdceaff,size:.07,transparent:true,opacity:.75})));

const exits={west:{x:-12.2,z:5.3,name:"Western Bay"},east:{x:12,z:7.2,name:"Eastern Quarry"},north:{x:9.3,z:-7.8,name:"North Basin"}};
const labels=[],exitRings={};
function label(text,point,key){const element=document.createElement("div");element.className="world-label";element.textContent=text;$("labels").append(element);labels.push({element,point,key});}
label("CRATER",new THREE.Vector3(0,7.2,-4.2));
districts.forEach(d=>label(`${d.name.toUpperCase()} · ${d.population}`,surface(d.x,d.z,1.8),d.id));
for(const [key,o] of Object.entries(exits)){const ring=mesh(new THREE.TorusGeometry(.58,.07,7,34),new THREE.MeshBasicMaterial({color:0x7adbe0}),o.x,terrainY(o.x,o.z)+.14,o.z);ring.rotation.x=-Math.PI/2;exitRings[key]=ring;label(o.name.toUpperCase(),surface(o.x,o.z,.85),key);}

const smokeCanvas=document.createElement("canvas");smokeCanvas.width=64;smokeCanvas.height=64;const ctx=smokeCanvas.getContext("2d"),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,"rgba(184,183,196,.58)");gradient.addColorStop(1,"rgba(90,95,111,0)");ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const smokeTex=new THREE.CanvasTexture(smokeCanvas),smoke=[];
for(let i=0;i<24;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,color:0x989baa}));scene.add(s);smoke.push(s);}
const emberGeo=new THREE.BufferGeometry(),emberPos=new Float32Array(270);emberGeo.setAttribute("position",new THREE.BufferAttribute(emberPos,3));const embers=new THREE.Points(emberGeo,new THREE.PointsMaterial({color:0xffbc64,size:.065,transparent:true,opacity:.9}));scene.add(embers);

const STEP=.5,SIZE=55,HALF=27,source={x:0,z:-2.75};
const node=(x,z)=>({r:Math.max(0,Math.min(SIZE-1,Math.round(z/STEP)+HALF)),c:Math.max(0,Math.min(SIZE-1,Math.round(x/STEP)+HALF))});
const world=n=>({x:(n.c-HALF)*STEP,z:(n.r-HALF)*STEP}),nodeKey=n=>n.r*SIZE+n.c,same=(a,b)=>a.r===b.r&&a.c===b.c,initial=node(source.x,source.z);
const barrierGroup=new THREE.Group(),flowGroup=new THREE.Group(),previewGroup=new THREE.Group();scene.add(barrierGroup,flowGroup,previewGroup);
function clearGroup(g){for(const child of [...g.children]){g.remove(child);child.geometry?.dispose();}}
function fresh(){return{phase:"ready",outlet:"west",barriers:[],current:initial,trail:[world(initial)],affected:new Set(),damaged:new Set(),seconds:ROUND,started:0,lastStep:0,route:[],surge1:false,surge2:false};}
let state=fresh();
const atDistricts=(x,z)=>districts.filter(d=>Math.hypot(x-d.x,z-d.z)<d.radius);
function blocked(n){const p=world(n);return state.barriers.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<1.08);}
function findRoute(){const goal=node(exits[state.outlet].x,exits[state.outlet].z),start=state.current,dist=new Float64Array(SIZE*SIZE).fill(Infinity),prev=new Int32Array(SIZE*SIZE).fill(-1),open=[{...start,cost:0}];dist[nodeKey(start)]=0;while(open.length){open.sort((a,b)=>b.cost-a.cost);const here=open.pop(),hk=nodeKey(here);if(here.cost!==dist[hk])continue;if(same(here,goal))break;const p=world(here),hy=terrainY(p.x,p.z);for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const n={r:here.r+dr,c:here.c+dc};if(n.r<0||n.c<0||n.r>=SIZE||n.c>=SIZE||blocked(n))continue;if(dr&&dc&&(blocked({r:here.r+dr,c:here.c})||blocked({r:here.r,c:here.c+dc})))continue;const q=world(n),qy=terrainY(q.x,q.z);if(qy<-.08||Math.hypot(q.x,q.z+4.2)<1.15)continue;const cost=here.cost+Math.hypot(dr,dc)+Math.max(0,qy-hy)*10+atDistricts(q.x,q.z).length*3.2,k=nodeKey(n);if(cost<dist[k]){dist[k]=cost;prev[k]=hk;open.push({...n,cost});}}}
if(!Number.isFinite(dist[nodeKey(goal)]))return[];const route=[];let k=nodeKey(goal);while(k!==-1){route.push({r:Math.floor(k/SIZE),c:k%SIZE});if(k===nodeKey(start))break;k=prev[k];}return route.reverse();}
function sampled(points,offset=.15){const out=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];for(let t=0;t<1;t+=.2)out.push(surface(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,offset));}if(points.length)out.push(surface(points.at(-1).x,points.at(-1).z,offset));return out;}
function toast(text){$("toast").textContent=text;}
function losses(){const lost=districts.reduce((sum,d)=>sum+(state.affected.has(d.id)?Math.round(d.population*.42):0),0);return{residents:TOTAL_RESIDENTS-lost,buildings:TOTAL_BUILDINGS-state.damaged.size};}
function intensity(){const elapsed=ROUND-state.seconds;return elapsed>=20?{text:"CRITICAL",width:100}:elapsed>=10?{text:"RISING",width:63}:{text:"LOW",width:24};}
function updateStats(){const l=losses(),i=intensity();$("residentCount").textContent=`${l.residents} safe`;$("buildingCount").textContent=`${l.buildings} safe`;$("residentCount").classList.toggle("warn",l.residents<TOTAL_RESIDENTS);$("buildingCount").classList.toggle("warn",l.buildings<TOTAL_BUILDINGS);$("intensityText").textContent=i.text;$("intensityText").classList.toggle("warn",i.text!=="LOW");$("intensityBar").style.width=`${i.width}%`;}
function updateRoute(){state.route=findRoute();clearGroup(previewGroup);const threatened=new Set();for(const n of state.route){const p=world(n);atDistricts(p.x,p.z).forEach(d=>threatened.add(d.name));}if(state.route.length>1){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(sampled(state.route.map(world),.23)),threatened.size?riskLine:safeLine);line.computeLineDistances();previewGroup.add(line);}$("routeReadout").textContent=!state.route.length?"No open route. Remove a barrier or choose another outlet.":threatened.size?`${exits[state.outlet].name} · danger to ${[...threatened].join(" + ")}.`:`${exits[state.outlet].name} · all three districts currently clear.`;$("rockCount").textContent=`${LIMIT-state.barriers.length} available`;document.querySelectorAll(".rock-pip").forEach((el,i)=>el.classList.toggle("used",i>=LIMIT-state.barriers.length));document.querySelectorAll("[data-outlet]").forEach(el=>{const selected=el.dataset.outlet===state.outlet;el.classList.toggle("selected",selected);el.setAttribute("aria-pressed",selected);});for(const [key,ring] of Object.entries(exitRings))ring.material.color.set(key===state.outlet?0xffcf68:0x6cb6c1);}
function redrawBarriers(){clearGroup(barrierGroup);state.barriers.forEach((b,i)=>{const g=new THREE.Group();g.position.set(b.x,terrainY(b.x,b.z),b.z);g.rotation.y=b.rotation;barrierGroup.add(g);for(let ri=-1;ri<=1;ri++){const rock=mesh(new THREE.DodecahedronGeometry(.48+Math.abs(ri)*.05,0),stone,ri*.58,.42,0,g);rock.scale.set(1.15,1+Math.abs(ri)*.12,.95);rock.userData.barrierIndex=i;}});updateRoute();}
function toggleBarrier(p){if(state.phase==="finished"){toast("Reset to begin a new response.");return;}const existing=state.barriers.findIndex(b=>Math.hypot(p.x-b.x,p.z-b.z)<1.1);if(existing>=0){state.barriers.splice(existing,1);redrawBarriers();toast("Barrier recovered. The forecast has updated.");return;}if(Math.hypot(p.x,p.z+4.2)<1.9||terrainY(p.x,p.z)<.05||districts.some(d=>Math.hypot(p.x-d.x,p.z-d.z)<d.radius*.72)||Object.values(exits).some(o=>Math.hypot(p.x-o.x,p.z-o.z)<1.1)){toast("Keep the crater, homes, water and outlets clear.");return;}if(state.trail.some(t=>Math.hypot(t.x-p.x,t.z-p.z)<.85)){toast("Lava is already here. Place the barrier farther downhill.");return;}if(state.barriers.length>=LIMIT){toast("All three barriers are deployed. Click a wall to recover it.");return;}state.barriers.push({x:p.x,z:p.z,rotation:Math.atan2(p.z+4.2,p.x)});redrawBarriers();toast("Basalt wall deployed. Check the forecast and threatened districts.");}

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,dragged=false;
function setRay(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);}
canvas.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY};dragged=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!down)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)dragged=true;if(dragged){yaw-=(e.clientX-down.lastX)*.0065;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-down.lastY)*.006,.23,1.48);updateCamera();}down.lastX=e.clientX;down.lastY=e.clientY;});
canvas.addEventListener("pointerup",e=>{if(!down)return;if(!dragged){setRay(e);const rocks=raycaster.intersectObjects(barrierGroup.children,true).filter(hit=>Number.isInteger(hit.object.userData.barrierIndex)),ground=raycaster.intersectObject(terrain);if(rocks.length&&(!ground.length||rocks[0].distance<ground[0].distance))toggleBarrier(state.barriers[rocks[0].object.userData.barrierIndex]);else if(ground.length)toggleBarrier(ground[0].point);else toast("Click dry land to place a barrier.");}down=null;});
canvas.addEventListener("pointercancel",()=>down=null);
canvas.addEventListener("wheel",e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.025,19,58);updateCamera();},{passive:false});
$("viewReset").onclick=()=>{yaw=.46;pitch=.63;distance=39;updateCamera();};$("viewTop").onclick=()=>{yaw=0;pitch=1.47;distance=39;updateCamera();};
const setPhase=t=>$("phaseLabel").textContent=t;
function reset(){state=fresh();clearGroup(flowGroup);redrawBarriers();$("timer").textContent=String(ROUND);$("timer").classList.remove("urgent");$("result").classList.remove("show");$("startBtn").disabled=false;$("startBtn").textContent="START RESPONSE";$("mapHint").textContent="Choose an outlet, study the districts, then start.";$("status").innerHTML="<strong>Briefing:</strong> Protect Old Town, River Ward and Farm Ridge. The flow accelerates after two seismic surges.";setPhase("READY");updateStats();toast("Drag to orbit · scroll to zoom · click land to deploy a basalt wall.");}
function finish(reached){state.phase="finished";const l=losses(),residentLoss=(TOTAL_RESIDENTS-l.residents)/TOTAL_RESIDENTS,buildingLoss=TOTAL_BUILDINGS-l.buildings;let score=Math.round(100-residentLoss*62-buildingLoss*2.2-(reached?0:22));score=Math.max(0,Math.min(100,score));$("score").textContent=String(score);$("resultTitle").textContent=l.residents===TOTAL_RESIDENTS&&reached?"All districts protected":"Village safety report";if(l.residents<TOTAL_RESIDENTS){const names=[...state.affected].map(id=>districts.find(d=>d.id===id)?.name).filter(Boolean).join(" and ");$("resultText").textContent=`${l.residents} of ${TOTAL_RESIDENTS} residents and ${l.buildings} of ${TOTAL_BUILDINGS} buildings remained safe. Next time, place a wall earlier on the approach to ${names}.`;}else if(reached)$("resultText").textContent=`All ${TOTAL_RESIDENTS} residents and ${TOTAL_BUILDINGS} buildings remained safe. The flow reached ${exits[state.outlet].name}; try another outlet with fewer walls.`;else $("resultText").textContent="All districts remained clear, but the flow did not reach an outlet before impact. Use a shorter diversion or move a wall away from the final channel.";$("result").classList.add("show");$("startBtn").disabled=false;$("startBtn").textContent="PLAY AGAIN";$("mapHint").textContent="Response complete · inspect each district and the final route.";$("status").textContent=reached?"Flow contained. Review the resident and building totals.":"The impact window closed. Review the route and try another strategy.";setPhase("REPORT");updateStats();}
$("startBtn").onclick=()=>{if(state.phase==="finished"){reset();return;}if(state.phase!=="ready")return;state.phase="running";state.started=performance.now();state.lastStep=state.started;$("startBtn").disabled=true;$("startBtn").textContent="FLOW IN PROGRESS";$("mapHint").textContent="Live flow · speed rises at 20 and 10 seconds remaining.";$("status").innerHTML="<strong>Response live:</strong> Watch the district labels and red forecast. Walls and outlets remain adjustable.";setPhase("LIVE FLOW");toast("The response has started. First seismic surge in 10 seconds.");};
$("resetBtn").onclick=reset;
document.querySelectorAll("[data-outlet]").forEach(el=>el.onclick=()=>{if(state.phase==="finished"){toast("Reset before changing outlets.");return;}state.outlet=el.dataset.outlet;updateRoute();toast(`${exits[state.outlet].name} selected. Forecast recalculated.`);});
function recordDamage(p){for(const d of atDistricts(p.x,p.z)){state.affected.add(d.id);d.houses.forEach((h,i)=>{if(Math.hypot(p.x-h.x,p.z-h.z)<.72)state.damaged.add(`${d.id}-${i}`);});}updateStats();}
function advance(){if(state.route.length<2){setPhase("FLOW BLOCKED");$("status").innerHTML="<strong>Flow stalled:</strong> choose another outlet or recover one wall before time expires.";return;}setPhase("LIVE FLOW");state.current=state.route[1];const p=world(state.current);state.trail.push(p);recordDamage(p);updateRoute();if(same(state.current,node(exits[state.outlet].x,exits[state.outlet].z)))finish(true);}

let flowSig="",lastDraw=0;
function animate(now){requestAnimationFrame(animate);const time=now*.001;if(state.phase==="running"){const elapsed=(now-state.started)/1000;state.seconds=Math.max(0,ROUND-elapsed);$("timer").textContent=String(Math.ceil(state.seconds)).padStart(2,"0");$("timer").classList.toggle("urgent",state.seconds<=10);updateStats();if(elapsed>=10&&!state.surge1){state.surge1=true;toast("SEISMIC SURGE · lava speed increased. Recheck the forecast.");}if(elapsed>=20&&!state.surge2){state.surge2=true;toast("CRITICAL SURGE · final 10 seconds. The flow is accelerating.");}const interval=Math.max(520,1050-elapsed*17);while(now-state.lastStep>=interval&&state.phase==="running"&&state.lastStep+interval-state.started<=30000){state.lastStep+=interval;advance();}if(state.phase==="running"&&elapsed>=ROUND)finish(false);}
if(now-lastDraw>60){lastDraw=now;const points=[...state.trail];if(state.phase==="running"&&state.route.length>1){const a=world(state.current),b=world(state.route[1]),elapsed=(now-state.started)/1000,interval=Math.max(520,1050-elapsed*17),t=Math.min(1,(now-state.lastStep)/interval);points.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});}const sig=JSON.stringify(points);if(sig!==flowSig){flowSig=sig;clearGroup(flowGroup);if(points.length>1)tube(sampled(points,.2),.17,molten,flowGroup);}}
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;smoke.forEach((s,i)=>{const age=((reduced?i*.38:time*.65+i*.38)%8.5);s.position.set(age*.24+Math.sin(i*3)*.42,5.7+age*.86,-4.2+Math.cos(i)*.4);s.scale.setScalar(1+age*.37);s.material.opacity=.86*(1-age/8.5);});for(let i=0;i<90;i++){const age=((reduced?i*.1:time+i*.1)%3.2);emberPos[i*3]=Math.sin(i*14)*age*.5;emberPos[i*3+1]=5.4+age*1.65-age*age*.29;emberPos[i*3+2]=-4.2+Math.cos(i*12)*age*.5;}emberGeo.attributes.position.needsUpdate=true;fire.intensity=reduced?90:88+Math.sin(time*5)*9;pool.scale.setScalar(1+(reduced?0:Math.sin(time*2.2)*.03));sea.material.opacity=reduced?.92:.89+Math.sin(time*.7)*.025;for(const l of labels){const p=l.point.clone().project(camera);l.element.style.left=`${(p.x*.5+.5)*canvas.clientWidth}px`;l.element.style.top=`${(-p.y*.5+.5)*canvas.clientHeight}px`;l.element.style.display=p.z>1?"none":"block";l.element.classList.toggle("active",l.key===state.outlet||state.affected.has(l.key));}renderer.render(scene,camera);}
new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}).observe(canvas);
reset();requestAnimationFrame(animate);
})();

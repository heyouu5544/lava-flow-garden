/* Original, dependency-free WebGL scene. Geometry is procedural, not a real volcano. */
(function (root) {
  "use strict";
  const TAU = Math.PI * 2;
  const normalize = v => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a.reduce((sum,x,i) => sum + x*b[i], 0);
  function multiply(a,b) {
    const out = new Float32Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++) for(let k=0;k<4;k++) out[c*4+r] += a[k*4+r]*b[c*4+k];
    return out;
  }
  function cameraMatrix(eye,target,aspect) {
    const z = normalize(eye.map((x,i) => x-target[i]));
    const up = Math.abs(dot([0,1,0],z))>.98?[0,0,1]:[0,1,0];
    const x = normalize(cross(up,z)), y = cross(z,x);
    const view = [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
    const f=1/Math.tan(Math.PI*42/360), near=.1, far=80;
    return multiply([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],view);
  }
  function triangle(out,a,b,c,color) {
    const n=normalize(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i])));
    for(const p of [a,b,c]) out.push(...p,...n,...color);
  }
  function surface(out,point,color,rows,cols) {
    for(let i=0;i<rows;i++) for(let j=0;j<cols;j++) {
      const a=point(i/rows,j/cols), b=point((i+1)/rows,j/cols), c=point((i+1)/rows,(j+1)/cols), d=point(i/rows,(j+1)/cols);
      const shade=.88+.12*Math.sin(i*7+j*11);
      const tint=color.map(x=>x*shade);
      triangle(out,a,b,c,tint);triangle(out,a,c,d,tint);
    }
  }
  function cube(out,color){
    const f=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],b=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]];
    [[b[1],b[0],b[3],b[2]],[...f],[b[0],f[0],f[3],b[3]],[f[1],b[1],b[2],f[2]],[f[3],f[2],b[2],b[3]],[b[0],b[1],f[1],f[0]]].forEach((q,i)=>{
      const tint=color.map(x=>x*[.72,.86,.74,.65,1,.54][i]);
      triangle(out,q[0],q[1],q[2],tint);triangle(out,q[0],q[2],q[3],tint);
    });
  }
  function flatPatch(out,points,color){triangle(out,points[0],points[1],points[2],color);triangle(out,points[0],points[2],points[3],color);}
  class VolcanoGL {
    constructor(canvas) {
      this.canvas=canvas;
      const gl=canvas.getContext("webgl",{alpha:true,antialias:true,preserveDrawingBuffer:true});
      if(!gl) throw new Error("WebGL unavailable");
    this.gl=gl; this.buffers=[];this.shaders=[];this.view="front";this.part=null;
    this.orbit={yaw:-.70,pitch:.42,distance:14.4};
      try { this.initialize(); } catch(error) {this.dispose();throw error;}
    }
    initialize() {
      const gl=this.gl;
      const shader=(type,source)=>{
        const s=gl.createShader(type);this.shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);
        if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error("Shader compilation failed");
        return s;
      };
      this.program=gl.createProgram();
      gl.attachShader(this.program,shader(gl.VERTEX_SHADER,`
        attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
        uniform mat4 uCamera; uniform vec3 uOffset; uniform vec3 uScale;
        uniform vec3 uTint; uniform float uGlow; varying vec3 vColor;
        void main(){ vec3 normal=normalize(aNormal/uScale);
          float light=0.32+0.68*abs(dot(normal,normalize(vec3(-0.5,1.0,0.7))));
          vColor=aColor*uTint*mix(light,1.0,uGlow);
          gl_Position=uCamera*vec4(aPosition*uScale+uOffset,1.0); }`));
      gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,`
        precision mediump float; varying vec3 vColor;
        void main(){gl_FragColor=vec4(vColor,1.0);}`));
      gl.linkProgram(this.program);
      if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)) throw new Error("Shader linking failed");
      gl.useProgram(this.program);
      this.attributes=["aPosition","aNormal","aColor"].map(name=>gl.getAttribLocation(this.program,name));
      this.uniforms=Object.fromEntries(["uCamera","uOffset","uScale","uTint","uGlow"].map(name=>[name,gl.getUniformLocation(this.program,name)]));
      gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
      const terrain=[];
      // Several rings give the volcanic cone visible facets and radial ridges.
      surface(terrain,(t,u)=>{
        const angle=u*TAU,rad=.55+2.85*t;
        const ridge=1+(.035*Math.sin(angle*9)+.02*Math.sin(angle*17))*t;
        return [Math.cos(angle)*rad*ridge,2.6*(1-t),Math.sin(angle)*rad*ridge];
      },[.43,.51,.34],9,64);
      // Sloping inner crater, rather than a closed cone tip.
      surface(terrain,(t,u)=>[Math.cos(u*TAU)*(.28+.27*t),2.23+.37*t,Math.sin(u*TAU)*(.28+.27*t)],[.23,.25,.19],2,48);
      this.terrain=this.mesh(terrain);
      const sphere=[];
      surface(sphere,(t,u)=>[Math.sin(t*Math.PI)*Math.cos(u*TAU),Math.cos(t*Math.PI),Math.sin(t*Math.PI)*Math.sin(u*TAU)],[1,1,1],8,12);
      this.sphere=this.mesh(sphere);
      const ring=[];
      surface(ring,(t,u)=>[Math.cos(u*TAU)*(1+t*.012),0,Math.sin(u*TAU)*(1+t*.012)],[1,1,1],1,96);
      this.ring=this.mesh(ring);
    this.lava=this.mesh([]);
    this.houses=[];this.trees=[];
    const road=[];
    for(let i=0;i<3;i++){
      const angle=[-.95,.1,1.05][i],dx=Math.sin(angle),dz=Math.cos(angle);
      const strip=(d,w)=>[[dx*d-w*dz,.022,dz*d+w*dx],[dx*d+w*dz,.022,dz*d-w*dx],[dx*(d+.35)+w*dz,.022,dz*(d+.35)-w*dx],[dx*(d+.35)-w*dz,.022,dz*(d+.35)+w*dx]];
      for(let s=0;s<22;s++)flatPatch(road,strip(4.5+s*.35,.12+s*.004),[.38,.34,.25]);
    }
    this.road=this.mesh(road);
    const river=[];
    for(let i=0;i<34;i++){
      const t=i/34,u=(i+1)/34,point=(v,side)=>[6.7+v*1.7+side*.15,.025,-4+v*11];
      flatPatch(river,[point(t,-1),point(t,1),point(u,1),point(u,-1)],[.22,.43,.48]);
    }
    this.river=this.mesh(river);
    const fields=[];
    for(let i=0;i<3;i++){
      const x=-7+i*1.25,z=3.2,p=[[x,.024,z],[x+1.05,.024,z],[x+1.05,.024,z+2],[x,.024,z+2]];
      flatPatch(fields,p,[.42,.46,.29]);
      for(let row=0;row<7;row++){const zz=z+.16+row*.26;flatPatch(fields,[[x+.08,.03,zz],[x+.98,.03,zz],[x+.98,.03,zz+.025],[x+.08,.03,zz+.025]],[.68,.62,.38]);}
    }
    this.fields=this.mesh(fields);
    for(let i=0;i<18;i++){
      const angle=i*2.399,rad=5.2+(i%4)*.72,x=Math.cos(angle)*rad,z=Math.sin(angle)*rad;
      if(i%5===0){this.trees.push({x,z,scale:.72+(i%3)*.13});continue;}
      const walls=[];cube(walls,[.68,.58,.43]);
      const roof=[],e=.63,r=.47,base=0,peak=.55;
      triangle(roof,[-e,base,-r],[0,peak,-r],[e,base,-r],[.34,.28,.23]);
      triangle(roof,[e,base,r],[0,peak,r],[-e,base,r],[.38,.31,.25]);
      triangle(roof,[-e,base,r],[-e,base,-r],[0,peak,-r],[.43,.34,.26]);
      triangle(roof,[e,base,-r],[e,base,r],[0,peak,r],[.36,.29,.22]);
      this.houses.push({x,z,angle:angle*.65,scale:.72+(i%4)*.12,walls:this.mesh(walls),roof:this.mesh(roof),tone:i%3});
    }
    const trunk=[];surface(trunk,(t,u)=>[Math.cos(u*TAU)*(.78*(1-t)+.38*t),t,Math.sin(u*TAU)*(.78*(1-t)+.38*t)],[.20,.34,.19],4,10);this.tree=this.mesh(trunk);
    }
    mesh(data) { const gl=this.gl,buffer=gl.createBuffer();this.buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);return {buffer,count:data.length/9}; }
    object(mesh,offset=[0,0,0],scale=[1,1,1],tint=[1,1,1],glow=0) {
      const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
      this.attributes.forEach((location,i)=>{gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,36,i*12);});
      gl.uniform3fv(this.uniforms.uOffset,offset);gl.uniform3fv(this.uniforms.uScale,scale);gl.uniform3fv(this.uniforms.uTint,tint);gl.uniform1f(this.uniforms.uGlow,glow);
      gl.drawArrays(gl.TRIANGLES,0,mesh.count);
    }
  setView(view) {
    if(!["front","side","top"].includes(view))return;
    this.view=view;
    Object.assign(this.orbit,{front:{yaw:-.70,pitch:.42},side:{yaw:.05,pitch:.43},top:{yaw:-.70,pitch:1.12}}[view]);
  }
  orbitBy(dx,dy){this.orbit.yaw+=dx;this.orbit.pitch=Math.max(.12,Math.min(1.38,this.orbit.pitch+dy));}
  zoomBy(amount){this.orbit.distance=Math.max(8.5,Math.min(25,this.orbit.distance*amount));}
    draw(result,progress=0) {
      const gl=this.gl;
      if(gl.isContextLost()) throw new Error("WebGL context lost");
      const bounds=this.canvas.parentElement.getBoundingClientRect();
      const width=Math.max(1,bounds.width),height=Math.max(1,bounds.height),ratio=Math.min(devicePixelRatio||1,1.75);
      if(this.canvas.width!==Math.round(width*ratio)||this.canvas.height!==Math.round(height*ratio)){this.canvas.width=Math.round(width*ratio);this.canvas.height=Math.round(height*ratio);}
      gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
      const aspect=width/height;
    const distance=this.orbit.distance*(aspect<.82?1.28:aspect<1.15?1.14:1);
    const horizontal=Math.cos(this.orbit.pitch)*distance;
    const eye=[Math.sin(this.orbit.yaw)*horizontal,2+Math.sin(this.orbit.pitch)*distance,Math.cos(this.orbit.yaw)*horizontal];
      gl.uniformMatrix4fv(this.uniforms.uCamera,false,cameraMatrix(eye,[0,2,0],aspect));
    this.object(this.sphere,[0,-.22,0],[8.9,.23,8.9],[.15,.21,.15]);
    for(let r=6.9;r<=8.7;r+=.6)this.object(this.ring,[0,.018,0],[r,1,r],[.32,.40,.27],.4);
    this.object(this.fields);
    this.object(this.river,[0,0,0],[1,1,1],this.part==="village"?[.8,1.1,1.35]:[1,1,1],.25);
    this.object(this.road);
    for(const house of this.houses){
      const c=Math.cos(house.angle),s=Math.sin(house.angle);
      // Vary building orientation and scale across the settlement.
      const tint=house.tone===1?[.88,.94,1]:house.tone===2?[1,.86,.75]:[1,1,1];
      this.object(house.walls,[house.x,0,house.z],[.68*house.scale,.48*house.scale,.58*house.scale],this.part==="village"?[1.16,1.06,.88]:tint);
      this.object(house.roof,[house.x,.24*house.scale,house.z],[house.scale,house.scale,house.scale],house.tone===2?[1,.76,.59]:[1,.92,.78]);
    }
    for(let i=0;i<this.trees.length;i++){
      const tree=this.trees[i],h=tree.scale;
      this.object(this.tree,[tree.x,.025,tree.z],[.14*h,.75*h,.14*h],[.40,.35,.25]);
      this.object(this.sphere,[tree.x,.68*h,tree.z],[.38*h,.53*h,.38*h],i%2?[.28,.43,.28]:[.38,.48,.30]);
      this.object(this.sphere,[tree.x+.20*h,.84*h,tree.z],[.28*h,.34*h,.30*h],[.32,.49,.31]);
    }
      this.object(this.terrain);
      this.object(this.sphere,[0,2.24,0],[.29,.06,.29],[1,.40,.16],1);
      this.object(this.ring,[0,2.61,0],[.55,1,.55],this.part==="crater"?[1,.85,.5]:[.67,.68,.45],1);
      if(!result)return;
      const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
      const p=reduced?1:progress, growth=Math.min(1,p/.68);
    const reach=(.25+result.flow/100*5.4)*growth;
      const vertices=[];
      for(const direction of [.3,1.6,3.8]) {
        const point=(t,side)=>{
          const rad=.48+t*reach,angle=direction+Math.sin(t*9)*.06;
          const y=Math.max(.035,2.6-(rad-.55)/2.85*2.6)+.08;
          const w=(.035+result.viscosity*.0006)*(1-.3*t);
          return [Math.cos(angle)*rad-Math.sin(angle)*side*w,y,Math.sin(angle)*rad+Math.cos(angle)*side*w];
        };
        for(let i=0;i<45;i++){const t=i/45,u=(i+1)/45;triangle(vertices,point(t,-1),point(u,-1),point(u,1),[1,.38,.10]);triangle(vertices,point(t,-1),point(u,1),point(t,1),[1,.65,.25]);}
      }
      gl.bindBuffer(gl.ARRAY_BUFFER,this.lava.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);this.lava.count=vertices.length/9;
      this.object(this.lava,[0,0,0],[1,1,1],this.part==="lava"?[1,1.3,1.5]:[1,1,1],1);
    const danger=1.1+result.hazard/100*5.5;
      this.object(this.ring,[0,.04,0],[Math.max(.01,danger*growth),1,Math.max(.01,danger*growth)],[1,.56,.30],1);
      // Stable mesh count, rebuilt geometry only for lava strips. No particles accumulate.
      const plumeHeight=(.25+result.ash*.038)*growth;
    for(let i=0;i<13;i++) {
      const t=i/12, spread=(.10+result.ash*.004*t)*growth;
        const sway=(!reduced&&p<1)?Math.sin(p*12+i)*.025:0;
        const size=Math.max(.005,spread);
        this.object(this.sphere,[Math.sin(i*2.4)*spread*.75+sway,2.65+t*plumeHeight,Math.cos(i*2.4)*spread*.6],[size*(1+t*.4),size*.82,size],this.part==="ash"?[.78,.85,.72]:[.48+t*.18,.53+t*.17,.49+t*.14]);
      }
    const particles=5+Math.round(result.intensity/9);
      for(let i=0;i<particles;i++) {
        const t=reduced||p===1?(i*.173)%1:(p*1.8+i*.173)%1;
        const radius=t*(.3+result.intensity*.02)*growth;
        const angle=i*2.39, y=2.65+4*t*(1-t)*(.15+result.intensity*.014)*growth;
        this.object(this.sphere,[Math.cos(angle)*radius,y,Math.sin(angle)*radius],[.025,.04,.025],[1,.68,.30],1);
      }
    }
    dispose(){const gl=this.gl;if(!gl)return;for(const buffer of this.buffers)gl.deleteBuffer(buffer);for(const shader of this.shaders)gl.deleteShader(shader);if(this.program)gl.deleteProgram(this.program);}
  }
  root.VolcanoGL=VolcanoGL;
})(globalThis);

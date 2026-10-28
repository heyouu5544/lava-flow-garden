(function(root){
  "use strict";
  const PARTS=Object.freeze({
    crater:"火山口：岩浆、气体和喷出物到达地表的出口附近。这里的橙色亮区是教学示意，并非每座火山都能看到熔岩。",
    ash:"火山灰云：包含细小的岩石、矿物和火山玻璃碎屑，不是燃烧产生的烟。喷发后观察它的高度；真实扩散还受风向影响。",
    lava:"熔岩流：岩浆到达地表后称为熔岩。一般而言，较低黏度更容易铺展；真实流动还取决于温度、供给量和地形。",
    village:"山脚村庄：不同尺度的石屋、院墙、道路、农田、水渠、棕榈和瞭望塔用于呈现环境尺度。这里没有防灾关卡或安全目标；真实影响还会受到地形、风向等因素影响。"
  });
  class LiveVolcanoScene {
    constructor(canvas,status,onFallback=()=>{}){
      this.canvas=canvas;this.status=status;this.onFallback=onFallback;this.result=null;this.progress=0;this.view="front";this.part=null;
      this.webCanvas=document.createElement("canvas");this.webCanvas.className="webgl-scene";this.webCanvas.setAttribute("role","img");
      canvas.parentElement.append(this.webCanvas);
      this.webCanvas.addEventListener("webglcontextlost",event=>{event.preventDefault();this.useFallback();});
      try {
        if(new URLSearchParams(location.search).get("render")==="2d")throw new Error("Requested 2D mode");
        this.renderer=new root.VolcanoGL(this.webCanvas);this.renderer.draw(null);
        canvas.style.visibility="hidden";this.status.textContent="Three.js 场景已就绪 · 可切换视角并观察部位";
      } catch(error){this.useFallback();}
      this.activePointers=new Map();
      this.webCanvas.style.touchAction="none";
      this.webCanvas.addEventListener("pointerdown",event=>{
        if(!this.renderer)return;
        this.webCanvas.setPointerCapture(event.pointerId);this.activePointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      });
      this.webCanvas.addEventListener("pointermove",event=>{
        const previous=this.activePointers.get(event.pointerId);if(!previous||!this.renderer)return;
        const dx=event.clientX-previous.x,dy=event.clientY-previous.y;
        this.activePointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
        if(this.activePointers.size>=2){
          const points=[...this.activePointers.values()],distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
          if(this.pinchDistance)this.renderer.zoomBy(this.pinchDistance/distance);this.pinchDistance=distance;
        }else this.renderer.orbitBy(-dx*.009,dy*.007);
        this.draw(this.result,this.progress);this.onOrbit();
      });
      const endPointer=event=>{this.activePointers.delete(event.pointerId);this.pinchDistance=null;};
      this.webCanvas.addEventListener("pointerup",endPointer);this.webCanvas.addEventListener("pointercancel",endPointer);
      this.webCanvas.addEventListener("wheel",event=>{if(!this.renderer)return;event.preventDefault();this.renderer.zoomBy(event.deltaY>0?1.08:.92);this.draw(this.result,this.progress);this.onOrbit();},{passive:false});
      this.resizeObserver=new ResizeObserver(()=>this.draw(this.result,this.progress));this.resizeObserver.observe(canvas.parentElement);
    }
    useFallback(){
      if(this.fallbackActive)return;this.fallbackActive=true;
      this.renderer?.dispose();this.renderer=null;this.webCanvas.hidden=true;this.canvas.style.visibility="visible";
      this.status.classList.add("is-fallback");this.status.textContent="3D 不可用，已切换为二维示意。参数、喷发、解释和历史对照仍可使用；三维视角暂不可用。";
      try {this.fallback=new root.VolcanoScene(this.canvas);if(!this.fallback.ctx)throw new Error("Canvas unavailable");}
      catch(error){
        this.fallback=null;this.canvas.style.visibility="hidden";
        this.staticView=document.createElement("div");this.staticView.className="static-volcano";this.staticView.innerHTML="<strong aria-hidden='true'>△</strong><p>绘图不可用，已显示静态火山。请通过下方文字结果继续实验。</p>";this.canvas.parentElement.append(this.staticView);
      }
      this.onFallback();this.draw(this.result,this.progress);
    }
    setView(view,duration=1050){this.view=view;this.renderer?.setView(view,duration);this.draw(this.result,this.progress);}
    onOrbit(){}
    setPart(part,duration=1050){this.part=part;if(this.renderer&&part)this.renderer.focusPart(part,duration);else if(this.renderer)this.renderer.highlightPart(null);this.draw(this.result,this.progress);}
    tourShot(name,duration){this.renderer?.tourShot(name,duration);}
    playCue(result){this.renderer?.playCue(result);}
    draw(result=null,progress=0){
      this.result=result;this.progress=progress;
      this.webCanvas.setAttribute("aria-label",`火山三维教学模型，${({front:"正面",side:"侧面",top:"俯视"})[this.view]}视角。${result?`${result.style}，熔岩 ${result.flow}、灰柱 ${result.ash}、强度 ${result.intensity}、范围 ${result.hazard}，均为教学指数。`:"尚未喷发。"}`);
      try {if(this.renderer)this.renderer.draw(result,progress);else this.fallback?.draw(result,progress);}
      catch(error){this.useFallback();}
      if(this.staticView){this.staticView.querySelector("p").textContent=result?`静态示意 · ${result.style}。熔岩 ${result.flow}，灰柱 ${result.ash}，强度 ${result.intensity}，范围 ${result.hazard}（均为教学指数）。`:"绘图不可用，已显示静态火山。请通过下方文字结果继续实验。";}
    }
    reset(){this.setView("front",0);this.setPart(null,0);this.draw();}
  }
  root.VolcanoParts=PARTS;root.LiveVolcanoScene=LiveVolcanoScene;
})(globalThis);

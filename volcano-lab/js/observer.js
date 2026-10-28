(function(root){
  'use strict';
  root.VolcanoParts=Object.freeze({
    crater:'火山口：岩浆、气体和喷出物到达地表的出口。红色笔触表示活跃熔岩；并非每座火山都能直接看到熔岩。',
    ash:'火山灰云：细小岩石、矿物与火山玻璃碎屑的混合物。喷发后观察灰柱高度与消散；尚未喷发时，虚线标出观察区域。',
    lava:'熔岩流：岩浆到达地表后的名称。低黏度组合流得更快、更远，沿坡分叉；高黏度组合形成短而厚的流动。深色纹理表示表面冷却。',
    village:'山脚村庄：石屋、道路、农田与水渠帮助理解火山和周边环境的关系。村庄不参与评分，范围虚线也不代表真实安全边界。'
  });
  class LiveVolcanoScene extends root.VolcanoScene{
    constructor(canvas,status){super(canvas);this.status=status;this.fallbackActive=!this.ctx;this.status.textContent=this.ctx?'二维地质观察图 · 场景全景':'绘图不可用，仍可使用参数、文字结果与历史对照。';this.draw();}
    draw(result=null,progress=0){super.draw(result,progress);const name=({front:'场景全景',crater:'火山口特写',section:'山体剖面',opening:'远景'})[this.view]||'二维镜头';this.canvas.setAttribute('aria-label',`二维地质示意图，${name}。${this.part?root.VolcanoParts[this.part]:''}${result?`${result.style}，熔岩 ${result.flow}、灰柱 ${result.ash}、强度 ${result.intensity}、范围 ${result.hazard}，均为教学指数。`:'尚未喷发。'}`);}
    playCue(){}
  }
  root.LiveVolcanoScene=LiveVolcanoScene;
})(globalThis);

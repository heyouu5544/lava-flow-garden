(function(root){
  'use strict';
  root.VolcanoParts=Object.freeze({
    crater:'Crater: the opening where magma, gas, and ejecta reach the surface. Red brushstrokes show active lava; visible lava is not present at every volcano.',
    ash:'Ash cloud: a mixture of tiny rock, mineral, and volcanic-glass fragments. After an eruption, watch the column rise and disperse; before eruption, a dashed outline marks the observation area.',
    lava:'Lava flow: magma is called lava once it reaches the surface. Low-viscosity lava moves faster and farther, branching down the slope; high-viscosity lava forms short, thick flows. Dark marks show a cooling crust.',
    village:'Foothill village: stone houses, roads, fields, and canals show how a volcano relates to its surroundings. The village is not scored, and the dashed range is not a real safety boundary.'
  });
  class LiveVolcanoScene extends root.VolcanoScene{
    constructor(canvas,status){super(canvas);this.status=status;this.fallbackActive=!this.ctx;this.status.textContent=this.ctx?'2D geological view · Full scene':'Drawing is unavailable. You can still use the controls, text results, and historical comparisons.';this.draw();}
    draw(result=null,progress=0){super.draw(result,progress);const name=({front:'Full scene',crater:'Crater close-up',section:'Volcano cutaway',opening:'Distant view'})[this.view]||'2D view';this.canvas.setAttribute('aria-label',`2D geological illustration, ${name}. ${this.part?root.VolcanoParts[this.part]:''}${result?`${result.style}; lava ${result.flow}, ash column ${result.ash}, intensity ${result.intensity}, range ${result.hazard}. All values are teaching indices.`:'No eruption yet.'}`);}
    playCue(){}
  }
  root.LiveVolcanoScene=LiveVolcanoScene;
})(globalThis);

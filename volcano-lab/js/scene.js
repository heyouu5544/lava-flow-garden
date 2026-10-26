(function (root) {
  "use strict";
  const W = 1000, H = 580;
  const mix = (a, b, t) => a + (b - a) * t;
  const limit = (n) => Math.max(0, Math.min(1, n));
  class VolcanoScene {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.result = null;
      this.progress = 0;
      this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      this.resize = () => {
        const ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = W * ratio; canvas.height = H * ratio;
        this.ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.draw(this.result, this.progress);
      };
      this.resize();
      window.addEventListener("resize", this.resize);
    }
    draw(result = null, progress = 0) {
      this.result = result; this.progress = progress;
      const c = this.ctx;
      if (!c) return;
      const p = this.reducedMotion.matches && result ? 1 : progress;
      const growth = limit(p / 0.68);
      c.clearRect(0, 0, W, H);
      // Observation grid and instrument markings.
      c.strokeStyle = "#a8c8a10c"; c.lineWidth = 1;
      for (let x = 40; x < W; x += 40) { c.beginPath(); c.moveTo(x, 15); c.lineTo(x, H - 40); c.stroke(); }
      for (let y = 20; y < H - 25; y += 40) { c.beginPath(); c.moveTo(20, y); c.lineTo(W - 20, y); c.stroke(); }
      c.strokeStyle = "#70866b55";
      [[28,25,1,1],[972,25,-1,1],[28,540,1,-1],[972,540,-1,-1]].forEach(([x,y,dx,dy])=>{c.beginPath();c.moveTo(x+14*dx,y);c.lineTo(x,y);c.lineTo(x,y+14*dy);c.stroke();});
      c.fillStyle = "#708571"; c.font = '10px Consolas, monospace';
      for (let y=100;y<=420;y+=80){c.fillText(String(500-y).padStart(3,"0"),45,y+3);c.fillRect(78,y,9,1);}
      // Distant terrain and base plane.
      c.fillStyle = "#203027"; c.beginPath();c.moveTo(0,440);c.lineTo(135,387);c.lineTo(240,419);c.lineTo(355,365);c.lineTo(485,430);c.lineTo(655,369);c.lineTo(755,412);c.lineTo(895,377);c.lineTo(1000,424);c.lineTo(1000,540);c.lineTo(0,540);c.fill();
      c.fillStyle = "#19281f";c.beginPath();c.ellipse(510,477,420,49,0,0,Math.PI*2);c.fill();
      for(let j=0;j<4;j++){c.strokeStyle="#40543a55";c.beginPath();c.ellipse(510,477,170+j*75,19+j*10,0,0,Math.PI*2);c.stroke();}
      if(result){
        const radius = (105 + result.hazard * 3.1) * growth;
        c.fillStyle="#ff976211";c.strokeStyle="#ff976288";c.setLineDash([6,7]);c.beginPath();c.ellipse(510,476,radius,radius*.17,0,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);
      }
      // Original stylized cutaway volcano.
      const mountain=c.createLinearGradient(300,280,650,480);mountain.addColorStop(0,"#64724c");mountain.addColorStop(.55,"#3c4d32");mountain.addColorStop(1,"#273a2b");
      c.fillStyle=mountain;c.beginPath();c.moveTo(205,476);c.lineTo(290,432);c.lineTo(358,393);c.lineTo(435,322);c.lineTo(472,283);c.quadraticCurveTo(510,302,548,283);c.lineTo(595,340);c.lineTo(672,404);c.lineTo(737,448);c.lineTo(820,476);c.closePath();c.fill();
      c.fillStyle="#73805a55";c.beginPath();c.moveTo(205,476);c.lineTo(472,283);c.lineTo(446,355);c.lineTo(411,391);c.lineTo(397,433);c.lineTo(348,476);c.fill();
      c.fillStyle="#19291e77";c.beginPath();c.moveTo(548,283);c.lineTo(573,374);c.lineTo(624,410);c.lineTo(650,476);c.lineTo(820,476);c.fill();
      [[270,460,425,356],[362,465,467,336],[585,355,713,455],[549,329,602,464]].forEach(([x,y,a,b])=>{c.strokeStyle="#a8b37a22";c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(mix(x,a,.6)+10,mix(y,b,.6),a,b);c.stroke();});
      // Magma reservoir and conduit remain visible before eruption.
      c.fillStyle="#0d1815";c.beginPath();c.moveTo(475,312);c.lineTo(548,476);c.lineTo(424,476);c.closePath();c.fill();
      const glow=c.createRadialGradient(490,446,4,490,446,64);glow.addColorStop(0,"#ff975b99");glow.addColorStop(1,"#ff662000");c.fillStyle=glow;c.fillRect(420,380,140,120);
      c.fillStyle="#d66d3c";c.beginPath();c.ellipse(486,447,34,17,-.08,0,Math.PI*2);c.fill();
      c.strokeStyle="#fa9155";c.lineWidth=8;c.beginPath();c.moveTo(486,443);c.bezierCurveTo(510,404,473,364,508,292);c.stroke();
      c.lineWidth=1;c.fillStyle="#131d17";c.beginPath();c.ellipse(510,286,38,10,0,0,Math.PI*2);c.fill();c.strokeStyle="#a3a67b";c.stroke();
      c.fillStyle=result?"#ffc282":"#ce7849";c.beginPath();c.ellipse(510,287,26,5,0,0,Math.PI*2);c.fill();
      if(result){
        // Long lava tongues for fluid magma, short thick tongues for viscous magma.
        const reach = (0.16 + result.flow / 100 * .84) * growth;
        const points=[[[510,289],[535,322],[561,352],[602,382],[635,417],[696,450],[806,482],[936,492]],[[501,292],[485,324],[449,361],[433,389],[386,421],[351,456],[274,479],[144,492]]];
        points.forEach((line,index)=>{
          const segments=reach*(line.length-1);const full=Math.floor(segments);
          c.beginPath();c.moveTo(...line[0]);
          for(let i=1;i<=full;i++)c.lineTo(...line[i]);
          if(full<line.length-1){const t=segments-full;c.lineTo(mix(line[full][0],line[full+1][0],t),mix(line[full][1],line[full+1][1],t));}
          c.lineCap="round";c.lineJoin="round";c.strokeStyle="#c9572d";c.lineWidth=12+result.viscosity*.065-index*3;c.stroke();c.strokeStyle="#ff9b50";c.lineWidth=5+result.viscosity*.025;c.stroke();c.strokeStyle="#ffda8c";c.lineWidth=2;c.stroke();
        });
        c.lineWidth=1;
        // Column height, density and plume width track ash and intensity indices.
        const height=(16+result.ash*2.12)*growth;
        const cloudWidth=13+result.ash*.65;
        for(let i=0;i<30;i++){
          const t=i/29;
          const sway=p<1&&!this.reducedMotion.matches?Math.sin(p*15+i*1.7)*4:0;
          const x=510+Math.sin(i*2.39)*cloudWidth*t+sway;
          const y=281-t*height;
          const radius=(5+t*cloudWidth*.51)*growth;
          c.fillStyle=`rgba(${143+i%4*8},${152+i%4*8},${140+i%4*8},${.22+t*.23})`;
          c.beginPath();c.ellipse(x,y,radius*(1+t*.45),radius,0,0,Math.PI*2);c.fill();
        }
        // Ballistic arcs are deterministic; no particles accumulate between runs.
        const count=5+Math.round(result.intensity/4);
        for(let i=0;i<count;i++){
          const cycle=this.reducedMotion.matches||p===1?((i*.13)%1):((p*2.6+i*.173)%1);
          const spread=(i%2?1:-1)*(20+(i*29%110))*(.35+result.intensity/100);
          const x=510+spread*cycle*growth,y=285-(30+result.intensity*1.2)*4*cycle*(1-cycle)*growth;
          c.fillStyle=i%3?"#ffad62":"#f9db9a";c.beginPath();c.arc(x,y,1.5+(i%3)*.6,0,Math.PI*2);c.fill();
        }
        c.fillStyle="#b8c9b0";c.font='11px "Microsoft YaHei", sans-serif';c.fillText(`灰柱高度指数 ${result.ash}`,Math.min(775,570+cloudWidth),Math.max(47,285-height));
        c.strokeStyle="#a1b49466";c.beginPath();c.moveTo(555+cloudWidth*.2,285-height);c.lineTo(565+cloudWidth,285-height);c.stroke();
      }
      // Instrument callouts.
      c.font='11px "Microsoft YaHei", sans-serif';c.fillStyle="#a7b79a";c.fillText("岩浆储集区",624,516);c.strokeStyle="#82987277";c.lineWidth=1;c.beginPath();c.moveTo(517,452);c.lineTo(585,512);c.lineTo(612,512);c.stroke();
      c.fillStyle="#80957c";c.font='10px Consolas, monospace';c.fillText("MAGMA CHAMBER",624,531);
      c.fillText(result?`V ${String(result.viscosity).padStart(3,"0")}  /  G ${String(result.gas).padStart(3,"0")}`:"AWAITING INPUT",806,39);
    }
  }
  root.VolcanoScene = VolcanoScene;
})(globalThis);

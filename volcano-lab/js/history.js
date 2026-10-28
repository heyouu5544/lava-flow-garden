/* Sources checked 2026-10-27. Thresholds are pedagogical selection rules,
   not a classifier of actual volcanoes. Never infer real magma values. */
(function(root){
  "use strict";
  const maunaSource="https://www.usgs.gov/volcanoes/kilauea/science/1969-1974-maunaulu-eruption";
  const cases=Object.freeze({
    effusive:Object.freeze({name:"基拉韦厄火山 · Maunaulu",year:"1969–1974",summary:"Maunaulu 喷发经历了不同阶段。在部分以溢流为主的阶段，熔岩从喷口流出、铺展，逐渐堆筑火山体。",similarity:"相似在：本次熔岩铺展较明显、灰柱较低，可与该事件中的溢流阶段作直观比较。",limits:"只类比溢流阶段；这一历史事件也出现过高熔岩喷泉，并非始终平静。",source:maunaSource,sourceLabel:"USGS · 1969–1974 Maunaulu Eruption ↗"}),
    fountain:Object.freeze({name:"基拉韦厄火山 · Maunaulu",year:"1969",summary:"1969 年的 Maunaulu 活动出现多次熔岩喷泉，喷泉活动同时伴随熔岩向外流动。",similarity:"相似在：本次喷溅活动增强，同时保留明显的熔岩铺展，可类比喷泉与熔岩流并存的表现。",limits:"本模拟没有重现其喷泉高度、时间节奏或喷出量，也不能从滑块反推该事件的岩浆参数。",source:maunaSource,sourceLabel:"USGS · Maunaulu 喷泉与熔岩流记录 ↗"}),
    dome:Object.freeze({name:"圣海伦斯火山",year:"2004–2008",summary:"这一轮活动持续向火山口内挤出熔岩，形成新的熔岩穹丘。这里对照的是穹丘生长阶段。",similarity:"相似在：本次熔岩流动受限、主要在近处堆积，爆发指数较低，与缓慢挤出和堆积的表现有可比之处。",limits:"模型只表现短距离铺展，没有重建真实穹丘。该轮活动也发生过爆炸与灰排放，不能将整次事件概括为没有爆发。",source:"https://www.usgs.gov/volcanoes/mount-st.-helens/science/2004-2008-renewed-volcanic-activity",sourceLabel:"USGS · 2004–2008 Renewed Volcanic Activity ↗"}),
    explosive:Object.freeze({name:"皮纳图博火山",year:"1991",summary:"1991 年 6 月 15 日，皮纳图博发生强烈爆发，形成高耸灰云，并产生广泛降灰。",similarity:"相似在：本次灰柱较高、爆发占主导，可与该事件的强烈爆发和高灰云表现作教学类比。",limits:"不代表强度或规模相等；真实事件还涉及火山碎屑流、天气等过程，本实验并未模拟这些因素。",source:"https://pubs.usgs.gov/fs/1997/fs113-97/",sourceLabel:"USGS · The Cataclysmic 1991 Eruption of Mount Pinatubo ↗"})
  });
  function match(result){
    if(!result||!["flow","ash","intensity","viscosity"].every(key=>Number.isFinite(result[key])&&result[key]>=0&&result[key]<=100))return null;
    if(result.intensity>=60&&result.ash>=60)return cases.explosive;
    if(result.viscosity>=67&&result.intensity<25&&result.flow<35)return cases.dome;
    if(result.flow>=55&&result.intensity<30)return cases.effusive;
    if(result.flow>=55&&result.intensity>=30&&result.intensity<60)return cases.fountain;
    return null;
  }
  const api=Object.freeze({match,cases});
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.VolcanoHistory=api;
})(globalThis);

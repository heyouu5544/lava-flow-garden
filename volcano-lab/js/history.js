/* Sources checked 2026-10-27. Thresholds are pedagogical selection rules,
   not a classifier of actual volcanoes. Never infer real magma values. */
(function(root){
  "use strict";
  const maunaSource="https://www.usgs.gov/volcanoes/kilauea/science/1969-1974-maunaulu-eruption";
  const cases=Object.freeze({
    effusive:Object.freeze({name:"Kīlauea · Maunaulu",year:"1969–1974",summary:"The Maunaulu eruption passed through several phases. During some effusive phases, lava left the vent, spread outward, and gradually built the volcanic landform.",similarity:"Teaching analogy: this run has broad lava spread and a low ash column, resembling the eruption's effusive phases.",limits:"This comparison covers only the effusive phases. The historical eruption also produced tall lava fountains and was not always gentle.",source:maunaSource,sourceLabel:"USGS · 1969–1974 Maunaulu Eruption ↗"}),
    fountain:Object.freeze({name:"Kīlauea · Maunaulu",year:"1969",summary:"Maunaulu produced repeated lava fountains in 1969, accompanied by lava flowing away from the vent.",similarity:"Teaching analogy: strong spatter occurs alongside clear lava spread, similar to the coexistence of fountains and flows at Maunaulu.",limits:"The simulation does not reproduce fountain height, timing, or erupted volume, and the sliders cannot be used to infer the event's magma properties.",source:maunaSource,sourceLabel:"USGS · Maunaulu Fountains and Lava Flows ↗"}),
    dome:Object.freeze({name:"Mount St. Helens",year:"2004–2008",summary:"During this episode, lava repeatedly extruded into the crater and built a new lava dome. This comparison focuses on the dome-growth phase.",similarity:"Teaching analogy: restricted lava movement, near-vent buildup, and low explosive intensity resemble slow extrusion and accumulation.",limits:"The model shows only short-range spread and does not reconstruct a real dome. This episode also included explosions and ash emissions.",source:"https://www.usgs.gov/volcanoes/mount-st.-helens/science/2004-2008-renewed-volcanic-activity",sourceLabel:"USGS · 2004–2008 Renewed Volcanic Activity ↗"}),
    explosive:Object.freeze({name:"Mount Pinatubo",year:"1991",summary:"On June 15, 1991, Mount Pinatubo produced a powerful explosive eruption, a towering ash cloud, and widespread ashfall.",similarity:"Teaching analogy: this run is dominated by explosive activity and a high ash column, visually echoing Pinatubo's powerful eruption.",limits:"The comparison does not imply equal intensity or scale. The real event included pyroclastic flows, weather interactions, and other processes not modeled here.",source:"https://pubs.usgs.gov/fs/1997/fs113-97/",sourceLabel:"USGS · The Cataclysmic 1991 Eruption of Mount Pinatubo ↗"})
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

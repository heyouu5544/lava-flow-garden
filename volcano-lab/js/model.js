/* Teaching indices, not physical measurements or a hazard forecast.
   General principles: https://www.usgs.gov/faqs/how-do-volcanoes-erupt
   Formula coefficients are authored for this interactive demonstration. */
(function (root) {
  "use strict";
  const DEFAULTS = Object.freeze({ viscosity: 40, gas: 40 });
  function clamp(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 40;
  }
  function level(value) { return value < 34 ? "低" : value < 67 ? "中" : "高"; }
  function calculate(viscosity, gas) {
    const inputs = { viscosity: clamp(viscosity), gas: clamp(gas) };
    const v = inputs.viscosity / 100, g = inputs.gas / 100;
    // Gas drives activity; viscosity amplifies gas retention. Viscosity alone
    // must not create a highly explosive eruption when gas is scarce.
    const energy = g * (0.3 + 0.7 * v);
    const intensity = Math.round(5 + 95 * energy);
    const ash = Math.round(2 + 98 * energy);
    const flow = Math.round(8 + 92 * (1 - v) * (0.65 + 0.35 * g));
    const hazard = Math.round(Math.max(flow * 0.65, intensity * 0.94));
    const style = v < 0.4 && g < 0.4 ? "平静溢流" : v < 0.4 && g >= 0.6 ? "熔岩喷泉与快速流动" : v >= 0.6 && g < 0.4 ? "近口堆积与熔岩穹丘" : v >= 0.6 && g >= 0.6 ? "爆炸性喷发" : intensity >= 48 ? "喷溅与灰柱并存" : "溢流与间歇喷溅";
    const viscosityText = v < 0.34 ? "岩浆较稀，熔岩容易沿坡铺展，气体也较容易逸出。" : v < 0.67 ? "岩浆黏度适中，仍能流动，但会阻碍部分气体逸出。" : "岩浆很黏稠，熔岩不易流远，气体也较难逸出。";
    const gasText = g < 0.34 ? (v >= 0.67 ? "气体较少，推动力有限；画面中岩浆会在近口缓慢隆起并形成厚重短流，而不会只因黏稠就猛烈爆炸。" : "气体较少，烟灰与喷出物有限；画面以快速、分叉并沿沟壑延伸的熔岩为主。") : g < 0.67 ? "气体膨胀提供了一定推动力；画面会同时出现熔岩流、间歇喷溅与中等灰云。" : v < 0.34 ? "气体丰富而岩浆较稀，画面会出现连续熔岩喷泉、火花和火山弹，同时熔岩仍能快速流动。" : "丰富气体受黏稠岩浆阻碍，画面会出现爆发闪光、高大灰柱、伞状灰云和大量喷出物。";
    const hazardText = flow * 0.65 > intensity * 0.94 ? "本次危险范围主要受熔岩铺展影响：爆发较弱，也不等于没有危险。" : "本次危险范围主要随爆发增强而扩大；图中的范围只是比较用的示意。";
    return Object.freeze({ ...inputs, flow, ash, intensity, hazard, style,
      explanation: viscosityText + gasText + hazardText,
      suggestion: v >= 0.67 ? "下一次：保持气体含量不变，把黏度降到 20，比较熔岩铺展和灰柱高度。" : "下一次：保持黏度不变，把气体含量调到另一端，比较灰柱和喷发强度。"
    });
  }
  const api = Object.freeze({ DEFAULTS, clamp, level, calculate });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.VolcanoModel = api;
})(globalThis);

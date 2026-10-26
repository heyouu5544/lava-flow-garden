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
    const style = intensity >= 60 ? "爆发占主导" : intensity >= 30 ? "喷溅与溢流并存" : v >= 0.67 ? "黏稠熔岩堆积" : "溢流占主导";
    const viscosityText = v < 0.34 ? "岩浆较稀，熔岩容易沿坡铺展，气体也较容易逸出。" : v < 0.67 ? "岩浆黏度适中，仍能流动，但会阻碍部分气体逸出。" : "岩浆很黏稠，熔岩不易流远，气体也较难逸出。";
    const gasText = g < 0.34 ? "这组参数中的气体较少，膨胀带来的推动力有限，所以灰柱较低、爆发较弱；高黏度本身并不保证强烈爆发。" : g < 0.67 ? "气体膨胀提供了一定推动力；越难逸出的气体，越容易增强喷溅并抬高灰柱。" : v < 0.34 ? "虽然气体丰富，但较稀的岩浆允许更多气体逸出，因此喷溅会增强，却不如高黏度、富气体组合那样猛烈。" : "丰富的气体在上升时膨胀，又受到黏稠岩浆的阻碍，因此更容易猛烈喷出，形成更高的灰柱和更强的爆发。";
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

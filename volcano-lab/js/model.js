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
  function level(value) { return value < 34 ? "Low" : value < 67 ? "Medium" : "High"; }
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
    const style = v < 0.4 && g < 0.4 ? "Gentle effusive eruption" : v < 0.4 && g >= 0.6 ? "Lava fountains and fast flows" : v >= 0.6 && g < 0.4 ? "Near-vent buildup and lava dome" : v >= 0.6 && g >= 0.6 ? "Explosive eruption" : intensity >= 48 ? "Spatter with an ash column" : "Effusive flow with intermittent spatter";
    const viscosityText = v < 0.34 ? "The magma is fluid, so lava spreads easily down the slope and gas can escape more readily. " : v < 0.67 ? "The magma has medium viscosity: it can still flow, but it traps some rising gas. " : "The magma is very viscous, so lava stays close to the vent and gas escapes less easily. ";
    const gasText = g < 0.34 ? (v >= 0.67 ? "There is little gas to drive the eruption. The magma slowly bulges near the vent and forms a short, thick flow instead of becoming explosive simply because it is sticky. " : "With little gas, ash and ejecta are limited. Fast, branching lava flows dominate the scene. ") : g < 0.67 ? "Expanding gas provides moderate lift, producing lava flows, intermittent spatter, and a medium ash cloud. " : v < 0.34 ? "Gas-rich, fluid magma creates sustained fountains, sparks, and volcanic bombs while lava continues to move quickly. " : "Abundant gas is trapped by viscous magma, producing an eruption flash, a tall ash column, an umbrella cloud, and abundant ejecta. ";
    const hazardText = flow * 0.65 > intensity * 0.94 ? "Lava spread drives most of this run's hazard range; a less explosive eruption is not a harmless one." : "The hazard range grows mainly with explosive activity; the boundary shown is only a teaching comparison.";
    return Object.freeze({ ...inputs, flow, ash, intensity, hazard, style,
      explanation: viscosityText + gasText + hazardText,
      suggestion: v >= 0.67 ? "Next: keep gas content unchanged, lower viscosity to 20, and compare lava spread with ash-column height." : "Next: keep viscosity unchanged, move gas content toward the opposite end, and compare ash height with eruption intensity."
    });
  }
  const api = Object.freeze({ DEFAULTS, clamp, level, calculate });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.VolcanoModel = api;
})(globalThis);

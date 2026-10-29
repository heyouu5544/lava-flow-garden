(function () {
  "use strict";
  const model = window.VolcanoModel;
  const $ = (id) => document.getElementById(id);
  const sliders = { viscosity: $("viscosity"), gas: $("gas") };
  const viewButtons = [...document.querySelectorAll("[data-view]")];
  const partButtons = [...document.querySelectorAll("[data-part]")];
  const presets = [...document.querySelectorAll("[data-preset]")];
  const resultsPanel = document.querySelector(".results");
  const triggerDefaultContent = $("trigger").innerHTML;
  const scene = new window.LiveVolcanoScene($("volcano"), $("render-status"));
  const duration = 8500;
  let phase = "ready", animationFrame = null, lastResult = null, runNumber = 0;
  const initialExplanation = $("explanation-text").textContent;
  const initialSuggestion = $("next-experiment").textContent;
  const metricDefaults = Object.fromEntries(["flow", "ash", "intensity", "hazard"].map(key => [key, $(`${key}-description`).textContent]));
  function announce(message) { $("notice").textContent = message; }
  function updateInputs() {
    Object.entries(sliders).forEach(([key, input]) => {
      input.value = model.clamp(input.value);
      const grade = `${model.level(Number(input.value))} ${key === "viscosity" ? "viscosity" : "gas"}`;
      $(`${key}-value`).replaceChildren(document.createTextNode(input.value));
      const scale = document.createElement("span"); scale.textContent = " / 100"; $(`${key}-value`).append(scale);
      $(`${key}-level`).textContent = grade;
      input.style.setProperty("--value", `${input.value}%`);
      input.setAttribute("aria-valuetext", `${input.value}, ${grade}, on a teaching index from 0 to 100`);
    });
    presets.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.preset === `${sliders.viscosity.value},${sliders.gas.value}`)));
  }
  function setPhase(next) {
    phase = next;
    const running = phase === "running";
    $("trigger").setAttribute("aria-disabled", String(running));
    // Keep the trigger focusable so repeated attempts receive a status message.
    $("trigger").innerHTML = running ? '<span aria-hidden="true">◉</span> Eruption in progress <small>Please wait</small>' : triggerDefaultContent;
    Object.values(sliders).forEach(input => { input.disabled = running; });
    presets.forEach(button => { button.disabled = running; });
    $("phase").classList.toggle("running", running);
    $("phase").replaceChildren();
    $("phase").append(document.createElement("i"), document.createTextNode(running ? "Eruption in progress" : phase === "finished" ? "Experiment complete" : "Ready"));
    $("scene-state").textContent = running ? "ERUPTION IN PROGRESS" : phase === "finished" ? "OBSERVATION COMPLETE" : "SYSTEM READY";
  }
  let cameraNoticeTimer = null;
  function showCameraNotice(message) {
    const notice = $("camera-notice");
    notice.textContent = message; notice.classList.add("visible");
    clearTimeout(cameraNoticeTimer); cameraNoticeTimer = setTimeout(() => notice.classList.remove("visible"), 1350);
  }
  function progress(value) {
    $("progress").setAttribute("aria-valuenow", String(Math.round(value * 100)));
    $("progress").firstElementChild.style.width = `${value * 100}%`;
  }
  function showResults(result) {
    ["flow", "ash", "intensity", "hazard"].forEach(key => {
      $(`${key}-result`).textContent = result[key];
      $(`${key}-meter`).style.width = `${result[key]}%`;
    });
    $("flow-description").textContent = result.flow >= 65 ? "Fast flow with broad downslope spread" : result.flow >= 35 ? "Moderate flow and medium travel distance" : "Slow flow concentrated near the vent";
    $("ash-description").textContent = result.ash >= 65 ? "Tall column carrying abundant ash upward" : result.ash >= 35 ? "Medium column with a visible ash cloud" : "Low column with relatively little ash";
    $("intensity-description").textContent = `${model.level(result.intensity)} intensity · ${result.style}`;
    $("hazard-description").textContent = result.hazard >= 65 ? "Broad impact range · teaching illustration only" : result.hazard >= 35 ? "Medium impact range · not a safety boundary" : "Smaller impact range · hazards can remain";
    $("result-context").textContent = `Experiment ${String(runNumber).padStart(2,"0")} · Viscosity ${result.viscosity} / Gas ${result.gas} · Inputs locked for this run`;
    $("explanation-title").textContent = "Why did it erupt this way?";
    $("style-badge").textContent = result.style;
    $("explanation-text").textContent = result.explanation;
    $("next-experiment").textContent = result.suggestion;
    $("volcano").setAttribute("aria-label", `Volcano illustration: ${result.style}. Lava-flow index ${result.flow}, ash-height index ${result.ash}, eruption-intensity index ${result.intensity}, hazard-range index ${result.hazard}. All are teaching indices out of 100.`);
  }
  function trigger() {
    if (phase === "running") { announce("An eruption is already in progress, so another one will not start. Select Reset to end this run."); return; }
    updateInputs();
    lastResult = model.calculate(sliders.viscosity.value, sliders.gas.value);
    runNumber += 1;
    const result = lastResult;
    $("history-card").hidden = true; resultsPanel.dataset.revealed = "false";
    setPhase("running"); showResults(result); progress(0);
    scene.playCue(result);
    if (matchMedia("(max-width: 760px)").matches) document.querySelector(".observatory").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    announce("Eruption started and inputs are temporarily locked. Watch pressure build, then look for lava, the ash column, and ejecta. You can run another experiment in about 9 seconds.");
    const startTime = performance.now();
    function frame(now) {
      if (phase !== "running") return;
      const elapsed = Math.min(1, (now - startTime) / duration);
      scene.draw(result, elapsed); progress(elapsed);
      $("scene-state").textContent = elapsed < .22 ? "PRESSURE BUILDING" : elapsed < .64 ? "ERUPTION RELEASE" : "ASH & LAVA SETTLING";
      if (elapsed < 1) animationFrame = requestAnimationFrame(frame);
      else {
        animationFrame = null; setPhase("finished");
        showHistory(result);
        resultsPanel.dataset.revealed = "true";
        $("result-context").textContent = `Experiment ${String(runNumber).padStart(2,"0")} · Viscosity ${result.viscosity} / Gas ${result.gas} · Observation complete`;
        announce(`Experiment complete: ${result.style}. Lava flow ${result.flow}, ash height ${result.ash}, intensity ${result.intensity}, and hazard range ${result.hazard}. The historical comparison below is updated; adjust the inputs to run another experiment.`);
      }
    }
    animationFrame = requestAnimationFrame(frame);
  }
  function reset() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    clearTimeout(cameraNoticeTimer); $("camera-notice").classList.remove("visible");
    animationFrame = null; lastResult = null; runNumber = 0;
    Object.entries(sliders).forEach(([key, input]) => { input.value = model.DEFAULTS[key]; });
    setPhase("ready"); updateInputs(); progress(0); scene.reset();
    $("render-status").textContent = "2D geological view · Full scene";
    $("history-card").hidden = true; resultsPanel.dataset.revealed = "false";
    viewButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === "front")));
    partButtons.forEach(button => button.setAttribute("aria-pressed", "false"));
    scene.setPart(null);
    $("part-description").textContent = "Choose a view or feature to begin observing. Ash and lava appear after the eruption starts.";
    Object.entries(metricDefaults).forEach(([key, description]) => {
      $(`${key}-result`).textContent = "—"; $(`${key}-meter`).style.width = "0%"; $(`${key}-description`).textContent = description;
    });
    $("result-context").textContent = "Ready · Results appear after an eruption";
    $("explanation-title").textContent = "Start with one observation"; $("style-badge").textContent = "Awaiting eruption";
    $("explanation-text").textContent = initialExplanation; $("next-experiment").textContent = initialSuggestion;
    $("volcano").setAttribute("aria-label", "Volcano illustration. No eruption yet; text results will appear below after an eruption.");
    announce("Reset complete: viscosity 40, gas 40. The lab is ready for a new experiment.");
  }
  function parametersChanged() {
    if (phase === "running") return;
    updateInputs();
    if (lastResult) {
      $("result-context").textContent = `Results below still belong to experiment ${String(runNumber).padStart(2,"0")} (viscosity ${lastResult.viscosity} / gas ${lastResult.gas})`;
      announce("Inputs changed. Select Trigger eruption to generate results for the new settings.");
      if (!$("history-card").hidden) $("history-context").textContent = `Still matched to experiment ${String(runNumber).padStart(2,"0")} (viscosity ${lastResult.viscosity} / gas ${lastResult.gas}). Run the eruption again to update it.`;
    }
  }
  Object.values(sliders).forEach(input => input.addEventListener("input", parametersChanged));
  presets.forEach(button => button.addEventListener("click", () => {
    if (phase === "running") return;
    const [viscosity, gas] = button.dataset.preset.split(",");
    sliders.viscosity.value = viscosity; sliders.gas.value = gas; parametersChanged();
    announce(`Set to viscosity ${viscosity} / gas ${gas}. Select Trigger eruption to begin; existing results will not change automatically.`);
  }));
  viewButtons.forEach(button => button.addEventListener("click", () => {
    scene.setPart(null);
    scene.setView(button.dataset.view);
    viewButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    partButtons.forEach(item => item.setAttribute("aria-pressed", "false"));
    showCameraNotice(`Switching to ${button.textContent}`);
    $("part-description").textContent = button.dataset.view === "section" ? "Volcano cutaway: observe the red magma reservoir, rising conduit, and gas bubbles." : button.dataset.view === "crater" ? window.VolcanoParts.crater : "Full scene: the volcano, surrounding terrain, and foothill village. Choose a feature to zoom in and read its explanation.";
    $("render-status").textContent = `2D observation view · ${button.textContent} · Inputs unchanged`;
  }));
  partButtons.forEach(button => button.addEventListener("click", () => {
    scene.setPart(button.dataset.part);
    partButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    viewButtons.forEach(item => item.setAttribute("aria-pressed", "false"));
    showCameraNotice(`Moving closer to ${button.textContent}`);
    $("part-description").textContent = window.VolcanoParts[button.dataset.part];
    $("render-status").textContent = `2D observation target · ${button.textContent}`;
  }));
  function showHistory(result) {
    const match = window.VolcanoHistory.match(result);
    $("history-card").hidden = false;
    $("history-context").textContent = `Experiment ${String(runNumber).padStart(2,"0")} · Viscosity ${result.viscosity} / Gas ${result.gas}`;
    $("history-year").textContent = match ? match.year : "—";
    $("history-name").textContent = match ? match.name : "No sufficiently similar case";
    $("history-summary").textContent = match ? match.summary : "This simulation falls between the comparison conditions in the verified case library, so there is not enough evidence for a useful analogy.";
    $("history-similarity").textContent = match ? match.similarity : "No real volcano is forced to match. Compare the lava, ash column, and intensity, or change one input and try again.";
    $("history-limits").textContent = match ? match.limits : "This does not mean similar eruptions do not occur in nature; it only means the current library cannot support a careful match.";
    $("history-source").hidden = !match;
    if (match) { $("history-source").href = match.source; $("history-source").textContent = match.sourceLabel; }
    else { $("history-source").removeAttribute("href"); $("history-source").textContent = ""; }
  }
  $("trigger").addEventListener("click", trigger);
  $("reset").addEventListener("click", reset);
  $("return-overview").addEventListener("click", () => viewButtons.find(button => button.dataset.view === "front").click());
  window.VolcanoLab = { scene, reset };
  updateInputs();
})();

(function () {
  "use strict";
  const model = window.VolcanoModel;
  const $ = (id) => document.getElementById(id);
  const sliders = { viscosity: $("viscosity"), gas: $("gas") };
  const scene = new window.VolcanoScene($("volcano"));
  const duration = 7000;
  let phase = "ready", animationFrame = null, lastResult = null, runNumber = 0;
  const initialExplanation = $("explanation-text").textContent;
  const initialSuggestion = $("next-experiment").textContent;
  const metricDefaults = Object.fromEntries(["flow", "ash", "intensity", "hazard"].map(key => [key, $(`${key}-description`).textContent]));
  function announce(message) { $("notice").textContent = message; }
  function updateInputs() {
    Object.entries(sliders).forEach(([key, input]) => {
      input.value = model.clamp(input.value);
      const grade = model.level(Number(input.value)) + (key === "viscosity" ? "黏度" : "含量");
      $(`${key}-value`).replaceChildren(document.createTextNode(input.value));
      const scale = document.createElement("span"); scale.textContent = " / 100"; $(`${key}-value`).append(scale);
      $(`${key}-level`).textContent = grade;
      input.style.setProperty("--value", `${input.value}%`);
      input.setAttribute("aria-valuetext", `${input.value}，${grade}，教学相对指数，满分 100`);
    });
  }
  function setPhase(next) {
    phase = next;
    const running = phase === "running";
    $("trigger").setAttribute("aria-disabled", String(running));
    // aria-disabled keeps the button focusable so a repeated attempt can be explained.
    Object.values(sliders).forEach(input => { input.disabled = running; });
    $("phase").classList.toggle("running", running);
    $("phase").replaceChildren();
    $("phase").append(document.createElement("i"), document.createTextNode(running ? "喷发进行中" : phase === "finished" ? "实验完成" : "等待实验"));
    $("scene-state").textContent = running ? "ERUPTION IN PROGRESS" : phase === "finished" ? "OBSERVATION COMPLETE" : "SYSTEM READY";
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
    $("flow-description").textContent = result.flow >= 65 ? "流动较快，沿坡铺展较远" : result.flow >= 35 ? "适度铺展，流动距离居中" : "流动缓慢，主要堆积在近处";
    $("ash-description").textContent = result.ash >= 65 ? "高灰柱，向上喷出大量灰粒" : result.ash >= 35 ? "中等灰柱，可见明显灰云" : "低灰柱，火山灰相对较少";
    $("intensity-description").textContent = `${model.level(result.intensity)}强度 · ${result.style}`;
    $("hazard-description").textContent = result.hazard >= 65 ? "影响范围较广 · 仅为教学示意" : result.hazard >= 35 ? "影响范围中等 · 不代表安全线" : "影响范围较小 · 仍可能有危险";
    $("result-context").textContent = `实验 ${String(runNumber).padStart(2,"0")} · 黏度 ${result.viscosity} / 气体 ${result.gas} · 本次参数已锁定`;
    $("explanation-title").textContent = "为什么会这样喷发？";
    $("style-badge").textContent = result.style;
    $("explanation-text").textContent = result.explanation;
    $("next-experiment").textContent = result.suggestion;
    $("volcano").setAttribute("aria-label", `火山示意图：${result.style}。熔岩流动指数 ${result.flow}，火山灰高度指数 ${result.ash}，喷发强度指数 ${result.intensity}，危险范围指数 ${result.hazard}。均为教学指数，满分 100。`);
  }
  function trigger() {
    if (phase === "running") { announce("喷发正在进行，请稍等；不会重复触发。也可以点击 Reset 结束本次实验。"); return; }
    updateInputs();
    lastResult = model.calculate(sliders.viscosity.value, sliders.gas.value);
    runNumber += 1;
    const result = lastResult;
    setPhase("running"); showResults(result); progress(0);
    announce("喷发已开始，参数暂时锁定。观察熔岩、灰柱与虚线范围；约 7 秒后可再次实验。");
    const startTime = performance.now();
    function frame(now) {
      if (phase !== "running") return;
      const elapsed = Math.min(1, (now - startTime) / duration);
      scene.draw(result, elapsed); progress(elapsed);
      if (elapsed < 1) animationFrame = requestAnimationFrame(frame);
      else {
        animationFrame = null; setPhase("finished");
        $("result-context").textContent = `实验 ${String(runNumber).padStart(2,"0")} · 黏度 ${result.viscosity} / 气体 ${result.gas} · 观测完成`;
        announce(`实验完成：${result.style}。熔岩流动 ${result.flow}、灰柱高度 ${result.ash}、强度 ${result.intensity}、危险范围 ${result.hazard}。可调整参数再次触发。`);
      }
    }
    animationFrame = requestAnimationFrame(frame);
  }
  function reset() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null; lastResult = null; runNumber = 0;
    Object.entries(sliders).forEach(([key, input]) => { input.value = model.DEFAULTS[key]; });
    setPhase("ready"); updateInputs(); progress(0); scene.draw();
    Object.entries(metricDefaults).forEach(([key, description]) => {
      $(`${key}-result`).textContent = "—"; $(`${key}-meter`).style.width = "0%"; $(`${key}-description`).textContent = description;
    });
    $("result-context").textContent = "等待实验 · 结果将在触发后生成";
    $("explanation-title").textContent = "从一次观察开始"; $("style-badge").textContent = "等待喷发";
    $("explanation-text").textContent = initialExplanation; $("next-experiment").textContent = initialSuggestion;
    $("volcano").setAttribute("aria-label", "火山示意图。尚未喷发；触发后将在下方显示文字结果。");
    announce("已重置：黏度 40，气体 40。准备好了，可以开始新的实验。");
  }
  Object.values(sliders).forEach(input => input.addEventListener("input", () => {
    if (phase === "running") return;
    updateInputs();
    if (lastResult) {
      $("result-context").textContent = `下方仍为实验 ${String(runNumber).padStart(2,"0")} 的结果（黏度 ${lastResult.viscosity} / 气体 ${lastResult.gas}）`;
      announce("参数已调整。点击 Trigger eruption，生成这组新参数的结果。");
    }
  }));
  $("trigger").addEventListener("click", trigger);
  $("reset").addEventListener("click", reset);
  updateInputs();
})();

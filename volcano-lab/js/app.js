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
  const scene = new window.LiveVolcanoScene($("volcano"), $("render-status"), () => {
    viewButtons.forEach(button => { button.disabled = true; });
  });
  scene.onOrbit = () => {
    viewButtons.forEach(button => button.setAttribute("aria-pressed", "false"));
    if (!scene.fallbackActive) $("render-status").textContent = "自定义观察角度。拖动继续旋转，双指或滚轮缩放；不改变实验参数。";
  };
  const duration = 8500;
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
    $("trigger").disabled = running;
    $("trigger").innerHTML = running ? '<span aria-hidden="true">◉</span> 喷发进行中 <small>请稍候</small>' : triggerDefaultContent;
    Object.values(sliders).forEach(input => { input.disabled = running; });
    presets.forEach(button => { button.disabled = running; });
    $("phase").classList.toggle("running", running);
    $("phase").replaceChildren();
    $("phase").append(document.createElement("i"), document.createTextNode(running ? "喷发进行中" : phase === "finished" ? "实验完成" : "等待实验"));
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
    $("history-card").hidden = true; resultsPanel.dataset.revealed = "false";
    setPhase("running"); showResults(result); progress(0);
    scene.playCue(result);
    announce("喷发已开始，参数暂时锁定。先观察压力积累，再留意岩浆、灰柱与喷出物；约 9 秒后可再次实验。");
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
        $("result-context").textContent = `实验 ${String(runNumber).padStart(2,"0")} · 黏度 ${result.viscosity} / 气体 ${result.gas} · 观测完成`;
        announce(`实验完成：${result.style}。熔岩流动 ${result.flow}、灰柱高度 ${result.ash}、强度 ${result.intensity}、危险范围 ${result.hazard}。下方历史喷发对照已更新，可调整参数再次触发。`);
      }
    }
    animationFrame = requestAnimationFrame(frame);
  }
  function reset() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null; lastResult = null; runNumber = 0;
    Object.entries(sliders).forEach(([key, input]) => { input.value = model.DEFAULTS[key]; });
    setPhase("ready"); updateInputs(); progress(0); scene.reset();
    if (!scene.fallbackActive) $("render-status").textContent = "3D 模型已就绪 · 正面视角";
    $("history-card").hidden = true; resultsPanel.dataset.revealed = "false";
    viewButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === "front")));
    partButtons.forEach(button => button.setAttribute("aria-pressed", "false"));
    scene.setPart(null);
    $("part-description").textContent = "选择视角或部位开始观察。灰云和熔岩会在喷发后出现。";
    Object.entries(metricDefaults).forEach(([key, description]) => {
      $(`${key}-result`).textContent = "—"; $(`${key}-meter`).style.width = "0%"; $(`${key}-description`).textContent = description;
    });
    $("result-context").textContent = "等待实验 · 结果将在触发后生成";
    $("explanation-title").textContent = "从一次观察开始"; $("style-badge").textContent = "等待喷发";
    $("explanation-text").textContent = initialExplanation; $("next-experiment").textContent = initialSuggestion;
    $("volcano").setAttribute("aria-label", "火山示意图。尚未喷发；触发后将在下方显示文字结果。");
    announce("已重置：黏度 40，气体 40。准备好了，可以开始新的实验。");
  }
  function parametersChanged() {
    if (phase === "running") return;
    updateInputs();
    if (lastResult) {
      $("result-context").textContent = `下方仍为实验 ${String(runNumber).padStart(2,"0")} 的结果（黏度 ${lastResult.viscosity} / 气体 ${lastResult.gas}）`;
      announce("参数已调整。点击 Trigger eruption，生成这组新参数的结果。");
      if (!$("history-card").hidden) $("history-context").textContent = `仍对应实验 ${String(runNumber).padStart(2,"0")}（黏度 ${lastResult.viscosity} / 气体 ${lastResult.gas}），请重新触发以更新。`;
    }
  }
  Object.values(sliders).forEach(input => input.addEventListener("input", parametersChanged));
  presets.forEach(button => button.addEventListener("click", () => {
    if (phase === "running") return;
    const [viscosity, gas] = button.dataset.preset.split(",");
    sliders.viscosity.value = viscosity; sliders.gas.value = gas; parametersChanged();
    announce(`已设置黏度 ${viscosity} / 气体 ${gas}。点击 Trigger eruption 开始，已有结果不会自动改变。`);
  }));
  viewButtons.forEach(button => button.addEventListener("click", () => {
    scene.setPart(null);
    scene.setView(button.dataset.view);
    viewButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    partButtons.forEach(item => item.setAttribute("aria-pressed", "false"));
    showCameraNotice(`正在切换至${button.textContent}视角`);
    if (!scene.fallbackActive) $("render-status").textContent = `正在平滑切换至${button.textContent}视角。镜头移动不会改变实验参数。`;
  }));
  partButtons.forEach(button => button.addEventListener("click", () => {
    scene.setPart(button.dataset.part);
    partButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    viewButtons.forEach(item => item.setAttribute("aria-pressed", "false"));
    showCameraNotice(`正在靠近${button.textContent}`);
    $("part-description").textContent = window.VolcanoParts[button.dataset.part];
  }));
  function showHistory(result) {
    const match = window.VolcanoHistory.match(result);
    $("history-card").hidden = false;
    $("history-context").textContent = `实验 ${String(runNumber).padStart(2,"0")} · 黏度 ${result.viscosity} / 气体 ${result.gas}`;
    $("history-year").textContent = match ? match.year : "—";
    $("history-name").textContent = match ? match.name : "没有足够相似的案例";
    $("history-summary").textContent = match ? match.summary : "本次模拟的表现介于已核实案例的对照条件之间。当前案例库不足以给出恰当类比。";
    $("history-similarity").textContent = match ? match.similarity : "不强行对应真实火山。可以继续比较本次熔岩、灰柱与强度，或调整一个参数再试。";
    $("history-limits").textContent = match ? match.limits : "这不意味着自然界没有类似喷发，只表示这里没有足够依据选择案例。";
    $("history-source").hidden = !match;
    if (match) { $("history-source").href = match.source; $("history-source").textContent = match.sourceLabel; }
    else { $("history-source").removeAttribute("href"); $("history-source").textContent = ""; }
  }
  $("trigger").addEventListener("click", trigger);
  $("reset").addEventListener("click", reset);
  updateInputs();
})();

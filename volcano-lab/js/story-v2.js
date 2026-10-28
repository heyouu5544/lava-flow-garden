(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const chapters = [
    { tag: "01 / 火山与聚落", title: "这座山并不是孤立的。", text: "火山塑造地形，也和道路、农田、水源与聚落共享同一片环境。画面里的村庄只帮助我们理解尺度，不是需要保护或评分的游戏目标。", shot: "village" },
    { tag: "02 / 岩浆黏度", title: "黏度决定岩浆有多难流动。", text: "较稀的岩浆像稀糖浆，容易沿沟壑快速铺展并产生分支；黏稠岩浆移动缓慢，更容易在火山口附近形成厚流或穹丘。真实黏度还受温度、成分和晶体影响。", shot: "slope", sample: [15, 15] },
    { tag: "03 / 气体含量", title: "上升的岩浆会释放并膨胀气体。", text: "气体丰富时，喷泉、火花与喷出物会增加。若黏稠岩浆阻碍气体逸出，压力可能积累并形成更猛烈的爆炸与高灰柱。", shot: "crater", sample: [85, 85] },
    { tag: "04 / 喷发阶段", title: "喷发会经历积累、释放与稳定。", text: "先观察火山口的压力迹象，随后会出现喷发闪光、烟灰、火山弹与岩浆流；最后灰云漂移，熔岩表面逐渐形成暗色冷却岩壳。", shot: "observe", sample: [20, 80] },
    { tag: "05 / 开始实验", title: "现在，调整两个参数，观察画面如何改变。", text: "先尝试四种典型组合，再保持一个参数不变、只移动另一个滑块。结果是连续的教学模型，不是对真实火山的复现或预测。", shot: "observe" }
  ];
  let openingScene = null, scene = null, chapterIndex = 0, transition = false, tourTimers = [], idleFrame = null;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function disposeOpening() {
    if (idleFrame !== null) cancelAnimationFrame(idleFrame);
    idleFrame = null; openingScene?.renderer?.dispose?.(); openingScene = null;
  }

  function idleOrbit() {
    if (openingScene?.renderer) openingScene.renderer.orbitBy(.00055, 0);
    idleFrame = requestAnimationFrame(idleOrbit);
  }

  function prepareOpening() {
    openingScene = new window.LiveVolcanoScene($("opening-volcano"), $("opening-render-status"));
    openingScene.tourShot("wide", 0); idleOrbit();
  }

  function setTourCaption(label, text) {
    $("camera-readout").textContent = label; $("shot-caption").textContent = text;
  }

  function schedule(delay, fn) { const id = setTimeout(fn, delay); tourTimers.push(id); }
  function cancelTour() { tourTimers.forEach(clearTimeout); tourTimers = []; }

  function showDialogue() {
    cancelTour(); $("cg-dialogue").hidden = false; setTourCaption("OBSERVATION POSITION", "镜头已停在适合观察火山的位置");
    chapterIndex = 0; showChapter();
  }

  function runTour(skipMotion = false) {
    if (skipMotion || reduced()) { scene.tourShot("observe", 0); showDialogue(); return; }
    const sequence = [
      [0, "wide", "全景环绕", "远山、火山与聚落构成完整环境"],
      [2700, "village", "接近村庄", "道路、农田、水渠与石屋沿山脚展开"],
      [5500, "slope", "接近山体", "不对称山脊与沟壑引导熔岩下行"],
      [8200, "crater", "接近火山口", "外缘、内壁、裂隙与内部熔岩光"],
      [10800, "observe", "进入观察位置", "准备开始知识介绍"]
    ];
    sequence.forEach(([delay, shot, label, text]) => schedule(delay, () => { scene.tourShot(shot, 2200); setTourCaption(label, text); }));
    schedule(12900, showDialogue);
  }

  function startCinematic(skipMotion = false) {
    if (transition) return; transition = true; disposeOpening(); $("opening").hidden = true; $("cinematic").hidden = false; window.scrollTo(0, 0);
    scene = new window.LiveVolcanoScene($("cinematic-volcano"), $("cinematic-status"), () => $("shot-caption").textContent = "三维场景不可用，知识介绍仍可继续");
    scene.draw(window.VolcanoModel.calculate(25, 25), 1); transition = false; runTour(skipMotion);
  }

  function showChapter() {
    const chapter = chapters[chapterIndex]; $("chapter-tag").textContent = chapter.tag; $("dialogue-title").textContent = chapter.title; $("dialogue-text").textContent = chapter.text;
    $("dialogue-progress").textContent = `${String(chapterIndex + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
    $("continue-dialogue").textContent = chapterIndex === chapters.length - 1 ? "进入实验室 →" : "继续 →";
    scene.tourShot(chapter.shot, 1150); scene.draw(chapter.sample ? window.VolcanoModel.calculate(...chapter.sample) : null, chapter.sample ? 1 : 0);
    $("dialogue-title").focus({ preventScroll: true });
  }

  function goLab() {
    if (transition) return; transition = true; cancelTour(); document.body.classList.add("leaving");
    setTimeout(() => { location.href = new URLSearchParams(location.search).get("render") === "2d" ? "lab.html?render=2d" : "lab.html"; }, reduced() ? 0 : 320);
  }

  $("start-exploring").addEventListener("click", () => startCinematic(false));
  $("skip-intro").addEventListener("click", goLab);
  $("skip-lesson").addEventListener("click", goLab);
  $("continue-dialogue").addEventListener("click", () => { if (chapterIndex < chapters.length - 1) { chapterIndex++; showChapter(); } else goLab(); });
  window.addEventListener("pageshow", () => { document.body.classList.remove("leaving"); transition = false; });
  prepareOpening();
  if (new URLSearchParams(location.search).get("step") === "lesson") startCinematic(true);
})();

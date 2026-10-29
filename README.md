# Volcano Lab

**Current project · PFAD Assignment 3 · Cai Zhichun**

A colorful, hand-painted 2D interactive volcano laboratory. Explore a short illustrated opening and guided lessons, then adjust magma viscosity and gas content to see how they change an eruption.

## ▶ Play the current version

**[Launch Volcano Lab in your browser](https://heyouu5544.github.io/lava-flow-garden/volcano-lab/)**  
[Go directly to the experiment](https://heyouu5544.github.io/lava-flow-garden/volcano-lab/lab.html)

No installation is needed for the online version. The current project lives in **[`volcano-lab/`](./volcano-lab/)**.

![Current Volcano Lab title screen](./volcano-lab/screenshots/storybook-01-title.png)

## What to try

1. Choose **Start exploring** to watch the illustrated opening and read the five short lessons. You can skip or replay the introduction.
2. Adjust **magma viscosity** and **gas content**, or choose a preset combination.
3. Select **Trigger eruption** and observe the lava, ash cloud, eruption intensity, and hazard-range indicators.
4. Compare the explanation and historical eruption analogy with the visual result.
5. Explore the crater, ash cloud, lava flow, village, or mountain cross-section. Use **Reset** to start again.

During an eruption, controls prevent overlapping runs and explain repeated trigger attempts. Reset can cancel the current experiment. Keyboard controls and a responsive mobile layout are included.

![Current experiment and hand-painted volcano scene](./volcano-lab/screenshots/storybook-04-lab.png)

![Eruption results and historical comparison](./volcano-lab/screenshots/storybook-05-results.png)

## Project documents

- [Current source code and full running instructions](./volcano-lab/)
- [Current development process and user-test plan](./volcano-lab/PROCESS.md)
- [Asset sources, original artwork, and credits](./volcano-lab/ASSETS.md)
- [Developer verification and screenshots](./volcano-lab/VERIFICATION.md)

**User testing:** developer checks are documented separately from participant testing. A real classmate trial and the resulting design change are still pending; automated checks are not presented as user-test evidence.

## Run locally

Download or clone this repository, then run from the repository root:

```sh
node volcano-lab/serve.cjs
```

Open `http://127.0.0.1:4173/`. The project uses native HTML, CSS, JavaScript, and Canvas with no npm runtime dependencies. You can also open `volcano-lab/index.html` directly.

## Educational model

The sliders and result indicators are relative teaching indices. They are not real gas percentages, physical heights or distances, VEI measurements, or real safety boundaries. Historical cases illustrate similarities in eruption behavior; two parameters cannot reproduce or predict a real eruption.

## Development history

This repository began with **Last 30 Seconds**, a grid prototype followed by a 3D village-defense game. The project later changed direction to **Volcano Lab**, an educational experiment, and then adopted the current colorful 2D storybook presentation.

Earlier files at the repository root and all previous commits are preserved as development history. **For the current submission, use `volcano-lab/` and the links above.** The repository name remains `lava-flow-garden` so the original submission URL and history stay available.

---

The current submission is the colorful, hand-painted 2D Volcano Lab. Use the live links above; current source, process notes, credits, and verification are in `volcano-lab/`. The older disaster-response game files at the repository root remain as development history.

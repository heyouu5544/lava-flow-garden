# Verification Record

Date: 2026-10-30 (Asia/Shanghai).

Test environment: locally installed Microsoft Edge, driven headlessly through native CDP against the preview from the actual repository path at `http://127.0.0.1:4173/`. The browser script sends real mouse and keyboard events, checks hit targets with `elementFromPoint`, captures console/runtime errors, and writes current screenshots. These are developer checks and visual review, not a participant study.

## Results

- Model and historical-case unit tests: **8 / 8 passed**, including every 0–100 input pair, bounds, monotonic relationships, and analogy limits.
- Active JavaScript syntax checks and Git whitespace checks passed.
- The complete desktop and mobile browser regression passed with **0 console errors or uncaught exceptions**.
- Current English screenshots cover the title, opening, lesson, lab, four eruptions, results/history, observation targets, cutaway, and mobile layouts.

| Check | Verified result |
| --- | --- |
| Title and ambient scene | `VOLCANO LAB`, `Start exploring`, and direct lab entry are visible; clouds, particles, and lava animate |
| Cinematic opening | The approximately nine-second sequence visits wide terrain, village, slope, crater, and cutaway before the lesson |
| Lesson | First activation reveals the full paragraph; the next advances; all five chapters reach the lab; Enter and Space work |
| Skip and replay | Skip tour, skip introduction, Escape, direct lab entry, and replay introduction all work |
| Sliders | Mouse and Home / End / ArrowRight change values; live output and 0, 1, 100 boundaries are correct |
| Four presets | Fill, deep-violet outline, and selected mark update; four eruptions run sequentially without reload |
| Trigger eruption | The hit target works, inputs lock, progress increases, results unlock, and another run becomes available |
| Repeat protection | A second trigger during a run shows an English `already in progress` notice and does not create another eruption |
| Results and history | Every run produces four metrics, an explanation, and a sourced analogy; changed inputs do not rewrite the previous run |
| Observation tools | Crater, ash cloud, lava flow, and village move and highlight the target; Return to overview and cutaway work |
| Reset | After completion it restores 40/40, clears results, and hides history; during a run it cancels progress; another eruption then completes |
| Unobstructed controls | Center-point hit tests pass for title, skip, continue, Trigger, Reset, presets, and observation controls |
| Mobile flow | At 390×844 the title → lesson → lab → eruption → results flow passes with no horizontal overflow |
| Compact layouts | 320×568, 844×390, and 768×1024 keep both opening actions visible and clickable with no overflow or console errors |
| Reduced motion | The camera tour is skipped, dialogue appears immediately, and Escape enters the lab |
| English-only active experience | Active HTML, loaded scripts, Canvas labels, accessibility text, notices, and tests contain no Han characters |

## Four verified result combinations

All values are relative 0–100 teaching indices.

| Viscosity / Gas | Lava flow | Ash height | Intensity | Hazard range | Historical analogy |
| --- | --- | --- | --- | --- | --- |
| 15 / 15 | 63 | 8 | 11 | 41 | Maunaulu effusive phase |
| 15 / 85 | 82 | 36 | 38 | 53 | Maunaulu fountain phase |
| 85 / 15 | 18 | 15 | 18 | 17 | Mount St. Helens dome growth |
| 85 / 85 | 21 | 77 | 77 | 72 | Mount Pinatubo explosive eruption |

The screenshots show long fluid flows, short thick viscous flows and near-vent buildup, plus stronger fountains, ejecta, ash columns, and umbrella clouds in gas-rich runs. They must not be read as real scale or hazard maps.

## Current English screenshots

All current colorful screenshots use the `storybook-` prefix in `screenshots/`. Older JPG files remain as historical material.

- `storybook-01-title.png`: English title and animated volcano cover.
- `storybook-02-cinematic.png`: parallax village shot.
- `storybook-03-lesson.png`: English cream-colored hand-drawn dialogue.
- `storybook-04-lab.png`: desktop English experiment interface.
- `storybook-05-results.png`: four results, explanation, and historical source.
- `storybook-06-village.png` / `storybook-07-section.png`: village highlight / magma cutaway.
- `storybook-eruption-15-15.png`, `15-85.png`, `85-15.png`, `85-85.png`: each parameter combination during eruption.
- `storybook-08-mobile-title.png` through `storybook-12-mobile-results.png`: 390×844 title, lesson, lab, controls, and results.
- `storybook-layout-320-568.png`, `storybook-layout-844-390.png`, `storybook-layout-768-1024.png`: compact portrait, landscape, and tablet covers.

## Reproduce

Run `node volcano-lab/serve.cjs` in one terminal, then:

```powershell
node --test volcano-lab/tests/model.test.cjs volcano-lab/tests/history.test.cjs
node --check volcano-lab/js/model.js
node --check volcano-lab/js/scene.js
node --check volcano-lab/js/observer.js
node --check volcano-lab/js/history.js
node --check volcano-lab/js/app.js
node --check volcano-lab/js/story.js
node volcano-lab/tests/browser-smoke.cjs
node volcano-lab/tests/browser-smoke.cjs --layouts-only
```

Physical touch-device, Safari, Firefox, and real participant research remain untested. Automated checks and screenshots are not described as user research.

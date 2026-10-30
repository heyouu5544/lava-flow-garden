# Implementation Log

Date: 2026-10-29 (Asia/Shanghai).

## Colorful storybook redesign

1. Inspected the workspace and confirmed the actual Git repository rather than editing a separate preview copy. The repository is now `https://github.com/heyouu5544/volcano-lab.git`, and its existing history is preserved.
2. Derived a high-saturation palette of lake blue, blue-violet, coral orange, bright yellow, and cream from the three user-provided visual references. The references informed color, texture, and dialogue-box structure only; no book title, author credit, finished illustration, or screenshot was copied.
3. Rebuilt the Canvas artwork with original distant mountains, irregular rock layers, stones, vegetation, foreground, houses, fields, canals, clouds, lava, ash, and debris. Separate cached layers move at different speeds during the cinematic opening.
4. Added `storybook.css` to unify the cover, dialogue, controls, sliders, observation tags, result cards, historical comparison, and notices. Default, hover, pressed, selected, disabled, and keyboard-focus states remain distinct, and decorative layers do not intercept pointer input.
5. Organized the lesson into five single-topic chapters. Typed text can be revealed immediately, and the flow supports buttons, Enter, Space, Escape, skip, replay, and reduced motion.
6. Preserved the teaching formulas, four results, explanations, repeat-trigger protection, Reset lifecycle, observation tools, village setting, and sourced historical analogies. Visuals distinguish long fluid flows, short viscous buildup, gas-rich fountains, ash columns, and debris.
7. Verified the full experience in an installed Microsoft Edge browser through local CDP input, plus unit and syntax checks. These are developer checks, not a participant study.

The redesign was committed as `d4b4501` with `Redesign Volcano Lab with colorful hand-painted visuals`. Commit `87a3db4` then made Volcano Lab the repository homepage.

## Preview-root audit

An earlier service on port 4173 was found to serve a separate outer preview copy that still loaded `print.css`. Hash comparison identified the mismatch. The service was restarted from the absolute repository path, and `serve.cjs` was extended to print the served root, return `X-Volcano-Lab-Root`, and expose `/__preview.json` with the entry-file SHA-256. This makes the actual source of a preview verifiable.

## English release

1. Saved all local preview/document changes in Git stash, fast-forwarded `main` to `87a3db4`, then restored the local work without overwriting remote history.
2. Translated the active HTML, story, controls, Canvas labels, model explanations, historical cases, status messages, errors, accessibility labels, tooltips, and tests into concise English. Set both active HTML entry points to `lang="en"` and removed duplicated bilingual labels.
3. Updated the repository README and all current project documents in English. Historical development files remain for provenance, while current GitHub-facing content and screenshots describe the English release.
4. Adjusted and reran the same complete browser flow, all four parameter combinations, observation views, Reset paths, replay/skip behavior, reduced motion, and compact layouts. Current results are recorded in `VERIFICATION.md`.

## User Testing and Iteration

Liu Ling found that some buttons did not respond clearly enough and that the reaction after clicking felt slow. In response, the revision added immediate visual feedback: buttons show a clear pressed state while being clicked, preset and observation buttons retain a selected state, and status text changes as soon as an action begins. **Trigger eruption** immediately changes to a running state while the simulation is active. Repeated clicks during an eruption display a clear message instead of starting overlapping animation, and **Reset** can cancel the current experiment.

Yin Shiqi felt that the original black-and-white visual style did not suit an educational interactive experience. This feedback led to the colorful hand-painted 2D redesign, covering the opening cinematic, teaching dialogue, volcano scene, controls, buttons, result panels, and observation interface.

These changes were based on participant feedback. Participant retesting after the revisions has not yet been documented. Automated checks and developer screenshot review are not presented as participant retesting.

## Repository Rename

The GitHub repository was renamed to `heyouu5544/volcano-lab` without rewriting or deleting history. The local `origin` now points to `https://github.com/heyouu5544/volcano-lab.git`. Because the current site remains in the repository's `volcano-lab/` subdirectory, its GitHub Pages entry is `https://heyouu5544.github.io/volcano-lab/volcano-lab/`.

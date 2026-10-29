# Implementation Log

Date: 2026-10-29 (Asia/Shanghai).

## Colorful storybook redesign

1. Inspected the workspace and confirmed that `github-sync/lava-flow-garden/` is the actual Git repository, with `https://github.com/heyouu5544/lava-flow-garden.git` as `origin`. Existing history was preserved.
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

## Participant testing status

A real classmate or student trial is still pending. Future observation should check whether participants distinguish viscosity from gas content, change one variable at a time, and understand that the historical comparison is an analogy rather than a forecast. Automated checks and developer screenshot review are not presented as participant evidence.

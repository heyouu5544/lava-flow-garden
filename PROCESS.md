# Process log

## Starting idea

I wanted to keep the volcano theme from my earlier work while making a new interactive experience rather than extending the old data visualisation. The game asks the player to protect a village by redirecting lava.

## First prototype

The first version uses one fixed terrain map, three outlet choices, a 30-second live round, and up to three movable rock barriers. The map previews the route, then shows the moving flow and village safety report. Keeping the project to one round makes the main action and its response easy to test.

## AI tools and decisions

I used ChatGPT to refine the game concept and generate the first HTML/CSS/JavaScript prototype. I kept the suggestion to make each barrier placement and outlet choice immediately update the route forecast, because it makes the relationship between input and response visible. An early idea included a pause control; I left it out after choosing a continuously advancing flow and countdown, which better fits the intended time pressure. I will review and explain the route and scoring code myself.

## User trial and iteration

**Pending.** Before submission, ask at least one person to try the game before explaining it. Record:

- What they tried first:
- Where they hesitated or misunderstood something:
- What I changed after watching them (or why I kept the design):

Do not add the tester's name or private details.

## Revision 2 — 3D terrain (2026-10-26)

The first prototype used a visible square grid. I requested a 3D volcano model and a 3D map because the flat grid did not convey the volcanic landscape I wanted.

The revision replaces the tile interface with a WebGL scene: a procedural mountain and crater, a recessed lava pool, a coastal village, rock models, smoke, and embers. Dragging rotates the camera and scrolling zooms. Clicking the visible mountain uses raycasting to place a barrier; dragging is detected separately to prevent accidental placement. A top view helps inspect terrain hidden by the slope. The three-barrier limit, outlet choices, live countdown, route preview and safety report remain.

Pathfinding uses hidden terrain samples with an uphill cost and barrier footprints. These samples support the logic but are not displayed as squares. A glowing lava tube advances over the actual mountain surface. Three.js is included locally with its MIT license so the project can run without internet access.

AI assistance: ChatGPT/Codex generated this revision and ran development checks. Automated checks are not a substitute for the required real user trial. The trial section above is still pending.

### Development verification

Checked in headless Chromium using local file loading: the 3D scene rendered without JavaScript runtime errors; placement and removal worked; a fourth barrier was rejected; dragging did not place barriers; outlet switching and reset worked. A complete live round reached Western Bay and produced a 100/100 safety report. A 390-pixel viewport was checked for horizontal overflow. These are development checks, not observations from a real participant.

## Revision 3 — expanded map, village and game systems (2026-10-26)

I found the 3D scene too small, too dark and visually simple. The village also looked like a small cluster rather than a place worth protecting, and the round did not provide enough information for strategic decisions.

I enlarged the interface and 3D terrain, raised the exposure and night lighting, and added a moon, stars, brighter terrain colours and stronger village lights. The settlement now has three named districts: Old Town, River Ward and Farm Ridge. Together they contain 30 generated houses and 780 residents. Roads, trees, streetlights, a clock tower, detailed roofs, windows, chimneys and doors make the village easier to read as a lived-in place.

The player still uses three barriers and an outlet choice, preserving the original concept. Gameplay now includes live resident and building counters, district-specific route warnings, and two seismic surges that accelerate lava after 10 and 20 seconds. The final report weighs resident safety, damaged buildings and whether lava reached an outlet. A dangerous route changes the forecast colour and names the threatened districts.

### Development verification

Checked in headless Chromium: the expanded scene rendered without JavaScript errors; three barriers could be placed; a fourth was rejected; dragging did not place a barrier; changing outlets updated the forecast; reset restored all resources; both intensity stages appeared; a complete round produced a report; and a 390-pixel viewport had no horizontal overflow. A real participant observation is still required before final course submission.

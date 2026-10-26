# Last 30 Seconds — 3D Volcano Defense

Protect a village during a volcanic eruption. Place up to three rock barriers on a three-dimensional mountain, choose one of three outlets, and redirect the advancing lava before the 30-second response window closes.

## Run

Extract the entire ZIP, keep all files together, and open `index.html` in Chrome or Edge. No installation or internet connection is required: Three.js is included locally. In VS Code, you may also open this folder with Live Server. A browser with WebGL/hardware acceleration is required.

## Controls

- **Click dry terrain:** place a rock barrier, up to three.
- **Click a placed rock:** remove it, freeing a barrier slot.
- **Drag:** orbit the 3D volcano; **mouse wheel:** zoom.
- **Reset view / Top view:** return to the starting angle or inspect the terrain from above.
- **Outlet buttons:** choose Western Bay, Eastern Quarry, or North Basin.
- **Start response:** begin the 30-second round. Barriers and outlets can still be changed while lava moves.
- **Reset:** clear the round and try again.

Gold dashes show the forecast. Orange glowing tubes show the actual lava trail. The red boundary surrounds the village danger zone. Invalid placements and exhausted barrier supplies produce visible feedback. Camera movement does not place barriers.

## Result and scoring

The score starts at 100. Each distinct navigation sample reached inside the village danger zone costs 18 points. Failure to reach the selected outlet within 30 seconds costs 24 points. Scores are clamped at zero. Feedback explains whether the route endangered the village or failed to reach an outlet.

## Implementation

- `index.html`: interface and styles.
- `game.js`: procedural 3D terrain, camera, raycast interaction, pathfinding, lava progression, and results.
- `three.min.js`: locally bundled Three.js 0.160.0.
- `THREE-LICENSE.txt`: Three.js MIT license.
- `PROCESS.md`: decisions, development checks, and pending user trial.

The 3D mountain has a crater, sloping terrain, a recessed lava pool, rocky coast, houses, smoke and embers. Models and effects are generated in code. Navigation samples remain internal; there is no visible or clickable square grid. The routing cost penalizes climbing and avoids barrier footprints; this is a game abstraction, not a physical lava simulation. Switching outlets acts as an abstract diversion command.

## Credits

Developed with ChatGPT/Codex assistance for concept refinement, code generation, and debugging. Three.js by the Three.js authors, MIT license: https://threejs.org/ (source release: https://github.com/mrdoob/three.js/tree/r160). All terrain, houses, rocks, smoke texture and visual effects are generated in this project. No downloaded imagery or real volcanic dataset is used.

## Known limitations

One fixed terrain and English interface. No real hazard prediction. Touch supports dragging and view buttons; wheel zoom is intended for a mouse. 3D map placement is pointer-based. A real user trial and its resulting iteration still need to be recorded in `PROCESS.md` before the final course submission.

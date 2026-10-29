# Artwork, Reference, and Data Sources

## Original artwork

Every visible current scene is drawn with Canvas paths in `js/scene.js`; the interface is drawn with CSS in `storybook.css`. No third-party illustration, complete book spread, or external font is downloaded or embedded.

- Background: lake-blue sky, cream sun, lavender mountains, and deep-blue woodland, cached as separate parallax layers.
- Volcano: an original silhouette with irregular blue-violet and pastel rock strata, dry-brush marks, stones, a coral crater, and bright-yellow lava.
- Environment: original trees, purple rocky ground, coral roofs, cream walls, blue canals, pink-violet fields, roads, and a fictional foothill village.
- Motion: layered cream, gray-blue, and pale-purple clouds; moving lava strokes; fountain arcs; ejecta; bubbles; and ash columns. Inputs control flow speed, length, thickness, dome growth, jets, and ash form.
- Texture: deterministic pseudo-random grain, paint overlap, rough path edges, and brush marks. Canvas texture is cached, while an embedded CSS SVG noise pattern gives the interface a light paper grain.
- Typography: system `Impact` / `Arial Black` headings and Segoe UI body text. Skew, offset outlines, paper texture, and uneven radii create the hand-painted component style.

The first two user-uploaded volcano storybook images and the third dialogue-box image were used only as references for palette, brush character, and structural direction. Their titles, author text, finished illustrations, and screenshots are not used. The composition and assets are original.

## Science and historical references

The teaching model and historical comparisons cite:

- [USGS · How do volcanoes erupt?](https://www.usgs.gov/faqs/how-do-volcanoes-erupt)
- [USGS · 1969–1974 Maunaulu Eruption](https://www.usgs.gov/volcanoes/kilauea/science/1969-1974-maunaulu-eruption)
- [USGS · 2004–2008 Renewed Volcanic Activity at Mount St. Helens](https://www.usgs.gov/volcanoes/mount-st.-helens/science/2004-2008-renewed-volcanic-activity)
- [USGS · The Cataclysmic 1991 Eruption of Mount Pinatubo](https://pubs.usgs.gov/fs/1997/fs113-97/)

The illustrated village and terrain are fictional. The model and cases support comparison only: they do not reconstruct an event, infer real magma values, predict an eruption, or define a safety boundary. Earlier visual versions remain in Git history and historical files but are not loaded by the current page.

# Portfolio

2025 Edition.

![Screenshot](Screenshot.png)

Featuring: Less JavaScript and more modern CSS.

## Responsive images

This repo includes a simple image pipeline to generate responsive assets and a JSON map consumed by the site.

1. Put your original images in `img/` named like `project-<slug>.jpg`.
2. Install deps and run the build:
   - `npm install`
   - `npm run build:images`
3. Output goes to `img/optimized/<slug>/` and a map is written to `js/images-map.json` used automatically by the site.

No changes to HTML are required; the grid and featured image will use `srcset`/`sizes` when the map is present.